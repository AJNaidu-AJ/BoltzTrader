from fastapi import APIRouter
from typing import List, Optional
import os
from supabase import create_client

router = APIRouter()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

@router.get("/audit-log")
async def get_audit_log(model_id: Optional[str] = None, limit: int = 50):
    query = supabase.table("model_audit_log").select("*").order("created_at", desc=True).limit(limit)
    if model_id:
        query = query.eq("model_id", model_id)
    result = query.execute()
    return {"audit_log": result.data}

@router.get("/governance-report")
async def generate_governance_report():
    # Get model counts by status
    models = supabase.table("ai_model_registry").select("status").execute()
    status_counts = {}
    for model in models.data:
        status = model["status"]
        status_counts[status] = status_counts.get(status, 0) + 1
    
    # Get recent audit events
    recent_events = supabase.table("model_audit_log").select("event_type").order("created_at", desc=True).limit(100).execute()
    event_counts = {}
    for event in recent_events.data:
        event_type = event["event_type"]
        event_counts[event_type] = event_counts.get(event_type, 0) + 1
    
    return {
        "model_status_distribution": status_counts,
        "recent_event_distribution": event_counts,
        "total_models": len(models.data),
        "total_events": len(recent_events.data)
    }

@router.get("/compliance-summary")
async def get_compliance_summary():
    # Simplified compliance summary
    models = supabase.table("ai_model_registry").select("*").execute()
    
    compliant_count = 0
    total_count = len(models.data)
    
    for model in models.data:
        # Simple compliance check based on status
        if model["status"] in ["production", "validated"]:
            compliant_count += 1
    
    compliance_rate = compliant_count / total_count if total_count > 0 else 0
    
    return {
        "total_models": total_count,
        "compliant_models": compliant_count,
        "compliance_rate": compliance_rate,
        "status": "healthy" if compliance_rate > 0.8 else "needs_attention"
    }