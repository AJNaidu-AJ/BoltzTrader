import pytest
import httpx
from fastapi.testclient import TestClient
import sys
import os

# Add the scoring service to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'services', 'scoring'))

from main import app

client = TestClient(app)

def test_health_check():
    """Test health endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_score_endpoint():
    """Test scoring endpoint"""
    request_data = {
        "symbol": "AAPL",
        "timeframe": "1d"
    }
    
    response = client.post("/score", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "symbol" in data
    assert "ensemble_score" in data
    assert "confidence" in data
    assert "rule_based_score" in data
    assert "xgboost_score" in data
    assert "lstm_score" in data
    
    # Validate score ranges
    assert 0 <= data["ensemble_score"] <= 100
    assert 0 <= data["confidence"] <= 100
    assert 0 <= data["rule_based_score"] <= 100
    assert 0 <= data["xgboost_score"] <= 100
    assert 0 <= data["lstm_score"] <= 100

def test_score_invalid_symbol():
    """Test scoring with invalid symbol"""
    request_data = {
        "symbol": "",
        "timeframe": "1d"
    }
    
    response = client.post("/score", json=request_data)
    # Should still work but with empty symbol
    assert response.status_code in [200, 422]

def test_ensemble_model():
    """Test ensemble model directly"""
    from models.ensemble import EnsembleModel
    
    model = EnsembleModel()
    market_data = {
        "price_change_percent": 2.5,
        "volume_ratio": 1.5,
        "rsi": 65,
        "macd": 0.5
    }
    
    score, confidence, individual = model.predict("TEST", market_data)
    
    assert 0 <= score <= 100
    assert 0 <= confidence <= 100
    assert len(individual) == 3
    assert "rule_based" in individual
    assert "xgboost" in individual
    assert "lstm" in individual

def test_rule_based_model():
    """Test rule-based model"""
    from models.rule_based import RuleBasedModel
    
    model = RuleBasedModel()
    market_data = {
        "price_change_percent": 5.0,
        "volume_ratio": 2.0,
        "rsi": 50,
        "ma_signal": 1
    }
    
    score = model.predict("TEST", market_data)
    assert 0 <= score <= 100

if __name__ == "__main__":
    pytest.main([__file__])