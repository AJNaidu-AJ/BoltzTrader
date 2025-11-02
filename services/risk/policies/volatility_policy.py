"""
Volatility Gate Policy - Adjusts risk based on market volatility
"""

from ..risk_base import BaseRiskPolicy, RiskAssessment, TradeRequest, PortfolioState, RiskLevel, PolicyAction
from typing import Dict, Any

class VolatilityGatePolicy(BaseRiskPolicy):
    def __init__(self):
        super().__init__(
            policy_id="volatility_gate_v1",
            name="Volatility-Adaptive Sizing",
            priority=2
        )
        self.low_vol_threshold = 15    # VIX < 15 = low volatility
        self.high_vol_threshold = 25   # VIX > 25 = high volatility
        self.extreme_vol_threshold = 40 # VIX > 40 = extreme volatility
        
    async def evaluate(self, trade_request: TradeRequest, 
                      portfolio_state: PortfolioState,
                      market_data: Dict[str, Any]) -> RiskAssessment:
        
        vix = market_data.get("vix", 20)  # Default VIX if not available
        symbol_volatility = market_data.get("volatility", 20)
        
        # Extreme volatility - block all trades
        if vix > self.extreme_vol_threshold:
            self.trigger("Extreme volatility detected")
            
            return RiskAssessment(
                risk_level=RiskLevel.CRITICAL,
                action=PolicyAction.BLOCK,
                confidence=0.95,
                reasoning=[
                    f"VIX at {vix:.1f} indicates extreme market stress",
                    f"Exceeds extreme threshold {self.extreme_vol_threshold}",
                    "All trading suspended for safety"
                ]
            )
        
        # High volatility - reduce position size
        elif vix > self.high_vol_threshold:
            self.trigger("High volatility detected")
            
            # Reduce position size by 50%
            adjusted_quantity = int(trade_request.quantity * 0.5)
            
            return RiskAssessment(
                risk_level=RiskLevel.HIGH,
                action=PolicyAction.RESIZE,
                confidence=0.85,
                reasoning=[
                    f"VIX at {vix:.1f} indicates high volatility",
                    f"Reducing position size by 50% for safety",
                    f"Adjusted quantity: {adjusted_quantity}"
                ],
                adjustments={"quantity": adjusted_quantity}
            )
        
        # Medium volatility - slight reduction for high-risk strategies
        elif vix > self.low_vol_threshold and trade_request.risk_level == "HIGH":
            self.trigger("Medium volatility with high-risk strategy")
            
            # Reduce position size by 25%
            adjusted_quantity = int(trade_request.quantity * 0.75)
            
            return RiskAssessment(
                risk_level=RiskLevel.MEDIUM,
                action=PolicyAction.RESIZE,
                confidence=0.7,
                reasoning=[
                    f"VIX at {vix:.1f} with high-risk strategy",
                    f"Reducing position size by 25%",
                    f"Adjusted quantity: {adjusted_quantity}"
                ],
                adjustments={"quantity": adjusted_quantity}
            )
        
        # Check individual symbol volatility
        if symbol_volatility > 50:  # Very volatile individual stock
            self.trigger("High individual symbol volatility")
            
            adjusted_quantity = int(trade_request.quantity * 0.6)
            
            return RiskAssessment(
                risk_level=RiskLevel.MEDIUM,
                action=PolicyAction.RESIZE,
                confidence=0.8,
                reasoning=[
                    f"Symbol volatility {symbol_volatility:.1f}% is very high",
                    f"Reducing position size by 40%",
                    f"Adjusted quantity: {adjusted_quantity}"
                ],
                adjustments={"quantity": adjusted_quantity}
            )
        
        # Low volatility - allow full position
        return RiskAssessment(
            risk_level=RiskLevel.LOW,
            action=PolicyAction.ALLOW,
            confidence=0.9,
            reasoning=[
                f"VIX at {vix:.1f} indicates normal market conditions",
                f"Symbol volatility {symbol_volatility:.1f}% is acceptable"
            ]
        )
    
    def get_thresholds(self) -> Dict[str, Any]:
        return {
            "low_vol_threshold": self.low_vol_threshold,
            "high_vol_threshold": self.high_vol_threshold,
            "extreme_vol_threshold": self.extreme_vol_threshold
        }