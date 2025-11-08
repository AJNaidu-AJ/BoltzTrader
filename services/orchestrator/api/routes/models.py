from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
from supabase import create_client

router = APIRouter()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

class ModelRegistration(BaseModel):
    model_name: str
    version: str
    parent_version: Optional[str] = None
    performance_metrics: dict

@router.get("/")
async def list_models(status: Optional[str] = None):
    query = supabase.table("ai_model_registry").select("*")
    if status:
        query = query.eq("status", status)
    result = query.execute()
    return {"models": result.data}

@router.post("/register")
async def register_model(model: ModelRegistration):
    result = supabase.table("ai_model_registry").insert({
        "model_name": model.model_name,
        "version": model.version,
        "parent_version": model.parent_version,
        "performance_metrics": model.performance_metrics
    }).execute()
    return {"model_id": result.data[0]["id"], "status": "registered"}

@router.post("/promote/{model_id}")
async def promote_model(model_id: str):
    result = supabase.table("ai_model_registry").update({
        "status": "production"
    }).eq("id", model_id).execute()
    
    # Log audit event
    supabase.table("model_audit_log").insert({
        "model_id": model_id,
        "event_type": "promotion",
        "details": {"action": "promoted_to_production"},
        "created_by": "orchestrator"
    }).execute()
    
    return {"status": "promoted"}

@router.post("/rollback/{model_id}")
async def rollback_model(model_id: str):
    result = supabase.table("ai_model_registry").update({
        "status": "archived"
    }).eq("id", model_id).execute()
    
    # Log audit event
    supabase.table("model_audit_log").insert({
        "model_id": model_id,
        "event_type": "rollback",
        "details": {"action": "rolled_back_from_production"},
        "created_by": "orchestrator"
    }).execute()
    
    return {"status": "rolled_back"}

@router.get("/metrics/{model_id}")
async def get_model_metrics(model_id: str):
    result = supabase.table("ai_model_registry").select("performance_metrics").eq("id", model_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Model not found")
    return result.data[0]["performance_metrics"]