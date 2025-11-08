# BoltzTrader Journal & Analytics Service

## Overview
Trade Journal & Advanced Analytics subsystem for BoltzTrader that records trade-level narratives, provides deep analytics, and generates exportable reports.

## Features
- Trade journal with notes, tags, and annotations
- Advanced analytics (win rate, Sharpe ratio, max drawdown)
- Exportable reports (CSV, Excel, PDF)
- Real-time analytics computation
- Audit logging integration

## Setup

### Database Migration
```bash
psql $DATABASE_URL -f ../../migrations/20250101_trade_journal.sql
```

### Python Environment
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Run API Server
```bash
uvicorn api.main:app --reload --port 8010
```

## API Endpoints

### Journal
- `POST /api/journal/` - Create journal entry
- `GET /api/journal/` - List entries with filters
- `GET /api/journal/{id}` - Get detailed entry
- `PUT /api/journal/{id}` - Update entry
- `DELETE /api/journal/{id}` - Delete entry
- `POST /api/journal/{id}/annotations` - Add annotation

### Analytics
- `POST /api/analytics/compute` - Trigger analytics computation
- `GET /api/analytics/{owner_id}/{scope}/{timeframe}` - Get analytics
- `GET /api/analytics/trade-history` - Get trade time series

### Exports
- `POST /api/exports/report` - Generate report
- `GET /api/exports/{report_id}` - Download report

## Testing
```bash
pytest -q
```

## Architecture
- FastAPI backend with async PostgreSQL
- Pydantic models for validation
- Background workers for analytics
- Report generation with templates
- Audit logging integration