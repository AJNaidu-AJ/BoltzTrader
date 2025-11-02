"""
Exposure Control Policy - Dynamic position sizing based on portfolio exposure
"""

from ..risk_base import BaseRiskPolicy, RiskAssessment, TradeRequest, PortfolioState, RiskLevel, PolicyAction
from typing import Dict, Any

class ExposureControlPolicy(BaseRiskPolicy):
    def __init__(self):
        super().__init__(
            policy_id="exposure_control_v1",
            name="Dynamic Exposure Control",
            priority=1
        )
        self.max_single_position = 0.15  # 15% max per position
        self.max_total_exposure = 0.80   # 80% max total exposure
        self.max_sector_exposure = 0.25  # 25% max per sector
        
    async def evaluate(self, trade_request: TradeRequest, 
                      portfolio_state: PortfolioState,
                      market_data: Dict[str, Any]) -> RiskAssessment:
        
        trade_value = trade_request.quantity * trade_request.price
        current_exposure = self._calculate_exposure(portfolio_state)
        
        # Check single position limit
        position_pct = trade_value / portfolio_state.total_value
        if position_pct > self.max_single_position:
            self.trigger("Single position limit exceeded")
            
            # Resize to max allowed
            max_quantity = int((self.max_single_position * portfolio_state.total_value) / trade_request.price)
            
            return RiskAssessment(
                risk_level=RiskLevel.MEDIUM,
                action=PolicyAction.RESIZE,
                confidence=0.9,
                reasoning=[
                    f"Position size {position_pct:.1%} exceeds limit {self.max_single_position:.1%}",
                    f"Resizing to {max_quantity} shares"
                ],
                adjustments={"quantity": max_quantity}
            )
        
        # Check total exposure limit
        new_exposure = current_exposure + position_pct
        if new_exposure > self.max_total_exposure:
            self.trigger("Total exposure limit exceeded")
            
            return RiskAssessment(
                risk_level=RiskLevel.HIGH,
                action=PolicyAction.BLOCK,
                confidence=0.95,
                reasoning=[
                    f"Total exposure would be {new_exposure:.1%}",
                    f"Exceeds maximum {self.max_total_exposure:.1%}",
                    "Trade blocked for capital preservation"
                ]
            )
        
        # Check sector concentration (simplified)
        sector = market_data.get("sector", "Unknown")
        sector_exposure = self._calculate_sector_exposure(portfolio_state, sector)
        
        if sector_exposure + position_pct > self.max_sector_exposure:
            self.trigger("Sector concentration limit exceeded")
            
            return RiskAssessment(
                risk_level=RiskLevel.MEDIUM,
                action=PolicyAction.BLOCK,
                confidence=0.8,
                reasoning=[
                    f"Sector {sector} exposure would be {sector_exposure + position_pct:.1%}",
                    f"Exceeds sector limit {self.max_sector_exposure:.1%}"
                ]
            )
        
        # Trade is within limits
        return RiskAssessment(
            risk_level=RiskLevel.LOW,
            action=PolicyAction.ALLOW,
            confidence=0.9,
            reasoning=[
                f"Position size {position_pct:.1%} within limits",
                f"Total exposure {new_exposure:.1%} acceptable"
            ]
        )
    
    def _calculate_exposure(self, portfolio_state: PortfolioState) -> float:
        """Calculate current portfolio exposure"""
        total_position_value = sum(
            pos.get("quantity", 0) * pos.get("current_price", 0)
            for pos in portfolio_state.positions.values()
        )
        return total_position_value / portfolio_state.total_value if portfolio_state.total_value > 0 else 0
    
    def _calculate_sector_exposure(self, portfolio_state: PortfolioState, sector: str) -> float:
        """Calculate exposure to specific sector"""
        sector_value = sum(
            pos.get("quantity", 0) * pos.get("current_price", 0)
            for pos in portfolio_state.positions.values()
            if pos.get("sector") == sector
        )
        return sector_value / portfolio_state.total_value if portfolio_state.total_value > 0 else 0
    
    def get_thresholds(self) -> Dict[str, Any]:
        return {
            "max_single_position": self.max_single_position,
            "max_total_exposure": self.max_total_exposure,
            "max_sector_exposure": self.max_sector_exposure
        }