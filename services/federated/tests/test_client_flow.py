import pytest
import numpy as np
from unittest.mock import Mock, patch
from ..client.client_runtime import FederatedClient

class TestFederatedClient:
    def setup_method(self):
        """Setup test client"""
        self.client = FederatedClient("test-client", "http://localhost:8010")
    
    def test_client_initialization(self):
        """Test client initialization"""
        assert self.client.client_id == "test-client"
        assert self.client.aggregator_url == "http://localhost:8010"
        assert self.client.private_key is not None
        assert self.client.public_key is not None
    
    @patch('requests.post')
    def test_register(self, mock_post):
        """Test client registration"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "client_id": "test-client",
            "status": "registered",
            "trust_score": 0.5
        }
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        result = self.client.register(region="us-east-1")
        
        assert result["status"] == "registered"
        assert result["client_id"] == "test-client"
        mock_post.assert_called_once()
    
    @patch('requests.get')
    def test_pull_model(self, mock_get):
        """Test model pulling"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "model_name": "test-model",
            "version": 5,
            "artifact_url": "https://storage.example.com/model.joblib"
        }
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response
        
        result = self.client.pull_model("test-model")
        
        assert result["model_name"] == "test-model"
        assert result["version"] == 5
        mock_get.assert_called_once()
    
    def test_local_train(self):
        """Test local training"""
        # Mock model
        mock_model = Mock()
        mock_model.coef_ = np.array([1.0, 2.0, 3.0])
        
        training_data = {
            'X': np.random.randn(50, 3),
            'y': np.random.randn(50)
        }
        
        delta = self.client.local_train(mock_model, training_data, epochs=1)
        
        assert isinstance(delta, np.ndarray)
        assert delta.shape == (3,)
    
    def test_encrypt_update(self):
        """Test update encryption"""
        delta = np.array([0.1, 0.2, 0.3])
        metadata = {"data_size": 100, "training_loss": 0.5}
        
        encrypted_update = self.client.encrypt_update(delta, metadata)
        
        assert 'encrypted_key' in encrypted_update
        assert 'encrypted_payload' in encrypted_update
        assert 'client_id' in encrypted_update
        assert encrypted_update['client_id'] == "test-client"
    
    @patch('requests.post')
    def test_upload_update(self, mock_post):
        """Test update upload"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "status": "received",
            "client_id": "test-client"
        }
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        encrypted_update = {
            'encrypted_key': 'mock_key',
            'encrypted_payload': 'mock_payload',
            'client_id': 'test-client'
        }
        
        result = self.client.upload_update("model-1", 1, encrypted_update)
        
        assert result["status"] == "received"
        mock_post.assert_called_once()
    
    @patch.object(FederatedClient, 'pull_model')
    @patch.object(FederatedClient, 'upload_update')
    def test_participate_in_round(self, mock_upload, mock_pull):
        """Test complete round participation"""
        # Mock responses
        mock_pull.return_value = {"version": 5, "artifact_url": "test.joblib"}
        mock_upload.return_value = {"status": "received"}
        
        training_data = {
            'X': np.random.randn(100, 10),
            'y': np.random.randn(100)
        }
        
        result = self.client.participate_in_round("test-model", training_data, 1)
        
        assert result['model_name'] == "test-model"
        assert result['round_number'] == 1
        assert 'delta_norm' in result
        assert 'upload_result' in result
        
        mock_pull.assert_called_once_with("test-model")
        mock_upload.assert_called_once()

class TestClientIntegration:
    """Integration tests for client workflow"""
    
    @patch('requests.post')
    @patch('requests.get')
    def test_full_client_workflow(self, mock_get, mock_post):
        """Test complete client workflow"""
        # Setup mocks
        mock_post.return_value.json.return_value = {"status": "registered"}
        mock_post.return_value.raise_for_status.return_value = None
        
        mock_get.return_value.json.return_value = {
            "version": 1,
            "artifact_url": "test.joblib"
        }
        mock_get.return_value.raise_for_status.return_value = None
        
        client = FederatedClient("integration-test", "http://localhost:8010")
        
        # 1. Register
        reg_result = client.register()
        assert reg_result["status"] == "registered"
        
        # 2. Participate in round
        training_data = {
            'X': np.random.randn(50, 5),
            'y': np.random.randn(50)
        }
        
        round_result = client.participate_in_round("test-model", training_data, 1)
        assert round_result['round_number'] == 1
        assert 'delta_norm' in round_result