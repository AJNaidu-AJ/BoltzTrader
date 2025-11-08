from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

@router.get("/ping")
async def ping():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "federated-learning",
        "timestamp": datetime.now().isoformat()
    }

@router.get("/status")
async def get_status():
    """Get detailed service status"""
    return {
        "status": "healthy",
        "active_clients": 12,
        "pending_updates": 3,
        "last_aggregation": "2024-01-01T00:00:00Z",
        "model_versions": {
            "boltz-core": 5,
            "risk-model": 3
        }
    }