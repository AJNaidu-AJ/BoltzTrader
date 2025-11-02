"""
Mean Reversion Strategy - Trades oversold/overbought reversals
"""

from ..strategy_base import BaseStrategy, StrategySignal
from typing import Dict, Any, List

class MeanReversionStrategy(BaseStrategy):
    def __init__(self):
        super().__init__(
            strategy_id="mean_reversion_v1",
            name="Mean Reversion",
            description="Trades oversold/overbought reversals using RSI and Bollinger Bands"
        )
        self.oversold_threshold = 30
        self.overbought_threshold = 70
        
    async def evaluate(self, market_data: Dict[str, Any], 
                      indicators: Dict[str, float],
                      sentiment: float,
                      breakouts: List[str]) -> StrategySignal:
        
        price = market_data.get("price", 0)
        rsi = indicators.get("rsi", 50)
        bb_upper = indicators.get("bollinger_upper", price * 1.02)
        bb_lower = indicators.get("bollinger_lower", price * 0.98)
        
        confidence = 0.0
        action = "HOLD"
        reasoning = []
        risk_level = "MEDIUM"
        
        # Oversold reversal (Buy signal)
        if rsi < self.oversold_threshold and price <= bb_lower:
            action = "BUY"
            confidence = min(0.9, (self.oversold_threshold - rsi) / 30 + 0.4)
            reasoning = [
                f"RSI oversold ({rsi:.1f} < {self.oversold_threshold})",
                f"Price at lower Bollinger Band ({price:.2f} <= {bb_lower:.2f})",
                "Mean reversion opportunity"
            ]
            risk_level = "LOW" if rsi < 20 else "MEDIUM"
            
        # Overbought reversal (Sell signal)
        elif rsi > self.overbought_threshold and price >= bb_upper:
            action = "SELL"
            confidence = min(0.9, (rsi - self.overbought_threshold) / 30 + 0.4)
            reasoning = [
                f"RSI overbought ({rsi:.1f} > {self.overbought_threshold})",
                f"Price at upper Bollinger Band ({price:.2f} >= {bb_upper:.2f})",
                "Mean reversion opportunity"
            ]
            risk_level = "LOW" if rsi > 80 else "MEDIUM"
        
        # Reduce confidence if sentiment conflicts
        if sentiment > 0.3 and action == "SELL":
            confidence *= 0.8
            reasoning.append("Sentiment conflict - reduced confidence")
        elif sentiment < -0.3 and action == "BUY":
            confidence *= 0.8
            reasoning.append("Sentiment conflict - reduced confidence")
            
        return StrategySignal(
            strategy_id=self.strategy_id,
            action=action,
            confidence=confidence,
            reasoning=reasoning,
            risk_level=risk_level,
            target_price=(bb_upper + bb_lower) / 2,  # Target middle of BB
            stop_loss=price * 0.97 if action == "BUY" else price * 1.03
        )
    
    def get_conditions(self) -> Dict[str, Any]:
        return {
            "type": "mean_reversion",
            "oversold_threshold": self.oversold_threshold,
            "overbought_threshold": self.overbought_threshold,
            "requires": ["rsi", "bollinger_upper", "bollinger_lower"]
        }