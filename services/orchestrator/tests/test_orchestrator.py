import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.main import app

client = TestClient(app)

@pytest.fixture
def mock_supabase():
    with patch('api.routes.models.supabase') as mock:
        mock_result = MagicMock()
        mock_result.data = [{"id": "test-id", "model_name": "test_model", "version": "1.0"}]
        mock.table.return_value.select.return_value.execute.return_value = mock_result
        mock.table.return_value.insert.return_value.execute.return_value = mock_result
        mock.table.return_value.update.return_value.eq.return_value.execute.return_value = mock_result
        yield mock

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["orchestrator"] == True

def test_list_models(mock_supabase):
    response = client.get("/api/models/")
    assert response.status_code == 200
    assert "models" in response.json()

def test_register_model(mock_supabase):
    model_data = {
        "model_name": "test_strategy",
        "version": "1.0.0",
        "performance_metrics": {"accuracy": 0.85}
    }
    response = client.post("/api/models/register", json=model_data)
    assert response.status_code == 200
    assert response.json()["status"] == "registered"

def test_promote_model(mock_supabase):
    response = client.post("/api/models/promote/test-id")
    assert response.status_code == 200
    assert response.json()["status"] == "promoted"

def test_validate_model(mock_supabase):
    validation_data = {
        "model_id": "test-id",
        "performance_metrics": {"accuracy": 0.87},
        "benchmark_metrics": {"accuracy": 0.85}
    }
    response = client.post("/api/validation/validate", json=validation_data)
    assert response.status_code == 200
    assert response.json()["status"] == "approved"

def test_governance_report(mock_supabase):
    response = client.get("/api/governance/governance-report")
    assert response.status_code == 200
    assert "model_status_distribution" in response.json()

def test_sync_models(mock_supabase):
    sync_data = {
        "target_agents": ["agent1", "agent2"],
        "model_ids": ["model1", "model2"]
    }
    response = client.post("/api/orchestrate/sync-models", json=sync_data)
    assert response.status_code == 200
    assert response.json()["status"] == "sync_initiated"

def test_agent_status():
    response = client.get("/api/orchestrate/agent-status")
    assert response.status_code == 200
    assert "agents" in response.json()
    assert response.json()["total_active"] >= 0