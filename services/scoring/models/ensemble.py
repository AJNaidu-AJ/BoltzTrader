import numpy as np
from typing import Dict, Any, Tuple
from .rule_based import RuleBasedModel
from .xgboost_model import XGBoostModel
from .lstm_model import LSTMModel

class EnsembleModel:
    def __init__(self):
        self.rule_model = RuleBasedModel()
        self.xgb_model = XGBoostModel()
        self.lstm_model = LSTMModel()
        
        # Model weights (sum to 1.0)
        self.weights = {
            'rule_based': 0.3,
            'xgboost': 0.4,
            'lstm': 0.3
        }
    
    def predict(self, symbol: str, market_data: Dict[str, Any]) -> Tuple[float, float, Dict[str, float]]:
        """
        Generate ensemble prediction
        Returns: (ensemble_score, confidence, individual_scores)
        """
        # Get individual model predictions
        rule_score = self.rule_model.predict(symbol, market_data)
        xgb_score = self.xgb_model.predict(symbol, market_data)
        lstm_score = self.lstm_model.predict(symbol, market_data)
        
        individual_scores = {
            'rule_based': rule_score,
            'xgboost': xgb_score,
            'lstm': lstm_score
        }
        
        # Calculate weighted ensemble score
        ensemble_score = (
            rule_score * self.weights['rule_based'] +
            xgb_score * self.weights['xgboost'] +
            lstm_score * self.weights['lstm']
        )
        
        # Calculate confidence based on agreement between models
        confidence = self._calculate_confidence(individual_scores)
        
        return ensemble_score, confidence, individual_scores
    
    def _calculate_confidence(self, scores: Dict[str, float]) -> float:
        """Calculate confidence based on model agreement"""
        score_values = list(scores.values())
        
        # Calculate standard deviation (lower = higher agreement = higher confidence)
        std_dev = np.std(score_values)
        
        # Convert to confidence score (0-100)
        # Lower std_dev = higher confidence
        max_std = 30  # Maximum expected standard deviation
        confidence = max(0, min(100, 100 - (std_dev / max_std) * 100))
        
        # Boost confidence for extreme scores (very high or very low)
        avg_score = np.mean(score_values)
        if avg_score > 80 or avg_score < 20:
            confidence = min(100, confidence * 1.2)
            
        return confidence