"""
Drawdown Controller Policy - Monitors losses and freezes trading
"""

from ..risk_base import BaseRiskPolicy, RiskAssessment, TradeRequest, PortfolioState, RiskLevel, PolicyAction
from typing import Dict, Any
from datetime import datetime, timedelta

class DrawdownControllerPolicy(BaseRiskPolicy):
    def __init__(self):
        super().__init__(
            policy_id="drawdown_controller_v1",
            name="Loss Containment System",
            priority=1  # High priority
        )
        self.daily_loss_limit = 0.05    # 5% daily loss limit
        self.max_drawdown_limit = 0.15  # 15% max drawdown from peak
        self.cooling_period_hours = 24  # 24 hour cooling period
        self.last_freeze_time = None
        
    async def evaluate(self, trade_request: TradeRequest, 
                      portfolio_state: PortfolioState,
                      market_data: Dict[str, Any]) -> RiskAssessment:
        
        # Check if we're in cooling period
        if self._in_cooling_period():
            return RiskAssessment(
                risk_level=RiskLevel.CRITICAL,
                action=PolicyAction.BLOCK,
                confidence=1.0,
                reasoning=[
                    "Trading suspended due to recent drawdown trigger",
                    f"Cooling period active for {self.cooling_period_hours} hours",
                    "Waiting for market conditions to stabilize"
                ]
            )
        
        # Check daily loss limit
        daily_loss_pct = abs(portfolio_state.daily_pnl) / portfolio_state.total_value
        if portfolio_state.daily_pnl < 0 and daily_loss_pct > self.daily_loss_limit:
            self.trigger("Daily loss limit exceeded")
            self._activate_cooling_period()
            
            return RiskAssessment(
                risk_level=RiskLevel.CRITICAL,
                action=PolicyAction.BLOCK,
                confidence=0.95,
                reasoning=[
                    f"Daily loss {daily_loss_pct:.1%} exceeds limit {self.daily_loss_limit:.1%}",
                    f"Portfolio down ${abs(portfolio_state.daily_pnl):,.2f} today",
                    f"Trading suspended for {self.cooling_period_hours} hours"
                ]
            )
        
        # Check maximum drawdown
        if portfolio_state.max_drawdown > self.max_drawdown_limit:
            self.trigger("Maximum drawdown exceeded")
            self._activate_cooling_period()
            
            return RiskAssessment(
                risk_level=RiskLevel.CRITICAL,
                action=PolicyAction.BLOCK,
                confidence=0.98,
                reasoning=[
                    f"Drawdown {portfolio_state.max_drawdown:.1%} exceeds limit {self.max_drawdown_limit:.1%}",
                    "Maximum loss threshold breached",
                    f"Emergency trading halt for {self.cooling_period_hours} hours"
                ]
            )
        
        # Warning zone - approaching limits
        if daily_loss_pct > self.daily_loss_limit * 0.7:  # 70% of limit
            return RiskAssessment(
                risk_level=RiskLevel.HIGH,
                action=PolicyAction.DELAY,
                confidence=0.8,
                reasoning=[
                    f"Daily loss {daily_loss_pct:.1%} approaching limit",
                    "Delaying trade for 5 minutes to assess conditions",
                    "Consider reducing position size"
                ],
                adjustments={"delay_minutes": 5}
            )
        
        if portfolio_state.max_drawdown > self.max_drawdown_limit * 0.8:  # 80% of limit
            # Reduce position size as precaution
            adjusted_quantity = int(trade_request.quantity * 0.5)
            
            return RiskAssessment(
                risk_level=RiskLevel.MEDIUM,
                action=PolicyAction.RESIZE,
                confidence=0.7,
                reasoning=[
                    f"Drawdown {portfolio_state.max_drawdown:.1%} in warning zone",
                    "Reducing position size by 50% as precaution",
                    f"Adjusted quantity: {adjusted_quantity}"
                ],
                adjustments={"quantity": adjusted_quantity}
            )
        
        # Normal conditions
        return RiskAssessment(
            risk_level=RiskLevel.LOW,
            action=PolicyAction.ALLOW,
            confidence=0.9,
            reasoning=[
                f"Daily P&L {portfolio_state.daily_pnl:+.2f} within limits",
                f"Drawdown {portfolio_state.max_drawdown:.1%} acceptable"
            ]
        )
    
    def _in_cooling_period(self) -> bool:
        """Check if we're still in cooling period"""
        if not self.last_freeze_time:
            return False
        
        freeze_time = datetime.fromisoformat(self.last_freeze_time)
        cooling_end = freeze_time + timedelta(hours=self.cooling_period_hours)
        return datetime.now() < cooling_end
    
    def _activate_cooling_period(self):
        """Activate cooling period"""
        self.last_freeze_time = datetime.now().isoformat()
    
    def get_thresholds(self) -> Dict[str, Any]:
        return {
            "daily_loss_limit": self.daily_loss_limit,
            "max_drawdown_limit": self.max_drawdown_limit,
            "cooling_period_hours": self.cooling_period_hours,
            "in_cooling_period": self._in_cooling_period()
        }