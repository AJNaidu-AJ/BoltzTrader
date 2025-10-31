from celery_app import celery_app
from supabase import create_client
import httpx
import time
import os
from datetime import datetime
from typing import Dict, Any

# Initialize Supabase
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY")
supabase = create_client(supabase_url, supabase_key)

broker_service_url = os.getenv("BROKER_SERVICE_URL", "http://localhost:3002")

@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def execute_order(self, order_payload: Dict[str, Any]):
    """Execute order through broker adapter with latency tracking"""
    order_id = order_payload.get("order_id")
    
    try:
        # Update order status to processing
        supabase.table("trades").update({
            "status": "processing",
            "metadata": {"execution_started_at": datetime.now().isoformat()}
        }).eq("id", order_id).execute()
        
        # Track execution latency
        start_time = time.time()
        
        # Call broker service
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{broker_service_url}/place-order",
                json=order_payload,
                timeout=30.0
            )
            
        execution_latency = (time.time() - start_time) * 1000  # Convert to ms
        
        if response.status_code == 200:
            result = response.json()
            
            # Update order with execution result
            update_data = {
                "status": result.get("status", "filled"),
                "broker_order_id": result.get("brokerOrderId"),
                "filled_at": datetime.now().isoformat() if result.get("status") == "filled" else None,
                "metadata": {
                    "execution_latency_ms": execution_latency,
                    "execution_completed_at": datetime.now().isoformat(),
                    "broker_response": result
                }
            }
            
            supabase.table("trades").update(update_data).eq("id", order_id).execute()
            
            # Log execution metrics
            log_execution_metrics(order_payload, execution_latency, "success")
            
            return {
                "status": "completed",
                "order_id": order_id,
                "execution_latency_ms": execution_latency,
                "broker_result": result
            }
            
        else:
            raise Exception(f"Broker service error: {response.status_code} - {response.text}")
            
    except Exception as e:
        # Log execution metrics for failure
        log_execution_metrics(order_payload, 0, "failed", str(e))
        
        # Update order status to failed
        supabase.table("trades").update({
            "status": "failed",
            "metadata": {
                "error": str(e),
                "failed_at": datetime.now().isoformat(),
                "retry_count": self.request.retries
            }
        }).eq("id", order_id).execute()
        
        # Retry logic
        if self.request.retries < self.max_retries:
            raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))
        
        return {
            "status": "failed",
            "order_id": order_id,
            "error": str(e),
            "retry_count": self.request.retries
        }

@celery_app.task
def retry_failed_order(order_id: str):
    """Retry a failed order"""
    try:
        # Get order details
        result = supabase.table("trades").select("*").eq("id", order_id).single().execute()
        
        if not result.data:
            return {"status": "error", "message": "Order not found"}
        
        order = result.data
        
        # Prepare order payload for retry
        order_payload = {
            "order_id": order_id,
            "userId": order["user_id"],
            "symbol": order["symbol"],
            "side": order["side"],
            "quantity": order["quantity"],
            "orderType": order["order_type"],
            "price": float(order["price"]) if order["price"] else None,
            "broker": order["broker"],
            "isPaperTrade": order["is_paper_trade"]
        }
        
        # Execute the retry
        return execute_order.delay(order_payload)
        
    except Exception as e:
        return {"status": "error", "message": str(e)}

def log_execution_metrics(order_payload: Dict[str, Any], latency_ms: float, status: str, error: str = None):
    """Log execution metrics for monitoring"""
    metrics_data = {
        "order_id": order_payload.get("order_id"),
        "symbol": order_payload.get("symbol"),
        "broker": order_payload.get("broker", "paper"),
        "execution_latency_ms": latency_ms,
        "status": status,
        "error": error,
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        # Log to execution_metrics table (create if needed)
        supabase.table("execution_metrics").insert(metrics_data).execute()
    except Exception as e:
        print(f"Failed to log metrics: {e}")

@celery_app.task
def calculate_pnl(user_id: str, symbol: str = None):
    """Calculate PnL for user positions"""
    try:
        query = supabase.table("trades").select("*").eq("user_id", user_id).eq("status", "filled")
        
        if symbol:
            query = query.eq("symbol", symbol)
            
        result = query.execute()
        trades = result.data
        
        positions = {}
        total_pnl = 0
        
        for trade in trades:
            symbol = trade["symbol"]
            if symbol not in positions:
                positions[symbol] = {"quantity": 0, "avg_cost": 0, "total_cost": 0}
            
            pos = positions[symbol]
            trade_value = trade["quantity"] * trade["filled_price"]
            
            if trade["side"] == "buy":
                pos["total_cost"] += trade_value
                pos["quantity"] += trade["quantity"]
                pos["avg_cost"] = pos["total_cost"] / pos["quantity"] if pos["quantity"] > 0 else 0
            else:  # sell
                if pos["quantity"] > 0:
                    sold_cost = (trade["quantity"] / pos["quantity"]) * pos["total_cost"]
                    pnl = trade_value - sold_cost
                    total_pnl += pnl
                    
                    pos["quantity"] -= trade["quantity"]
                    pos["total_cost"] -= sold_cost
                    pos["avg_cost"] = pos["total_cost"] / pos["quantity"] if pos["quantity"] > 0 else 0
        
        return {
            "user_id": user_id,
            "total_pnl": total_pnl,
            "positions": positions,
            "calculated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        return {"status": "error", "message": str(e)}