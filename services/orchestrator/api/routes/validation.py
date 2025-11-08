from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
import os
from supabase import create_client

router = APIRouter()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

class ValidationRequest(BaseModel):
    model_id: str
    performance_metrics: Dict[str, Any]
    benchmark_metrics: Dict[str, Any]

@router.post("/validate")
async def validate_model(request: ValidationRequest):
    # Basic validation logic
    current_accuracy = request.performance_metrics.get("accuracy", 0)
    baseline_accuracy = request.benchmark_metrics.get("accuracy", 0)
    
    accuracy_diff = current_accuracy - baseline_accuracy
    
    if accuracy_diff < -0.02:  # 2% regression threshold
        status = "rejected"
        reason = "Accuracy regression detected"
        
        # Update model status
        supabase.table("ai_model_registry").update({
            "status": "rejected"
        }).eq("id", request.model_id).execute()
        
    else:
        status = "approved"
        reason = f"Performance improvement: {accuracy_diff:.3f}"
        
        # Update model status
        supabase.table("ai_model_registry").update({
            "status": "validated"
        }).eq("id", request.model_id).execute()
    
    # Log validation event
    supabase.table("model_audit_log").insert({
        "model_id": request.model_id,
        "event_type": "validation",
        "details": {
            "status": status,
            "reason": reason,
            "accuracy_diff": accuracy_diff
        },
        "created_by": "validation_engine"
    }).execute()
    
    return {
        "status": status,
        "reason": reason,
        "accuracy_improvement": accuracy_diff
    }

@router.get("/compliance/{model_id}")
async def check_compliance(model_id: str):
    # Basic compliance check
    result = supabase.table("ai_model_registry").select("*").eq("id", model_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Model not found")
    
    model = result.data[0]
    compliance_score = 0.85  # Simplified compliance score
    
    return {
        "model_id": model_id,
        "compliance_score": compliance_score,
        "status": "compliant" if compliance_score > 0.8 else "non_compliant"
    }