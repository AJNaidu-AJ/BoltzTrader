import pytest
import numpy as np
import pandas as pd
from ..engine.predictor import Predictor
from ..engine.feature_extractor import extract_features

class TestPredictor:
    def setup_method(self):
        """Setup test predictor"""
        self.predictor = Predictor()
    
    def test_predictor_initialization(self):
        """Test predictor initializes correctly"""
        assert self.predictor.model is not None
        assert self.predictor.model_version == "1.0.0"
    
    def test_train_predict_cycle(self):
        """Test complete train/predict cycle"""
        # Generate synthetic training data
        np.random.seed(42)
        X = np.random.randn(100, 5)  # 5 features
        y = np.random.randn(100)     # Target returns
        
        # Train model
        metrics = self.predictor.train(X, y)
        
        # Check training metrics
        assert "train_mse" in metrics
        assert "test_mse" in metrics
        assert "feature_importance" in metrics
        assert isinstance(metrics["feature_importance"], list)
        assert len(metrics["feature_importance"]) == 5
        
        # Test predictions
        X_test = np.random.randn(10, 5)
        predictions, confidence = self.predictor.predict(X_test)
        
        # Check prediction output
        assert len(predictions) == 10
        assert isinstance(confidence, float)
        assert 0 <= confidence <= 1
        assert all(-1 <= p <= 1 for p in predictions)  # Clipped range
    
    def test_insufficient_training_data(self):
        """Test handling of insufficient training data"""
        X = np.random.randn(5, 3)  # Too few samples
        y = np.random.randn(5)
        
        metrics = self.predictor.train(X, y)
        assert "error" in metrics
    
    def test_feature_importance(self):
        """Test feature importance extraction"""
        # Train with some data first
        X = np.random.randn(50, 4)
        y = np.random.randn(50)
        self.predictor.train(X, y)
        
        importance = self.predictor.get_feature_importance()
        assert importance is not None
        assert len(importance) == 4
        assert all(0 <= imp <= 1 for imp in importance)
    
    def test_prediction_consistency(self):
        """Test prediction consistency"""
        # Train model
        X_train = np.random.randn(50, 3)
        y_train = np.random.randn(50)
        self.predictor.train(X_train, y_train)
        
        # Same input should give same prediction
        X_test = np.random.randn(5, 3)
        pred1, conf1 = self.predictor.predict(X_test)
        pred2, conf2 = self.predictor.predict(X_test)
        
        np.testing.assert_array_equal(pred1, pred2)
        assert conf1 == conf2

class TestFeatureExtractor:
    def test_extract_features_basic(self):
        """Test basic feature extraction"""
        # Create sample trade data
        trade_data = pd.DataFrame({
            'pnl': [100, -50, 200],
            'price': [50000, 51000, 49000],
            'size': [0.1, 0.2, 0.15],
            'entry_time': ['2024-01-01 10:00:00', '2024-01-01 11:00:00', '2024-01-01 12:00:00'],
            'exit_time': ['2024-01-01 12:00:00', '2024-01-01 13:00:00', '2024-01-01 14:00:00']
        })
        
        features = extract_features(trade_data)
        
        assert not features.empty
        assert 'return' in features.columns
        assert 'holding_time' in features.columns
        assert len(features) == 3
    
    def test_extract_features_empty_data(self):
        """Test feature extraction with empty data"""
        empty_df = pd.DataFrame()
        features = extract_features(empty_df)
        assert features.empty
    
    def test_extract_features_missing_columns(self):
        """Test feature extraction with missing columns"""
        minimal_data = pd.DataFrame({
            'pnl': [100, -50],
            'price': [50000, 51000],
            'size': [0.1, 0.2]
        })
        
        features = extract_features(minimal_data)
        
        assert not features.empty
        assert 'return' in features.columns
        assert 'holding_time' in features.columns
        assert features['holding_time'].iloc[0] == 0  # Default value