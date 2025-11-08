import pytest
from ..core.consensus_layer import ConsensusLayer
from ..core.confidence_aggregator import adjust_confidence, calculate_network_confidence

class TestConsensusLayer:
    def setup_method(self):
        """Setup test consensus layer"""
        self.consensus = ConsensusLayer(threshold=0.1)
    
    def test_consensus_buy_signal(self):
        """Test consensus aggregation for BUY signal"""
        agent_signals = [
            {'agent_id': '1', 'signal': 'BUY', 'confidence': 0.8, 'weight': 0.7},
            {'agent_id': '2', 'signal': 'BUY', 'confidence': 0.9, 'weight': 0.8},
            {'agent_id': '3', 'signal': 'HOLD', 'confidence': 0.6, 'weight': 0.5}
        ]
        
        result = self.consensus.aggregate(agent_signals)
        
        assert result['consensus'] == 'BUY'
        assert result['confidence'] > 0.5
        assert result['votes'] == 3
        assert result['agent_breakdown']['BUY'] == 2
        assert result['agent_breakdown']['HOLD'] == 1
    
    def test_consensus_hold_signal(self):
        """Test consensus aggregation for HOLD signal"""
        agent_signals = [
            {'agent_id': '1', 'signal': 'BUY', 'confidence': 0.3, 'weight': 0.4},
            {'agent_id': '2', 'signal': 'SELL', 'confidence': 0.3, 'weight': 0.4},
            {'agent_id': '3', 'signal': 'HOLD', 'confidence': 0.8, 'weight': 0.9}
        ]
        
        result = self.consensus.aggregate(agent_signals)
        
        assert result['consensus'] == 'HOLD'
        assert 0 <= result['confidence'] <= 1
    
    def test_empty_signals(self):
        """Test consensus with empty signals"""
        result = self.consensus.aggregate([])
        
        assert result['consensus'] == 'HOLD'
        assert result['confidence'] == 0.0
        assert result['votes'] == 0
    
    def test_validate_consensus(self):
        """Test consensus validation"""
        good_consensus = {
            'confidence': 0.8,
            'agreement': 0.7
        }
        
        bad_consensus = {
            'confidence': 0.4,
            'agreement': 0.3
        }
        
        assert self.consensus.validate_consensus(good_consensus, 0.6, 0.5) == True
        assert self.consensus.validate_consensus(bad_consensus, 0.6, 0.5) == False
    
    def test_threshold_update(self):
        """Test threshold update"""
        original_threshold = self.consensus.threshold
        self.consensus.update_threshold(0.2)
        
        assert self.consensus.threshold == 0.2
        assert self.consensus.threshold != original_threshold

class TestConfidenceAggregator:
    def test_adjust_confidence_agreement(self):
        """Test confidence adjustment with peer agreement"""
        agent_results = [
            {'agent_id': '1', 'signal': 'BUY', 'confidence': 0.7}
        ]
        
        peer_feedback = [
            {'signal': 'BUY'},
            {'signal': 'BUY'},
            {'signal': 'SELL'}
        ]
        
        adjusted = adjust_confidence(agent_results, peer_feedback)
        
        # Should increase confidence due to 2/3 agreement
        assert adjusted[0]['confidence'] >= 0.7
        assert 'peer_agreement' in adjusted[0]
        assert adjusted[0]['peer_agreement'] > 0.5
    
    def test_calculate_network_confidence(self):
        """Test network confidence calculation"""
        agent_signals = [
            {'signal': 'BUY', 'confidence': 0.8},
            {'signal': 'BUY', 'confidence': 0.9},
            {'signal': 'SELL', 'confidence': 0.6}
        ]
        
        network_conf = calculate_network_confidence(agent_signals)
        
        assert 0 <= network_conf <= 1
        assert isinstance(network_conf, float)
    
    def test_empty_network_confidence(self):
        """Test network confidence with empty signals"""
        network_conf = calculate_network_confidence([])
        assert network_conf == 0.0