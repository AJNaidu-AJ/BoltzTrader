# BoltzTrader Multi-Agent Co-Trading Network

## Overview
Distributed network of collaborating AI trading agents that validate trades through consensus voting, aggregate confidence dynamically, and share signals across correlated markets for hedging and diversification.

## Features
- **Multi-Agent Consensus**: Weighted voting system with confidence aggregation
- **Cross-Market Correlation**: Real-time correlation analysis and hedge detection
- **Dynamic Confidence**: Peer-based confidence adjustment and network validation
- **Hedging Intelligence**: Automated hedge pair suggestions and ratio calculation
- **Agent Reliability**: Performance-based agent scoring and outlier detection

## Architecture

### Core Components
- **Agent Nodes**: Individual trading agents with specialized strategies
- **Consensus Layer**: Weighted voting and decision aggregation
- **Correlation Engine**: Cross-market analysis and hedge detection
- **Confidence Aggregator**: Peer validation and network confidence

### Agent Types
1. **Strategy Agents**: Momentum, mean reversion, breakout strategies
2. **Risk Agents**: Volatility-based risk assessment
3. **Sentiment Agents**: Market sentiment analysis
4. **Macro Agents**: Macroeconomic factor analysis

## API Endpoints

### Mesh Network
- `POST /api/mesh/run` - Run multi-agent consensus
- `GET /api/mesh/agents` - Get active agents
- `POST /api/mesh/agents/{id}/update` - Update agent reliability

### Consensus
- `POST /api/consensus/vote` - Run consensus voting
- `POST /api/consensus/validate` - Validate consensus quality
- `POST /api/consensus/outliers` - Detect outlier agents

### Hedging
- `POST /api/hedging/correlate` - Compute correlations
- `POST /api/hedging/hedge-ratio` - Calculate hedge ratios
- `GET /api/hedging/recommendations/{symbol}` - Get hedge recommendations

## Setup

### Database Migration
```bash
psql $DATABASE_URL -f ../../migrations/20250103_multiagent_mesh.sql
```

### Python Environment
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Run API Server
```bash
uvicorn api.main:app --reload --port 8030
```

## Consensus Algorithm
1. **Signal Generation**: Each agent generates trading signals with confidence
2. **Weighted Voting**: Signals weighted by agent reliability and confidence
3. **Consensus Calculation**: Aggregate score determines final decision
4. **Validation**: Quality checks for confidence and agreement thresholds

## Correlation Analysis
- **Real-time Computation**: Continuous correlation matrix updates
- **Hedge Detection**: Automatic identification of hedge pairs
- **Diversification Scoring**: Portfolio diversification assessment
- **Market Regime Detection**: Risk-on/risk-off environment analysis

## Testing
```bash
pytest -q --cov=. --cov-report=html
```

## Monitoring
- Agent performance tracking
- Consensus accuracy metrics
- Correlation stability monitoring
- Network health indicators