"""
Base Strategy Interface for BoltzTrader Strategy Library
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from datetime import datetime

class StrategySignal(BaseModel):
    strategy_id: str
    action: str  # BUY, SELL, HOLD
    confidence: float  # 0.0 to 1.0
    reasoning: List[str]
    risk_level: str  # LOW, MEDIUM, HIGH
    target_price: Optional[float] = None
    stop_loss: Optional[float] = None
    timestamp: str = datetime.now().isoformat()

class StrategyMetrics(BaseModel):
    win_rate: float = 0.0
    total_trades: int = 0
    avg_return: float = 0.0
    sharpe_ratio: float = 0.0
    max_drawdown: float = 0.0
    last_updated: str = datetime.now().isoformat()

class BaseStrategy(ABC):
    def __init__(self, strategy_id: str, name: str, description: str):
        self.strategy_id = strategy_id
        self.name = name
        self.description = description
        self.metrics = StrategyMetrics()
        self.enabled = True
        self.weight = 1.0
        
    @abstractmethod
    async def evaluate(self, market_data: Dict[str, Any], 
                      indicators: Dict[str, float],
                      sentiment: float,
                      breakouts: List[str]) -> StrategySignal:
        """Evaluate strategy and return signal"""
        pass
    
    @abstractmethod
    def get_conditions(self) -> Dict[str, Any]:
        """Return strategy conditions for backtesting"""
        pass
    
    def update_performance(self, trade_result: Dict[str, Any]):
        """Update strategy performance metrics"""
        if trade_result.get("status") == "completed":
            self.metrics.total_trades += 1
            pnl = trade_result.get("pnl", 0)
            
            if pnl > 0:
                wins = getattr(self.metrics, 'wins', 0) + 1
                self.metrics.win_rate = wins / self.metrics.total_trades
            
            # Update average return
            current_avg = self.metrics.avg_return
            self.metrics.avg_return = (current_avg * (self.metrics.total_trades - 1) + pnl) / self.metrics.total_trades
            
            self.metrics.last_updated = datetime.now().isoformat()
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "strategy_id": self.strategy_id,
            "name": self.name,
            "description": self.description,
            "metrics": self.metrics.dict(),
            "enabled": self.enabled,
            "weight": self.weight
        }