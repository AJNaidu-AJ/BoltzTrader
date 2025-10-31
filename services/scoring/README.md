# AI Signal Scoring Microservice

Ensemble AI scoring service that combines Rule-Based, XGBoost, and LSTM models to generate trading signal scores.

## Features

- **Ensemble Scoring**: Combines 3 ML models with weighted averaging
- **FastAPI**: High-performance async API
- **Supabase Integration**: Direct PostgreSQL connection
- **Docker Support**: Containerized deployment
- **Comprehensive Testing**: Unit tests included

## Models

1. **Rule-Based Model** (30% weight): Technical indicator analysis
2. **XGBoost Model** (40% weight): Gradient boosting predictions  
3. **LSTM Model** (30% weight): Time series neural network

## API Endpoints

### POST /score
Generate ensemble score for a symbol.

**Request:**
```json
{
  "symbol": "AAPL",
  "timeframe": "1d"
}
```

**Response:**
```json
{
  "symbol": "AAPL",
  "timeframe": "1d",
  "ensemble_score": 75.2,
  "confidence": 82.1,
  "rule_based_score": 70.0,
  "xgboost_score": 78.5,
  "lstm_score": 76.8,
  "metadata": {...},
  "timestamp": "2024-01-15T10:30:00"
}
```

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run service
python main.py

# Or with Docker
docker-compose up --build

# Run tests
pytest tests/test_scoring.py
```

## Environment Variables

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key