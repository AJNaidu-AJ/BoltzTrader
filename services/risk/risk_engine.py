"""
Risk Engine - FastAPI service for Phase 3 Risk & Policy Layer
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime
import os
from supabase import create_client, Client

from .risk_firewall import risk_firewall
from .risk_base import TradeRequest, PortfolioState, RiskAssessment

app = FastAPI(title="BoltzTrader Risk Engine", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase client
supabase: Client = create_client(
    os.getenv("SUPABASE_URL", "https://your-project.supabase.co"),
    os.getenv("SUPABASE_ANON_KEY", "your-anon-key")
)

class RiskEvaluationRequest(BaseModel):
    trade_request: TradeRequest
    portfolio_state: PortfolioState
    market_data: Dict[str, Any]

class RiskEvaluationResponse(BaseModel):
    assessment: RiskAssessment
    firewall_stats: Dict[str, Any]
    timestamp: str

@app.post("/evaluate", response_model=RiskEvaluationResponse)
async def evaluate_risk(request: RiskEvaluationRequest):
    """Evaluate trade request through risk firewall"""
    try:
        assessment = await risk_firewall.evaluate_trade(
            request.trade_request,
            request.portfolio_state,
            request.market_data
        )
        
        return RiskEvaluationResponse(
            assessment=assessment,
            firewall_stats=risk_firewall.get_policy_stats(),
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/policies")
async def get_policies():
    """Get all risk policies and their status"""
    return risk_firewall.to_dict()

@app.get("/policies/{policy_id}")
async def get_policy(policy_id: str):
    """Get specific policy details"""
    policy = risk_firewall.get_policy(policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy.to_dict()

@app.post("/policies/{policy_id}/toggle")
async def toggle_policy(policy_id: str):
    """Enable/disable a policy"""
    policy = risk_firewall.get_policy(policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    policy.enabled = not policy.enabled
    return {"status": "toggled", "policy_id": policy_id, "enabled": policy.enabled}

@app.post("/reputation/update")
async def update_reputation(strategy_id: str, trade_outcome: Dict[str, Any]):
    """Update strategy reputation based on trade outcome"""
    risk_firewall.update_policy_reputation(strategy_id, trade_outcome)
    return {"status": "updated", "strategy_id": strategy_id}

@app.get("/stats")
async def get_firewall_stats():
    """Get risk firewall statistics"""
    return risk_firewall.get_policy_stats()

@app.get("/logs")
async def get_recent_logs(limit: int = 50):
    """Get recent risk evaluation logs"""
    logs = risk_firewall.policy_logs[-limit:] if risk_firewall.policy_logs else []
    return {"logs": logs, "total_count": len(risk_firewall.policy_logs)}

@app.post("/test")
async def test_risk_evaluation():
    """Test risk evaluation with sample data"""
    
    # Sample trade request
    trade_request = TradeRequest(
        symbol="AAPL",
        action="BUY",
        quantity=100,
        price=150.0,
        strategy_id="momentum_v1",
        confidence=0.8,
        risk_level="MEDIUM"
    )
    
    # Sample portfolio state
    portfolio_state = PortfolioState(
        total_value=100000.0,
        cash_available=50000.0,
        positions={
            "MSFT": {"quantity": 50, "current_price": 300.0, "sector": "Technology"},
            "GOOGL": {"quantity": 25, "current_price": 2800.0, "sector": "Technology"}
        },
        daily_pnl=-1500.0,
        max_drawdown=0.08,
        volatility=0.15
    )
    
    # Sample market data
    market_data = {
        "vix": 22.5,
        "sector": "Technology",
        "volatility": 25.0
    }
    
    assessment = await risk_firewall.evaluate_trade(
        trade_request, portfolio_state, market_data
    )
    
    return {
        "test_assessment": assessment,
        "firewall_stats": risk_firewall.get_policy_stats()
    }

@app.get("/api/policies/{policy_id}/versions")
async def get_policy_versions(policy_id: str):
    """Get all versions of a policy"""
    try:
        result = supabase.table("policy_versions").select("*").eq("policy_id", policy_id).order("version", desc=True).execute()
        return {"versions": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/policies/{policy_id}/versions/{version}")
async def get_policy_version(policy_id: str, version: int):
    """Get specific version of a policy"""
    try:
        result = supabase.table("policy_versions").select("*").eq("policy_id", policy_id).eq("version", version).single().execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=404, detail="Version not found")

@app.post("/api/policies/{policy_id}/rollback/{version}")
async def rollback_policy(policy_id: str, version: int, user_id: Optional[str] = None):
    """Rollback policy to previous version"""
    try:
        # Get the version to rollback to
        version_result = supabase.table("policy_versions").select("definition").eq("policy_id", policy_id).eq("version", version).single().execute()
        
        # Update the current policy
        update_result = supabase.table("risk_policies").update({
            "thresholds": version_result.data["definition"],
            "updated_by": user_id,
            "updated_at": datetime.now().isoformat()
        }).eq("id", policy_id).execute()
        
        return {"success": True, "message": f"Policy rolled back to version {version}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "risk_engine",
        "policies_loaded": len(risk_firewall.policies),
        "enabled_policies": len([p for p in risk_firewall.policies if p.enabled])
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)