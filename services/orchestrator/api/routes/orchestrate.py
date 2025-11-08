from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any
import os
from supabase import create_client

router = APIRouter()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

class SyncRequest(BaseModel):
    target_agents: List[str]
    model_ids: List[str]

@router.post("/sync-models")
async def sync_models_to_agents(request: SyncRequest):
    # Log sync operation
    for model_id in request.model_ids:
        supabase.table("model_audit_log").insert({
            "model_id": model_id,
            "event_type": "sync",
            "details": {
                "target_agents": request.target_agents,
                "sync_timestamp": "now"
            },
            "created_by": "orchestrator"
        }).execute()
    
    return {
        "status": "sync_initiated",
        "target_agents": request.target_agents,
        "models_synced": len(request.model_ids)
    }

@router.get("/agent-status")
async def get_agent_status():
    # Simplified agent status check
    agents = [
        {"id": "strategy_agent", "status": "active", "last_sync": "2024-01-05T10:00:00Z"},
        {"id": "risk_agent", "status": "active", "last_sync": "2024-01-05T10:00:00Z"},
        {"id": "sentiment_agent", "status": "active", "last_sync": "2024-01-05T09:58:00Z"},
        {"id": "federated_client_1", "status": "active", "last_sync": "2024-01-05T10:01:00Z"}
    ]
    
    return {"agents": agents, "total_active": len([a for a in agents if a["status"] == "active"])}

@router.post("/trigger-federated-update")
async def trigger_federated_update():
    # Log federated update trigger
    supabase.table("model_audit_log").insert({
        "model_id": None,
        "event_type": "federated_update",
        "details": {"action": "triggered_global_federated_learning_round"},
        "created_by": "orchestrator"
    }).execute()
    
    return {"status": "federated_update_triggered", "round_id": "fl_round_001"}

@router.get("/orchestration-metrics")
async def get_orchestration_metrics():
    # Get recent orchestration events
    events = supabase.table("model_audit_log").select("event_type").eq("event_type", "sync").order("created_at", desc=True).limit(24).execute()
    
    return {
        "recent_syncs": len(events.data),
        "active_agents": 4,
        "pending_validations": 2,
        "federated_rounds_today": 3
    }