from dataclasses import dataclass
from typing import Dict, Any
import random
import uuid

@dataclass
class AgentNode:
    id: str
    name: str
    type: str = 'strategy'
    reliability: float = 0.5
    confidence: float = 0.5
    active: bool = True

    def generate_signal(self, market_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate trading signal based on market data"""
        trend = market_data.get('trend', 0)
        volatility = market_data.get('volatility', 0.1)
        
        # Agent-specific signal generation logic
        if self.type == 'strategy':
            bias = 1 if trend > 0.02 else -1 if trend < -0.02 else 0
        elif self.type == 'risk':
            bias = -1 if volatility > 0.15 else 0  # Risk agent prefers low volatility
        elif self.type == 'sentiment':
            sentiment = market_data.get('sentiment', 0)
            bias = 1 if sentiment > 0.1 else -1 if sentiment < -0.1 else 0
        else:  # macro
            macro_score = market_data.get('macro_score', 0)
            bias = 1 if macro_score > 0.05 else -1 if macro_score < -0.05 else 0
        
        # Calculate confidence based on trend strength and agent reliability
        signal_confidence = min(1.0, abs(trend) * self.reliability + 0.1)
        
        signal = 'BUY' if bias > 0 else 'SELL' if bias < 0 else 'HOLD'
        
        return {
            'agent_id': self.id,
            'signal': signal,
            'confidence': round(signal_confidence, 3),
            'weight': self.reliability
        }
    
    def update_reliability(self, performance_score: float):
        """Update agent reliability based on performance"""
        self.reliability = max(0.1, min(1.0, self.reliability + performance_score * 0.1))
    
    @classmethod
    def create_default_agents(cls):
        """Create default set of trading agents"""
        return [
            cls(str(uuid.uuid4()), "Momentum Agent", "strategy", 0.7, 0.8),
            cls(str(uuid.uuid4()), "Risk Manager", "risk", 0.8, 0.9),
            cls(str(uuid.uuid4()), "Sentiment Analyzer", "sentiment", 0.6, 0.7),
            cls(str(uuid.uuid4()), "Macro Analyst", "macro", 0.75, 0.85)
        ]