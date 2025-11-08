# 🤖 BoltzTrader Global AI Orchestrator

Central AI governance and model management system for BoltzTrader's distributed AI network.

## 🚀 Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export SUPABASE_URL="your_supabase_url"
export SUPABASE_KEY="your_supabase_service_key"

# Run database migrations
psql -f migrations/20250105_model_registry.sql

# Start the service
uvicorn api.main:app --host 0.0.0.0 --port 8008
```

## 📡 API Usage

### Register Model
```bash
curl -X POST "http://localhost:8008/api/models/register" \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "strategy_v2",
    "version": "2.1.0",
    "performance_metrics": {"accuracy": 0.87}
  }'
```

### Validate Model
```bash
curl -X POST "http://localhost:8008/api/validation/validate" \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": "model-uuid",
    "performance_metrics": {"accuracy": 0.89},
    "benchmark_metrics": {"accuracy": 0.85}
  }'
```

### Sync to Agents
```bash
curl -X POST "http://localhost:8008/api/orchestrate/sync-models" \
  -H "Content-Type: application/json" \
  -d '{
    "target_agents": ["strategy_agent", "risk_agent"],
    "model_ids": ["model1", "model2"]
  }'
```

## 🧪 Testing

```bash
# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=. --cov-report=html
```

## 🔒 Security
- Audit log integrity with SHA-256 checksums
- Performance regression detection
- Compliance validation pipeline
- Immutable event logging

## 📊 Monitoring
- Health endpoint: `/health`
- Metrics endpoint: `/api/orchestrate/orchestration-metrics`
- Governance reports: `/api/governance/governance-report`