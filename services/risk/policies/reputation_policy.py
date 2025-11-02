"""
Reputation Logic Policy - Rates strategies based on reliability
"""

from ..risk_base import BaseRiskPolicy, RiskAssessment, TradeRequest, PortfolioState, RiskLevel, PolicyAction
from typing import Dict, Any

class ReputationPolicy(BaseRiskPolicy):
    def __init__(self):
        super().__init__(
            policy_id="reputation_logic_v1",
            name="Strategy Reputation System",
            priority=3
        )
        self.min_reputation_score = 0.3  # Minimum reputation to trade
        self.low_reputation_threshold = 0.5
        self.high_reputation_threshold = 0.8
        
        # Mock reputation scores (in production, load from database)
        self.strategy_reputations = {
            "momentum_v1": 0.75,
            "mean_reversion_v1": 0.65,
            "breakout_v1": 0.45,
            "sentiment_fusion_v1": 0.85
        }
        
    async def evaluate(self, trade_request: TradeRequest, 
                      portfolio_state: PortfolioState,
                      market_data: Dict[str, Any]) -> RiskAssessment:
        
        strategy_reputation = self.strategy_reputations.get(trade_request.strategy_id, 0.5)
        
        # Block trades from very low reputation strategies
        if strategy_reputation < self.min_reputation_score:
            self.trigger("Strategy reputation too low")
            
            return RiskAssessment(
                risk_level=RiskLevel.HIGH,
                action=PolicyAction.BLOCK,
                confidence=0.9,
                reasoning=[
                    f"Strategy {trade_request.strategy_id} reputation {strategy_reputation:.2f}",
                    f"Below minimum threshold {self.min_reputation_score:.2f}",
                    "Strategy suspended due to poor performance"
                ]
            )
        
        # Reduce position size for low reputation strategies
        elif strategy_reputation < self.low_reputation_threshold:
            self.trigger("Low reputation strategy")
            
            # Reduce by reputation factor
            reduction_factor = strategy_reputation / self.low_reputation_threshold
            adjusted_quantity = int(trade_request.quantity * reduction_factor)
            
            return RiskAssessment(
                risk_level=RiskLevel.MEDIUM,
                action=PolicyAction.RESIZE,
                confidence=0.8,
                reasoning=[
                    f"Strategy reputation {strategy_reputation:.2f} is low",
                    f"Reducing position size by {(1-reduction_factor)*100:.0f}%",
                    f"Adjusted quantity: {adjusted_quantity}"
                ],
                adjustments={"quantity": adjusted_quantity}
            )
        
        # Boost confidence for high reputation strategies
        elif strategy_reputation > self.high_reputation_threshold:
            # Allow slightly larger positions for proven strategies
            boost_factor = min(1.2, 1 + (strategy_reputation - self.high_reputation_threshold))
            adjusted_quantity = int(trade_request.quantity * boost_factor)
            
            return RiskAssessment(
                risk_level=RiskLevel.LOW,
                action=PolicyAction.RESIZE,
                confidence=0.95,
                reasoning=[
                    f"High reputation strategy {strategy_reputation:.2f}",
                    f"Boosting position size by {(boost_factor-1)*100:.0f}%",
                    f"Adjusted quantity: {adjusted_quantity}"
                ],
                adjustments={"quantity": adjusted_quantity}
            )
        
        # Normal reputation - allow as is
        return RiskAssessment(
            risk_level=RiskLevel.LOW,
            action=PolicyAction.ALLOW,
            confidence=0.8,
            reasoning=[
                f"Strategy reputation {strategy_reputation:.2f} is acceptable",
                "No reputation-based adjustments needed"
            ]
        )
    
    def update_reputation(self, strategy_id: str, trade_outcome: Dict[str, Any]):
        """Update strategy reputation based on trade outcome"""
        current_reputation = self.strategy_reputations.get(strategy_id, 0.5)
        
        # Simple reputation update based on P&L
        pnl = trade_outcome.get("pnl", 0)
        if pnl > 0:
            # Positive outcome - slight reputation boost
            new_reputation = min(1.0, current_reputation + 0.02)
        else:
            # Negative outcome - slight reputation penalty
            new_reputation = max(0.0, current_reputation - 0.03)
        
        self.strategy_reputations[strategy_id] = new_reputation
    
    def get_thresholds(self) -> Dict[str, Any]:
        return {
            "min_reputation_score": self.min_reputation_score,
            "low_reputation_threshold": self.low_reputation_threshold,
            "high_reputation_threshold": self.high_reputation_threshold,
            "strategy_reputations": self.strategy_reputations
        }