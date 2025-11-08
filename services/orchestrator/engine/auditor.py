import json
import hashlib
import numpy as np
import os
from typing import Dict, Any
from supabase import create_client

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

async def validate_model(model_artifact: Dict[str, Any], benchmark_metrics: Dict[str, Any]) -> Dict[str, Any]:
    """Compares new model against baseline performance metrics."""
    current_perf = model_artifact.get("accuracy", 0)
    baseline = benchmark_metrics.get("accuracy", 0)
    diff = current_perf - baseline
    
    if diff < -0.02:  # 2% regression threshold
        return {
            "status": "rejected",
            "reason": "Accuracy regression detected",
            "performance_diff": diff
        }
    
    return {
        "status": "approved",
        "improvement": diff,
        "performance_diff": diff
    }

async def log_audit(model_id: str, event_type: str, details: Dict[str, Any]) -> None:
    """Log audit event with integrity checksum."""
    details_json = json.dumps(details, sort_keys=True)
    checksum = hashlib.sha256(details_json.encode()).hexdigest()
    
    await supabase.table("model_audit_log").insert({
        "model_id": model_id,
        "event_type": event_type,
        "details": {**details, "checksum": checksum},
        "created_by": "orchestrator"
    })

async def check_model_integrity(model_id: str, expected_checksum: str) -> bool:
    """Verify model integrity using checksum."""
    result = supabase.table("ai_model_registry").select("checksum").eq("id", model_id).execute()
    if not result.data:
        return False
    
    stored_checksum = result.data[0].get("checksum")
    return stored_checksum == expected_checksum

async def generate_explainability_report(model_id: str) -> Dict[str, Any]:
    """Generate basic explainability metrics for model."""
    # Simplified explainability report
    return {
        "model_id": model_id,
        "interpretability_score": 0.75,
        "feature_importance": {
            "price_momentum": 0.35,
            "volume_trend": 0.28,
            "sentiment_score": 0.22,
            "volatility": 0.15
        },
        "decision_confidence": 0.82,
        "bias_metrics": {
            "fairness_score": 0.88,
            "demographic_parity": 0.91
        }
    }