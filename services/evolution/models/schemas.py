from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID

class PredictionRequest(BaseModel):
    trades: List[Dict[str, Any]]
    strategy_id: Optional[UUID] = None
    symbol: Optional[str] = None
    timeframe: str = "1d"

class PredictionResponse(BaseModel):
    predictions: List[float]
    confidence: float
    model_version: str

class EvolutionDecision(BaseModel):
    action: str  # HOLD, REBALANCE, INCREASE_WEIGHT
    reason: str
    score: float
    confidence: float = 0.0

class EvolutionRequest(BaseModel):
    metrics: Dict[str, Any]
    predictions: List[float]
    strategy_id: UUID

class PredictiveMetric(BaseModel):
    id: UUID
    user_id: UUID
    strategy_id: Optional[UUID]
    symbol: Optional[str]
    timeframe: str
    predicted_return: float
    predicted_volatility: float
    confidence: float
    model_version: str
    computed_at: datetime

class StrategyEvolution(BaseModel):
    id: UUID
    strategy_id: UUID
    previous_config: Dict[str, Any]
    new_config: Dict[str, Any]
    improvement_score: float
    reason: str
    triggered_by: str
    created_at: datetime