"""
Base Risk Policy Interface for BoltzTrader Risk & Policy Layer
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
from datetime import datetime
from enum import Enum

class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class PolicyAction(str, Enum):
    ALLOW = "ALLOW"
    BLOCK = "BLOCK"
    RESIZE = "RESIZE"
    DELAY = "DELAY"

class RiskAssessment(BaseModel):
    risk_level: RiskLevel
    action: PolicyAction
    confidence: float  # 0.0 to 1.0
    reasoning: List[str]
    adjustments: Dict[str, Any] = {}
    timestamp: str = datetime.now().isoformat()

class TradeRequest(BaseModel):
    symbol: str
    action: str  # BUY, SELL, HOLD
    quantity: int
    price: float
    strategy_id: str
    confidence: float
    risk_level: str

class PortfolioState(BaseModel):
    total_value: float
    cash_available: float
    positions: Dict[str, Dict[str, Any]]
    daily_pnl: float
    max_drawdown: float
    volatility: float

class BaseRiskPolicy(ABC):
    def __init__(self, policy_id: str, name: str, priority: int = 1):
        self.policy_id = policy_id
        self.name = name
        self.priority = priority
        self.enabled = True
        self.trigger_count = 0
        self.last_triggered = None
        
    @abstractmethod
    async def evaluate(self, trade_request: TradeRequest, 
                      portfolio_state: PortfolioState,
                      market_data: Dict[str, Any]) -> RiskAssessment:
        """Evaluate trade request against policy"""
        pass
    
    @abstractmethod
    def get_thresholds(self) -> Dict[str, Any]:
        """Return policy thresholds for monitoring"""
        pass
    
    def trigger(self, reason: str):
        """Record policy trigger"""
        self.trigger_count += 1
        self.last_triggered = datetime.now().isoformat()
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "policy_id": self.policy_id,
            "name": self.name,
            "priority": self.priority,
            "enabled": self.enabled,
            "trigger_count": self.trigger_count,
            "last_triggered": self.last_triggered
        }