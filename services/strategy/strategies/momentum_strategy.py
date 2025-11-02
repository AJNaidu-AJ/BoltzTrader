"""
Momentum Strategy - Follows strong directional trends
"""

from ..strategy_base import BaseStrategy, StrategySignal
from typing import Dict, Any, List

class MomentumStrategy(BaseStrategy):
    def __init__(self):
        super().__init__(
            strategy_id="momentum_v1",
            name="Momentum Trend Following",
            description="Follows strong directional trends using RSI, EMA, and Volume"
        )
        self.rsi_threshold = 60
        self.volume_multiplier = 1.5
        
    async def evaluate(self, market_data: Dict[str, Any], 
                      indicators: Dict[str, float],
                      sentiment: float,
                      breakouts: List[str]) -> StrategySignal:
        
        price = market_data.get("price", 0)
        volume = market_data.get("volume", 0)
        avg_volume = market_data.get("avg_volume", volume)
        
        rsi = indicators.get("rsi", 50)
        ema_20 = indicators.get("ema_20", price)
        
        confidence = 0.0
        action = "HOLD"
        reasoning = []
        risk_level = "MEDIUM"
        
        # Bullish momentum conditions
        if (price > ema_20 and 
            rsi > self.rsi_threshold and 
            volume > avg_volume * self.volume_multiplier):
            
            action = "BUY"
            confidence = min(0.9, (rsi - 50) / 50 + 0.3)
            reasoning = [
                f"Price above EMA20 ({price:.2f} > {ema_20:.2f})",
                f"Strong RSI momentum ({rsi:.1f})",
                f"High volume confirmation ({volume/avg_volume:.1f}x)"
            ]
            risk_level = "LOW" if confidence > 0.8 else "MEDIUM"
            
        # Bearish momentum conditions  
        elif (price < ema_20 and 
              rsi < (100 - self.rsi_threshold) and
              volume > avg_volume * self.volume_multiplier):
            
            action = "SELL"
            confidence = min(0.9, (50 - rsi) / 50 + 0.3)
            reasoning = [
                f"Price below EMA20 ({price:.2f} < {ema_20:.2f})",
                f"Weak RSI momentum ({rsi:.1f})",
                f"High volume confirmation ({volume/avg_volume:.1f}x)"
            ]
            risk_level = "LOW" if confidence > 0.8 else "MEDIUM"
        
        # Sentiment boost
        if sentiment > 0.5 and action == "BUY":
            confidence = min(1.0, confidence + 0.1)
            reasoning.append("Positive sentiment confirmation")
        elif sentiment < -0.5 and action == "SELL":
            confidence = min(1.0, confidence + 0.1)
            reasoning.append("Negative sentiment confirmation")
            
        return StrategySignal(
            strategy_id=self.strategy_id,
            action=action,
            confidence=confidence,
            reasoning=reasoning,
            risk_level=risk_level,
            target_price=price * 1.05 if action == "BUY" else price * 0.95,
            stop_loss=price * 0.98 if action == "BUY" else price * 1.02
        )
    
    def get_conditions(self) -> Dict[str, Any]:
        return {
            "type": "momentum",
            "rsi_threshold": self.rsi_threshold,
            "volume_multiplier": self.volume_multiplier,
            "requires": ["rsi", "ema_20", "volume"]
        }