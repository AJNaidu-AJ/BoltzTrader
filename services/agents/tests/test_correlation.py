import pytest
from ..core.correlation_engine import CorrelationEngine

class TestCorrelationEngine:
    def setup_method(self):
        """Setup test correlation engine"""
        self.engine = CorrelationEngine(min_periods=5)
    
    def test_compute_correlations(self):
        """Test correlation computation"""
        price_data = {
            'BTCUSDT': [100, 102, 98, 105, 103, 107, 104],
            'ETHUSDT': [50, 51, 49, 52.5, 51.5, 53.5, 52],
            'SPY': [400, 398, 402, 395, 401, 399, 403]
        }
        
        correlations = self.engine.compute_correlations(price_data)
        
        assert isinstance(correlations, dict)
        assert 'BTCUSDT' in correlations
        assert 'ETHUSDT' in correlations['BTCUSDT']
        
        # Check correlation values are in valid range
        for symbol1, related in correlations.items():
            for symbol2, corr in related.items():
                assert -1 <= corr <= 1
    
    def test_suggest_hedges(self):
        """Test hedge pair suggestions"""
        correlations = {
            'BTCUSDT': {
                'ETHUSDT': 0.85,  # High positive correlation
                'SPY': -0.15,     # Low negative correlation
                'GLD': -0.78      # High negative correlation
            },
            'ETHUSDT': {
                'BTCUSDT': 0.85,
                'SPY': -0.12
            }
        }
        
        hedge_pairs = self.engine.suggest_hedges(correlations, threshold=0.75)
        
        assert len(hedge_pairs) >= 1
        
        # Check that high correlation pairs are suggested
        pair_symbols = [(pair[0], pair[1]) for pair in hedge_pairs]
        assert any(('BTCUSDT' in pair and 'ETHUSDT' in pair) for pair in pair_symbols)
    
    def test_calculate_hedge_ratio(self):
        """Test hedge ratio calculation"""
        base_returns = [0.02, -0.01, 0.03, -0.02, 0.01]
        hedge_returns = [0.015, -0.008, 0.025, -0.015, 0.008]
        
        hedge_ratio = self.engine.calculate_hedge_ratio(base_returns, hedge_returns)
        
        assert isinstance(hedge_ratio, float)
        # Hedge ratio should be reasonable
        assert -5 <= hedge_ratio <= 5
    
    def test_diversification_score(self):
        """Test diversification score calculation"""
        portfolio_weights = {
            'BTCUSDT': 0.4,
            'ETHUSDT': 0.3,
            'SPY': 0.3
        }
        
        correlations = {
            'BTCUSDT': {
                'ETHUSDT': 0.8,  # High correlation
                'SPY': -0.2      # Low correlation
            },
            'ETHUSDT': {
                'BTCUSDT': 0.8,
                'SPY': -0.1
            },
            'SPY': {
                'BTCUSDT': -0.2,
                'ETHUSDT': -0.1
            }
        }
        
        score = self.engine.get_diversification_score(portfolio_weights, correlations)
        
        assert 0 <= score <= 1
        assert isinstance(score, float)
    
    def test_empty_data_handling(self):
        """Test handling of empty or insufficient data"""
        # Empty data
        correlations = self.engine.compute_correlations({})
        assert correlations == {}
        
        # Insufficient data
        short_data = {
            'BTCUSDT': [100, 102],
            'ETHUSDT': [50, 51]
        }
        correlations = self.engine.compute_correlations(short_data)
        assert correlations == {}
    
    def test_hedge_ratio_edge_cases(self):
        """Test hedge ratio calculation edge cases"""
        # Empty returns
        ratio = self.engine.calculate_hedge_ratio([], [])
        assert ratio == 0.0
        
        # Mismatched lengths
        ratio = self.engine.calculate_hedge_ratio([0.01, 0.02], [0.01])
        assert ratio == 0.0
        
        # Zero variance in hedge returns
        ratio = self.engine.calculate_hedge_ratio([0.01, 0.02], [0.01, 0.01])
        assert ratio == 0.0