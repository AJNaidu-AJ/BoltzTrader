from ..models.schemas import EvolutionDecision
import numpy as np
from typing import Dict, Any, List

class EvolutionEngine:
    def __init__(self):
        self.thresholds = {
            "decline_threshold": -0.02,
            "improvement_threshold": 0.03,
            "confidence_threshold": 0.6
        }
    
    def decide(self, metrics: Dict[str, Any], predictions: List[float]) -> EvolutionDecision:
        """Make evolution decision based on metrics and predictions"""
        
        if not predictions or not metrics:
            return EvolutionDecision(
                action="HOLD",
                reason="Insufficient data",
                score=0.0,
                confidence=0.0
            )
        
        # Calculate improvement score
        recent_returns = metrics.get('recent_returns', [0])
        if not recent_returns:
            recent_returns = [0]
        
        avg_prediction = np.mean(predictions)
        avg_recent_return = np.mean(recent_returns)
        improvement_score = avg_prediction - avg_recent_return
        
        # Calculate confidence based on prediction consistency
        prediction_std = np.std(predictions) if len(predictions) > 1 else 0
        confidence = max(0.1, 1.0 - prediction_std)
        
        # Decision logic
        if improvement_score < self.thresholds["decline_threshold"]:
            if confidence > self.thresholds["confidence_threshold"]:
                return EvolutionDecision(
                    action="REBALANCE",
                    reason="Predicted decline in performance",
                    score=improvement_score,
                    confidence=confidence
                )
            else:
                return EvolutionDecision(
                    action="HOLD",
                    reason="Low confidence in decline prediction",
                    score=improvement_score,
                    confidence=confidence
                )
        
        elif improvement_score > self.thresholds["improvement_threshold"]:
            return EvolutionDecision(
                action="INCREASE_WEIGHT",
                reason="Strong predictive signal for improvement",
                score=improvement_score,
                confidence=confidence
            )
        
        else:
            return EvolutionDecision(
                action="HOLD",
                reason="Stable performance predicted",
                score=improvement_score,
                confidence=confidence
            )
    
    def update_thresholds(self, new_thresholds: Dict[str, float]):
        """Update decision thresholds"""
        self.thresholds.update(new_thresholds)
    
    def get_evolution_recommendations(self, strategy_performance: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get specific recommendations for strategy evolution"""
        recommendations = []
        
        win_rate = strategy_performance.get('win_rate', 0)
        avg_return = strategy_performance.get('avg_return', 0)
        max_drawdown = strategy_performance.get('max_drawdown', 0)
        
        # Win rate recommendations
        if win_rate < 0.4:
            recommendations.append({
                "type": "win_rate_improvement",
                "suggestion": "Consider tightening entry criteria",
                "priority": "high"
            })
        
        # Return recommendations
        if avg_return < 0.01:
            recommendations.append({
                "type": "return_improvement",
                "suggestion": "Evaluate position sizing strategy",
                "priority": "medium"
            })
        
        # Risk management recommendations
        if max_drawdown > 0.15:
            recommendations.append({
                "type": "risk_management",
                "suggestion": "Implement stricter stop-loss rules",
                "priority": "high"
            })
        
        return recommendations