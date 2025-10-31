import numpy as np
from typing import Dict, Any

class RuleBasedModel:
    def __init__(self):
        self.name = "rule_based"
    
    def predict(self, symbol: str, market_data: Dict[str, Any]) -> float:
        """Rule-based scoring using technical indicators"""
        score = 50.0  # Base score
        
        # Price momentum (30% weight)
        price_change = market_data.get('price_change_percent', 0)
        if price_change > 5:
            score += 20
        elif price_change > 2:
            score += 10
        elif price_change < -5:
            score -= 20
        elif price_change < -2:
            score -= 10
            
        # Volume analysis (25% weight)
        volume_ratio = market_data.get('volume_ratio', 1.0)
        if volume_ratio > 2.0:
            score += 15
        elif volume_ratio > 1.5:
            score += 8
        elif volume_ratio < 0.5:
            score -= 10
            
        # RSI analysis (20% weight)
        rsi = market_data.get('rsi', 50)
        if 30 <= rsi <= 70:
            score += 10
        elif rsi < 20 or rsi > 80:
            score -= 15
            
        # Moving average trend (25% weight)
        ma_signal = market_data.get('ma_signal', 0)  # 1=bullish, -1=bearish, 0=neutral
        score += ma_signal * 12
        
        return max(0, min(100, score))