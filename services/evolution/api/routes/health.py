from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "evolution",
        "version": "1.0.0"
    }

@router.get("/ready")
async def readiness_check():
    """Readiness check endpoint"""
    # TODO: Check model availability, database connection
    return {
        "status": "ready",
        "model_loaded": True,
        "database_connected": True
    }