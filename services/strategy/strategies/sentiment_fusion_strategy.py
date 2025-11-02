"""
Sentiment Fusion Strategy - Combines emotional tone with technicals
"""

from ..strategy_base import BaseStrategy, StrategySignal
from typing import Dict, Any, List

class SentimentFusionStrategy(BaseStrategy):
    def __init__(self):
        super().__init__(
            strategy_id="sentiment_fusion_v1",
            name="Sentiment Fusion",
            description="Combines market sentiment with technical indicators"
        )
        self.sentiment_threshold = 0.6
        
    async def evaluate(self, market_data: Dict[str, Any], 
                      indicators: Dict[str, float],
                      sentiment: float,
                      breakouts: List[str]) -> StrategySignal:
        
        price = market_data.get("price", 0)
        rsi = indicators.get("rsi", 50)
        ema_20 = indicators.get("ema_20", price)
        
        confidence = 0.0
        action = "HOLD"
        reasoning = []
        risk_level = "MEDIUM"
        
        # Strong positive sentiment + bullish technicals
        if (sentiment > self.sentiment_threshold and 
            price > ema_20 and 
            rsi > 45 and rsi < 75):
            
            action = "BUY"
            confidence = min(0.95, sentiment * 0.7 + (rsi - 45) / 30 * 0.3)
            reasoning = [
                f"Strong positive sentiment ({sentiment:.2f})",
                f"Price above EMA20 ({price:.2f} > {ema_20:.2f})",
                f"Healthy RSI level ({rsi:.1f})",
                "Sentiment-technical alignment"
            ]
            risk_level = "LOW" if sentiment > 0.8 else "MEDIUM"
            
        # Strong negative sentiment + bearish technicals
        elif (sentiment < -self.sentiment_threshold and 
              price < ema_20 and 
              rsi < 55 and rsi > 25):
            
            action = "SELL"
            confidence = min(0.95, abs(sentiment) * 0.7 + (55 - rsi) / 30 * 0.3)
            reasoning = [
                f"Strong negative sentiment ({sentiment:.2f})",
                f"Price below EMA20 ({price:.2f} < {ema_20:.2f})",
                f"Weak RSI level ({rsi:.1f})",
                "Sentiment-technical alignment"
            ]
            risk_level = "LOW" if sentiment < -0.8 else "MEDIUM"
        
        # Moderate sentiment with breakout confirmation
        elif abs(sentiment) > 0.3:
            if "OVERSOLD_REVERSAL" in breakouts and sentiment > 0.3:
                action = "BUY"
                confidence = min(0.8, abs(sentiment) + 0.2)
                reasoning = [
                    f"Positive sentiment ({sentiment:.2f})",
                    "Oversold reversal pattern",
                    "Sentiment supports reversal"
                ]
            elif "OVERBOUGHT_BREAKOUT" in breakouts and sentiment < -0.3:
                action = "SELL"
                confidence = min(0.8, abs(sentiment) + 0.2)
                reasoning = [
                    f"Negative sentiment ({sentiment:.2f})",
                    "Overbought breakdown pattern",
                    "Sentiment supports breakdown"
                ]
        
        # Sentiment divergence warning
        if ((sentiment > 0.5 and rsi > 70) or 
            (sentiment < -0.5 and rsi < 30)):
            confidence *= 0.7
            reasoning.append("Potential sentiment-technical divergence")
            risk_level = "HIGH"
            
        return StrategySignal(
            strategy_id=self.strategy_id,
            action=action,
            confidence=confidence,
            reasoning=reasoning,
            risk_level=risk_level,
            target_price=price * (1.04 if action == "BUY" else 0.96),
            stop_loss=price * (0.98 if action == "BUY" else 1.02)
        )
    
    def get_conditions(self) -> Dict[str, Any]:
        return {
            "type": "sentiment_fusion",
            "sentiment_threshold": self.sentiment_threshold,
            "requires": ["rsi", "ema_20", "sentiment"]
        }