import pytest
from ..engine.evolution_engine import EvolutionEngine

class TestEvolutionEngine:
    def setup_method(self):
        """Setup test evolution engine"""
        self.engine = EvolutionEngine()
    
    def test_decide_increase_weight(self):
        """Test decision for strong positive signal"""
        metrics = {'recent_returns': [0.01, 0.02, 0.015]}
        predictions = [0.05, 0.06, 0.055]  # Strong positive predictions
        
        decision = self.engine.decide(metrics, predictions)
        
        assert decision.action == "INCREASE_WEIGHT"
        assert decision.score > 0.03
        assert "improvement" in decision.reason.lower()
        assert 0 <= decision.confidence <= 1
    
    def test_decide_rebalance(self):
        """Test decision for declining performance"""
        metrics = {'recent_returns': [0.02, 0.015, 0.01]}
        predictions = [-0.03, -0.025, -0.035]  # Negative predictions
        
        decision = self.engine.decide(metrics, predictions)
        
        assert decision.action in ["REBALANCE", "HOLD"]  # Depends on confidence
        assert decision.score < -0.02
    
    def test_decide_hold(self):
        """Test decision for stable performance"""
        metrics = {'recent_returns': [0.01, 0.012, 0.008]}
        predictions = [0.015, 0.012, 0.018]  # Stable predictions
        
        decision = self.engine.decide(metrics, predictions)
        
        assert decision.action == "HOLD"
        assert "stable" in decision.reason.lower()
    
    def test_decide_empty_data(self):
        """Test decision with empty data"""
        decision = self.engine.decide({}, [])
        
        assert decision.action == "HOLD"
        assert "insufficient" in decision.reason.lower()
        assert decision.confidence == 0.0
    
    def test_update_thresholds(self):
        """Test threshold updates"""
        new_thresholds = {
            "decline_threshold": -0.03,
            "improvement_threshold": 0.04
        }
        
        self.engine.update_thresholds(new_thresholds)
        
        assert self.engine.thresholds["decline_threshold"] == -0.03
        assert self.engine.thresholds["improvement_threshold"] == 0.04
        # Should keep existing threshold
        assert "confidence_threshold" in self.engine.thresholds
    
    def test_get_evolution_recommendations_poor_performance(self):
        """Test recommendations for poor performing strategy"""
        performance = {
            'win_rate': 0.35,      # Low win rate
            'avg_return': -0.005,  # Negative returns
            'max_drawdown': 0.20   # High drawdown
        }
        
        recommendations = self.engine.get_evolution_recommendations(performance)
        
        assert len(recommendations) >= 2  # Should have multiple recommendations
        
        # Check for specific recommendation types
        rec_types = [rec['type'] for rec in recommendations]
        assert 'win_rate_improvement' in rec_types
        assert 'risk_management' in rec_types
        
        # Check priorities
        priorities = [rec['priority'] for rec in recommendations]
        assert 'high' in priorities
    
    def test_get_evolution_recommendations_good_performance(self):
        """Test recommendations for well performing strategy"""
        performance = {
            'win_rate': 0.65,     # Good win rate
            'avg_return': 0.025,  # Positive returns
            'max_drawdown': 0.08  # Low drawdown
        }
        
        recommendations = self.engine.get_evolution_recommendations(performance)
        
        # Should have fewer or no recommendations for good performance
        assert len(recommendations) <= 1
    
    def test_confidence_calculation(self):
        """Test confidence calculation based on prediction variance"""
        # Low variance predictions (high confidence)
        metrics = {'recent_returns': [0.01]}
        low_variance_predictions = [0.02, 0.021, 0.019]
        
        decision1 = self.engine.decide(metrics, low_variance_predictions)
        
        # High variance predictions (low confidence)
        high_variance_predictions = [0.02, 0.05, -0.01]
        
        decision2 = self.engine.decide(metrics, high_variance_predictions)
        
        # Low variance should have higher confidence
        assert decision1.confidence > decision2.confidence