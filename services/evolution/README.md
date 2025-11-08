# BoltzTrader Predictive Analytics & Strategy Evolution Engine

## Overview
Advanced ML-powered system that predicts future market behavior and automatically evolves trading strategies based on performance analytics and predictive insights.

## Features
- **Predictive Analytics**: RandomForest-based return and volatility forecasting
- **Strategy Evolution**: Automated strategy optimization based on performance metrics
- **Feature Engineering**: Advanced technical indicator extraction
- **Automated Retraining**: Scheduled model updates with fresh data
- **Decision Engine**: Intelligent action recommendations (HOLD/REBALANCE/INCREASE_WEIGHT)

## Architecture

### Core Components
- **Predictor**: ML model for return/volatility prediction
- **Evolution Engine**: Strategy optimization decision maker
- **Feature Extractor**: Technical indicator and feature engineering
- **Training Worker**: Automated model retraining system
- **Scheduler**: Automated training job management

### API Endpoints
- `POST /api/predictions/run` - Generate predictions
- `POST /api/predictions/train` - Train model
- `POST /api/evolution/decide` - Get evolution decision
- `GET /api/evolution/recommendations/{strategy_id}` - Get recommendations

## Setup

### Database Migration
```bash
psql $DATABASE_URL -f ../../migrations/20250102_predictive_evolution.sql
```

### Python Environment
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Run Services
```bash
# API Server
uvicorn api.main:app --reload --port 8020

# Training Worker (one-time)
python -m workers.training_worker

# Scheduler (continuous)
python -m workers.retrain_scheduler
```

## Model Training
The system uses RandomForest regression for predictions with:
- **Features**: Returns, holding time, volatility, volume, confidence
- **Target**: Future returns
- **Validation**: Train/test split with MSE evaluation
- **Persistence**: Models saved to disk with joblib

## Evolution Logic
Decision thresholds:
- **Decline**: < -2% → REBALANCE (if confident)
- **Improvement**: > 3% → INCREASE_WEIGHT
- **Stable**: Otherwise → HOLD

## Scheduling
- **Weekly Full Training**: Sundays 2:00 AM UTC
- **Daily Light Training**: Daily 6:00 AM UTC
- **On-Demand**: Via API endpoints

## Testing
```bash
pytest -q --cov=. --cov-report=html
```

## Monitoring
- Model performance metrics
- Prediction accuracy tracking
- Evolution decision outcomes
- Training job success rates