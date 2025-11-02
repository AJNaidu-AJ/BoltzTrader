"""
Main Strategy Engine - FastAPI service for Phase 2 Strategy Library
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import asyncio
from datetime import datetime

from .strategy_registry import strategy_registry
from .fusion_engine import fusion_engine
from .strategy_base import StrategySignal

app = FastAPI(title="BoltzTrader Strategy Engine", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StrategyRequest(BaseModel):
    symbol: str
    market_data: Dict[str, Any]
    indicators: Dict[str, float]
    sentiment: float
    breakouts: List[str]
    fusion_method: Optional[str] = "weighted_average"

class StrategyResponse(BaseModel):
    symbol: str
    fused_signal: StrategySignal
    individual_signals: List[StrategySignal]
    strategy_stats: Dict[str, Any]
    timestamp: str

@app.post("/evaluate", response_model=StrategyResponse)
async def evaluate_strategies(request: StrategyRequest):
    """Evaluate all strategies and return fused signal"""
    try:
        # Get individual strategy signals
        individual_signals = await strategy_registry.evaluate_all(
            request.market_data,
            request.indicators,
            request.sentiment,
            request.breakouts
        )
        
        # Fuse signals
        fused_signal = await fusion_engine.fuse_signals(
            individual_signals,
            request.fusion_method
        )
        
        if not fused_signal:
            fused_signal = StrategySignal(
                strategy_id="default",
                action="HOLD",
                confidence=0.5,
                reasoning=["No valid signals generated"],
                risk_level="MEDIUM"
            )
        
        return StrategyResponse(
            symbol=request.symbol,
            fused_signal=fused_signal,
            individual_signals=individual_signals,
            strategy_stats=strategy_registry.get_registry_stats(),
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/strategies")
async def get_strategies():
    """Get all available strategies"""
    return strategy_registry.to_dict()

@app.get("/strategies/{strategy_id}")
async def get_strategy(strategy_id: str):
    """Get specific strategy details"""
    strategy = strategy_registry.get_strategy(strategy_id)
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    return strategy.to_dict()

@app.post("/strategies/{strategy_id}/performance")
async def update_strategy_performance(strategy_id: str, trade_result: Dict[str, Any]):
    """Update strategy performance with trade result"""
    strategy = strategy_registry.get_strategy(strategy_id)
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    
    strategy_registry.update_strategy_performance(strategy_id, trade_result)
    return {"status": "updated", "strategy_id": strategy_id}

@app.post("/strategies/{strategy_id}/toggle")
async def toggle_strategy(strategy_id: str):
    """Enable/disable a strategy"""
    strategy = strategy_registry.get_strategy(strategy_id)
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    
    strategy.enabled = not strategy.enabled
    return {"status": "toggled", "strategy_id": strategy_id, "enabled": strategy.enabled}

@app.get("/top-strategies")
async def get_top_strategies(limit: int = 3):
    """Get top performing strategies"""
    top_strategies = strategy_registry.get_top_strategies(limit)
    return [s.to_dict() for s in top_strategies]

@app.post("/adjust-weights")
async def adjust_strategy_weights():
    """Adjust strategy weights based on performance"""
    strategy_registry.adjust_strategy_weights()
    return {"status": "weights_adjusted", "timestamp": datetime.now().isoformat()}

@app.get("/fusion-methods")
async def get_fusion_methods():
    """Get available fusion methods"""
    return fusion_engine.get_fusion_stats()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "strategy_engine",
        "strategies_loaded": len(strategy_registry.strategies),
        "enabled_strategies": len(strategy_registry.get_enabled_strategies())
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)