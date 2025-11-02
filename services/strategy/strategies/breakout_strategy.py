"""
Breakout Strategy - Detects price breaking key levels
"""

from ..strategy_base import BaseStrategy, StrategySignal
from typing import Dict, Any, List

class BreakoutStrategy(BaseStrategy):
    def __init__(self):
        super().__init__(
            strategy_id="breakout_v1",
            name="Breakout Detection",
            description="Detects price breaking key support/resistance levels with volume"
        )
        self.volume_threshold = 1.8
        
    async def evaluate(self, market_data: Dict[str, Any], 
                      indicators: Dict[str, float],
                      sentiment: float,
                      breakouts: List[str]) -> StrategySignal:
        
        price = market_data.get("price", 0)
        volume = market_data.get("volume", 0)
        avg_volume = market_data.get("avg_volume", volume)
        high = market_data.get("high", price)
        low = market_data.get("low", price)
        
        bb_upper = indicators.get("bollinger_upper", price * 1.02)
        bb_lower = indicators.get("bollinger_lower", price * 0.98)
        
        confidence = 0.0
        action = "HOLD"
        reasoning = []
        risk_level = "MEDIUM"
        
        volume_ratio = volume / max(avg_volume, 1)
        
        # Bullish breakout
        if ("OVERBOUGHT_BREAKOUT" in breakouts or 
            high > bb_upper) and volume_ratio > self.volume_threshold:
            
            action = "BUY"
            confidence = min(0.9, volume_ratio / 3 + 0.4)
            reasoning = [
                f"Bullish breakout detected",
                f"High volume confirmation ({volume_ratio:.1f}x)",
                f"Price breaking resistance ({high:.2f} > {bb_upper:.2f})"
            ]
            risk_level = "MEDIUM"
            
        # Bearish breakdown
        elif ("OVERSOLD_REVERSAL" not in breakouts and 
              low < bb_lower) and volume_ratio > self.volume_threshold:
            
            action = "SELL"
            confidence = min(0.9, volume_ratio / 3 + 0.4)
            reasoning = [
                f"Bearish breakdown detected",
                f"High volume confirmation ({volume_ratio:.1f}x)",
                f"Price breaking support ({low:.2f} < {bb_lower:.2f})"
            ]
            risk_level = "MEDIUM"
        
        # High volatility breakout
        elif "HIGH_VOLATILITY" in breakouts and volume_ratio > 2.0:
            volatility = indicators.get("volatility", 5)
            if volatility > 10:
                action = "BUY" if sentiment > 0 else "SELL"
                confidence = min(0.8, volatility / 20 + 0.3)
                reasoning = [
                    f"High volatility breakout ({volatility:.1f})",
                    f"Extreme volume ({volume_ratio:.1f}x)",
                    f"Sentiment direction: {sentiment:.2f}"
                ]
                risk_level = "HIGH"
        
        # Sentiment confirmation
        if sentiment > 0.4 and action == "BUY":
            confidence = min(1.0, confidence + 0.1)
            reasoning.append("Positive sentiment confirmation")
        elif sentiment < -0.4 and action == "SELL":
            confidence = min(1.0, confidence + 0.1)
            reasoning.append("Negative sentiment confirmation")
            
        return StrategySignal(
            strategy_id=self.strategy_id,
            action=action,
            confidence=confidence,
            reasoning=reasoning,
            risk_level=risk_level,
            target_price=price * 1.08 if action == "BUY" else price * 0.92,
            stop_loss=price * 0.96 if action == "BUY" else price * 1.04
        )
    
    def get_conditions(self) -> Dict[str, Any]:
        return {
            "type": "breakout",
            "volume_threshold": self.volume_threshold,
            "requires": ["bollinger_upper", "bollinger_lower", "volume", "volatility"]
        }