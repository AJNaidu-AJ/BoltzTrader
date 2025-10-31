from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class ScoreRequest(BaseModel):
    symbol: str
    timeframe: str = "1d"

class ScoreResponse(BaseModel):
    symbol: str
    timeframe: str
    ensemble_score: float
    confidence: float
    rule_based_score: float
    xgboost_score: float
    lstm_score: float
    metadata: Dict[str, Any]
    timestamp: datetime

class SignalCreate(BaseModel):
    symbol: str
    company_name: str
    current_price: float
    price_change: float
    price_change_percent: float
    volume: int
    confidence: float
    rank: str
    sector: str
    technical_indicators: Optional[Dict[str, Any]] = None
    signal_reasons: Optional[list] = None
    timeframe: str = "1d"