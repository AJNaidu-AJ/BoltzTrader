from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv
from supabase import create_client
from celery_app import celery_app
from execution_tasks import execute_order, retry_failed_order, calculate_pnl

load_dotenv()

app = FastAPI(title="Execution Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY")
supabase = create_client(supabase_url, supabase_key)

class OrderRequest(BaseModel):
    user_id: str
    signal_id: Optional[str] = None
    symbol: str
    side: str
    quantity: int
    order_type: str = "market"
    price: Optional[float] = None
    broker: str = "paper"
    is_paper_trade: bool = True

class OrderStatusResponse(BaseModel):
    order_id: str
    status: str
    execution_latency_ms: Optional[float] = None
    task_id: Optional[str] = None
    error: Optional[str] = None

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "execution-engine"}

@app.post("/api/orders/execute")
async def queue_order_execution(order: OrderRequest):
    """Queue order for execution via Celery"""
    try:
        # Create order record in database
        order_data = {
            "user_id": order.user_id,
            "signal_id": order.signal_id,
            "symbol": order.symbol,
            "side": order.side,
            "quantity": order.quantity,
            "price": order.price or 0,
            "order_type": order.order_type,
            "broker": order.broker,
            "is_paper_trade": order.is_paper_trade,
            "status": "queued"
        }
        
        result = supabase.table("trades").insert(order_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create order record")
        
        order_id = result.data[0]["id"]
        
        # Prepare order payload for Celery task
        order_payload = {
            "order_id": order_id,
            "userId": order.user_id,
            "signalId": order.signal_id,
            "symbol": order.symbol,
            "side": order.side,
            "quantity": order.quantity,
            "orderType": order.order_type,
            "price": order.price,
            "broker": order.broker,
            "isPaperTrade": order.is_paper_trade
        }
        
        # Queue execution task
        task = execute_order.delay(order_payload)
        
        return {
            "order_id": order_id,
            "task_id": task.id,
            "status": "queued",
            "message": "Order queued for execution"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to queue order: {str(e)}")

@app.get("/api/orders/status/{order_id}", response_model=OrderStatusResponse)
async def get_order_status(order_id: str):
    """Get order execution status"""
    try:
        # Get order from database
        result = supabase.table("trades").select("*").eq("id", order_id).single().execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Order not found")
        
        order = result.data
        metadata = order.get("metadata", {})
        
        return OrderStatusResponse(
            order_id=order_id,
            status=order["status"],
            execution_latency_ms=metadata.get("execution_latency_ms"),
            task_id=metadata.get("task_id"),
            error=metadata.get("error")
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get order status: {str(e)}")

@app.post("/api/orders/retry/{order_id}")
async def retry_order(order_id: str):
    """Retry a failed order"""
    try:
        task = retry_failed_order.delay(order_id)
        
        return {
            "order_id": order_id,
            "task_id": task.id,
            "status": "retry_queued",
            "message": "Order retry queued"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retry order: {str(e)}")

@app.get("/api/orders/user/{user_id}")
async def get_user_orders(user_id: str, limit: int = 50, offset: int = 0):
    """Get user orders with execution details"""
    try:
        result = supabase.table("trades").select("*").eq("user_id", user_id).order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        
        orders = []
        for order in result.data:
            metadata = order.get("metadata", {})
            orders.append({
                **order,
                "execution_latency_ms": metadata.get("execution_latency_ms"),
                "execution_started_at": metadata.get("execution_started_at"),
                "execution_completed_at": metadata.get("execution_completed_at")
            })
        
        return {"orders": orders}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user orders: {str(e)}")

@app.get("/api/pnl/{user_id}")
async def get_user_pnl(user_id: str, symbol: Optional[str] = None):
    """Get user PnL summary"""
    try:
        task = calculate_pnl.delay(user_id, symbol)
        result = task.get(timeout=10)  # Wait up to 10 seconds
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate PnL: {str(e)}")

@app.get("/api/metrics/execution")
async def get_execution_metrics():
    """Get execution metrics for monitoring"""
    try:
        # Get recent execution metrics
        result = supabase.table("execution_metrics").select("*").order("timestamp", desc=True).limit(100).execute()
        
        metrics = result.data
        
        # Calculate summary statistics
        total_executions = len(metrics)
        successful_executions = len([m for m in metrics if m["status"] == "success"])
        avg_latency = sum([m["execution_latency_ms"] for m in metrics if m["execution_latency_ms"]]) / len(metrics) if metrics else 0
        
        return {
            "total_executions": total_executions,
            "success_rate": (successful_executions / total_executions * 100) if total_executions > 0 else 0,
            "average_latency_ms": avg_latency,
            "recent_metrics": metrics
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get execution metrics: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8001)))