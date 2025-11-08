from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
from uuid import UUID

class AgentNodeSchema(BaseModel):
    id: str
    name: str
    type: str = 'strategy'
    reliability: float = 0.5
    confidence: float = 0.5
    active: bool = True

class AgentSignal(BaseModel):
    agent_id: str
    signal: str  # BUY, SELL, HOLD
    confidence: float
    weight: float = 1.0
    timestamp: Optional[datetime] = None

class ConsensusRequest(BaseModel):
    agents: List[AgentNodeSchema]
    market_data: Dict[str, Any]

class ConsensusResponse(BaseModel):
    consensus: str
    confidence: float
    score: float
    agreement: float
    votes: int
    agent_breakdown: Dict[str, int]
    agent_signals: List[AgentSignal]

class CorrelationRequest(BaseModel):
    price_data: Dict[str, List[float]]
    timeframe: str = '1D'

class CorrelationResponse(BaseModel):
    correlations: Dict[str, Dict[str, float]]
    hedge_pairs: List[Dict[str, Any]]
    diversification_score: Optional[float] = None

class HedgeRecommendation(BaseModel):
    base_symbol: str
    hedge_symbol: str
    correlation: float
    hedge_ratio: float
    confidence: float

class NetworkStatus(BaseModel):
    active_agents: int
    consensus_strength: float
    network_confidence: float
    last_update: datetime

class MeshRunRequest(BaseModel):
    agents: List[AgentNodeSchema]
    market_data: Dict[str, Any]
    symbol: str

class MeshRunResponse(BaseModel):
    decision: ConsensusResponse
    network_status: NetworkStatus
    recommendations: List[HedgeRecommendation] = []