import pytest
import numpy as np
from ..aggregation.aggregator import FederatedAggregator
from ..aggregation.weighting import WeightingStrategy

class TestFederatedAggregator:
    def setup_method(self):
        """Setup test aggregator"""
        self.aggregator = FederatedAggregator()
    
    def test_aggregate_round_basic(self):
        """Test basic aggregation functionality"""
        # Mock client updates
        client_updates = [
            {
                'client_id': 'client-1',
                'delta': np.array([0.1, 0.2, 0.3]),
                'trust_score': 0.8,
                'size_bytes': 1000
            },
            {
                'client_id': 'client-2', 
                'delta': np.array([0.2, 0.1, 0.4]),
                'trust_score': 0.6,
                'size_bytes': 1500
            }
        ]
        
        # Mock the secure aggregator to return the updates as-is
        self.aggregator.secure_aggregator.decrypt_update = lambda x: x
        
        result = self.aggregator.aggregate_round("model-1", 1, client_updates)
        
        assert result['model_id'] == "model-1"
        assert result['round_number'] == 1
        assert result['client_count'] == 2
        assert 'aggregated_delta' in result
        assert 'audit_hash' in result
        assert len(result['weights']) == 2
    
    def test_validate_update(self):
        """Test update validation"""
        valid_update = {
            'client_id': 'client-1',
            'model_id': 'model-1',
            'round_number': 1,
            'delta': [0.1, 0.2, 0.3]
        }
        
        invalid_update = {
            'client_id': 'client-1',
            'model_id': 'model-1'
            # Missing required fields
        }
        
        assert self.aggregator.validate_update(valid_update) == True
        assert self.aggregator.validate_update(invalid_update) == False
    
    def test_apply_delta_to_model(self):
        """Test applying delta to base model"""
        base_model = np.array([1.0, 2.0, 3.0])
        delta = np.array([0.1, 0.2, 0.3])
        
        new_model = self.aggregator.apply_delta_to_model(base_model, delta, learning_rate=0.1)
        
        expected = base_model + 0.1 * delta
        np.testing.assert_array_almost_equal(new_model, expected)
    
    def test_empty_updates(self):
        """Test handling of empty update list"""
        with pytest.raises(ValueError, match="No client updates to aggregate"):
            self.aggregator.aggregate_round("model-1", 1, [])

class TestWeightingStrategy:
    def setup_method(self):
        """Setup test weighting strategy"""
        self.weighting = WeightingStrategy()
    
    def test_calculate_weight(self):
        """Test weight calculation"""
        weight = self.weighting.calculate_weight(trust_score=0.8, data_size=2000)
        
        assert 0 < weight <= 1
        assert isinstance(weight, float)
    
    def test_calculate_batch_weights(self):
        """Test batch weight calculation"""
        clients = [
            {'trust_score': 0.8, 'data_size': 1000},
            {'trust_score': 0.6, 'data_size': 1500},
            {'trust_score': 0.9, 'data_size': 800}
        ]
        
        weights = self.weighting.calculate_batch_weights(clients)
        
        assert len(weights) == 3
        assert abs(sum(weights) - 1.0) < 1e-6  # Should sum to 1
        assert all(w > 0 for w in weights)  # All weights positive
    
    def test_update_trust_score(self):
        """Test trust score updates"""
        current_trust = 0.7
        
        # Good performance should increase trust
        new_trust_good = self.weighting.update_trust_score(current_trust, 0.8)
        assert new_trust_good > current_trust
        
        # Bad performance should decrease trust
        new_trust_bad = self.weighting.update_trust_score(current_trust, -0.5)
        assert new_trust_bad < current_trust
        
        # Trust should be clamped to valid range
        assert 0.1 <= new_trust_good <= 1.0
        assert 0.1 <= new_trust_bad <= 1.0
    
    def test_detect_outliers(self):
        """Test outlier detection"""
        updates = [
            {'client_id': 'client-1', 'delta': np.array([0.1, 0.1, 0.1])},
            {'client_id': 'client-2', 'delta': np.array([0.1, 0.1, 0.1])},
            {'client_id': 'client-3', 'delta': np.array([0.1, 0.1, 0.1])},
            {'client_id': 'outlier', 'delta': np.array([10.0, 10.0, 10.0])}  # Outlier
        ]
        
        outliers = self.weighting.detect_outliers(updates, threshold=2.0)
        
        assert 'outlier' in outliers
        assert len(outliers) >= 1
    
    def test_reputation_decay(self):
        """Test reputation decay for inactive clients"""
        trust_score = 0.8
        
        # No decay for active client
        no_decay = self.weighting.apply_reputation_decay(trust_score, 0)
        assert no_decay == trust_score
        
        # Decay for inactive client
        with_decay = self.weighting.apply_reputation_decay(trust_score, 10)
        assert with_decay < trust_score