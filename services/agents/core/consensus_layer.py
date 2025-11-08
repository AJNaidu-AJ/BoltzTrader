import numpy as np
from typing import List, Dict, Any

class ConsensusLayer:
    def __init__(self, threshold: float = 0.1):
        self.threshold = threshold
    
    def aggregate(self, agent_signals: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Aggregate agent signals using weighted voting"""
        if not agent_signals:
            return {'consensus': 'HOLD', 'confidence': 0.0, 'votes': []}
        
        # Extract weights and votes
        weights = np.array([signal.get('confidence', 0.5) * signal.get('weight', 0.5) 
                           for signal in agent_signals])
        
        # Convert signals to numeric votes
        votes = np.array([
            1 if signal['signal'] == 'BUY' 
            else -1 if signal['signal'] == 'SELL' 
            else 0 
            for signal in agent_signals
        ])
        
        # Calculate weighted consensus score
        if np.sum(weights) == 0:
            consensus_score = 0
        else:
            consensus_score = np.dot(weights, votes) / np.sum(weights)
        
        # Determine consensus signal
        if consensus_score > self.threshold:
            consensus_signal = 'BUY'
        elif consensus_score < -self.threshold:
            consensus_signal = 'SELL'
        else:
            consensus_signal = 'HOLD'
        
        # Calculate overall confidence
        confidence = min(1.0, abs(consensus_score))
        
        # Calculate agreement level
        agreement = self._calculate_agreement(agent_signals, consensus_signal)
        
        return {
            'consensus': consensus_signal,
            'confidence': round(confidence, 3),
            'score': round(consensus_score, 3),
            'agreement': round(agreement, 3),
            'votes': len(agent_signals),
            'agent_breakdown': self._get_agent_breakdown(agent_signals)
        }
    
    def _calculate_agreement(self, signals: List[Dict[str, Any]], consensus: str) -> float:
        """Calculate how many agents agree with consensus"""
        if not signals:
            return 0.0
        
        agreeing_agents = sum(1 for signal in signals if signal['signal'] == consensus)
        return agreeing_agents / len(signals)
    
    def _get_agent_breakdown(self, signals: List[Dict[str, Any]]) -> Dict[str, int]:
        """Get breakdown of agent votes"""
        breakdown = {'BUY': 0, 'SELL': 0, 'HOLD': 0}
        for signal in signals:
            breakdown[signal['signal']] += 1
        return breakdown
    
    def validate_consensus(self, consensus_result: Dict[str, Any], 
                          min_confidence: float = 0.6, 
                          min_agreement: float = 0.5) -> bool:
        """Validate if consensus meets quality thresholds"""
        return (consensus_result['confidence'] >= min_confidence and 
                consensus_result['agreement'] >= min_agreement)
    
    def update_threshold(self, new_threshold: float):
        """Update consensus threshold"""
        self.threshold = max(0.01, min(0.5, new_threshold))