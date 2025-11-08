from fastapi import APIRouter, HTTPException
from ...engine.evolution_engine import EvolutionEngine
from ...models.schemas import EvolutionRequest, EvolutionDecision
from typing import Dict, Any

router = APIRouter()
engine = EvolutionEngine()

@router.post("/decide", response_model=EvolutionDecision)
async def decide_action(request: EvolutionRequest):
    """Make evolution decision based on metrics and predictions"""
    try:
        decision = engine.decide(request.metrics, request.predictions)
        
        # TODO: Store decision in database
        # TODO: Log audit entry
        
        return decision
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evolution decision failed: {str(e)}")

@router.get("/recommendations/{strategy_id}")
async def get_recommendations(strategy_id: str):
    """Get evolution recommendations for a strategy"""
    try:
        # TODO: Fetch strategy performance from database
        strategy_performance = {
            "win_rate": 0.45,
            "avg_return": 0.02,
            "max_drawdown": 0.12
        }
        
        recommendations = engine.get_evolution_recommendations(strategy_performance)
        
        return {
            "strategy_id": strategy_id,
            "recommendations": recommendations
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get recommendations: {str(e)}")

@router.put("/thresholds")
async def update_thresholds(thresholds: Dict[str, float]):
    """Update evolution decision thresholds"""
    try:
        engine.update_thresholds(thresholds)
        
        return {
            "status": "success",
            "message": "Thresholds updated successfully",
            "new_thresholds": engine.thresholds
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update thresholds: {str(e)}")

@router.get("/thresholds")
async def get_thresholds():
    """Get current evolution decision thresholds"""
    return {
        "thresholds": engine.thresholds
    }