# ⚙️ Phase 9.5 — Trade Monitoring & Auto-Rebalancing
**Goal:** Enable real-time portfolio supervision and AI-driven auto-adjustment of positions  
through dynamic weighting, trailing stop-losses, volatility adaptation, and auto-hedging.

---

## 🧩 Overview

This phase extends the **AI Live Trading Engine (Phase 9.4)** by adding:
- Continuous trade monitoring via streaming layer  
- AI reallocation decisions based on portfolio imbalance  
- Auto stop-loss and trailing protection  
- Volatility-based position resizing  
- Automated hedging (optional, per region/broker)

---

## 🧱 Folder & File Structure

```
src/
├── services/
│   ├── tradeMonitor/
│   │   ├── monitorService.ts
│   │   ├── rebalanceEngine.ts
│   │   ├── volatilityGuard.ts
│   │   ├── trailingStop.ts
│   │   └── hedgingService.ts
│   └── trading/
│       └── tradeExecutor.ts (extend existing)
├── hooks/
│   └── useTradeMonitor.ts
├── components/
│   └── dashboard/
│       ├── TradeMonitorPanel.tsx
│       ├── RebalanceSummaryCard.tsx
│       └── AlertsFeed.tsx
└── pages/
    └── trade-monitor.tsx
```

---

## 🗄️ Database Migration

Create file: `migrations/phase9_5_trade_monitoring.sql`

```sql
CREATE TABLE IF NOT EXISTS trade_monitor_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID REFERENCES trade_orders(id),
  symbol TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'stop_loss', 'rebalance', 'volatility_guard', 'hedge'
  old_position NUMERIC,
  new_position NUMERIC,
  reason TEXT,
  confidence NUMERIC,
  ai_signal JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolio_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  holdings JSONB,
  total_value NUMERIC,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trade_monitor_symbol ON trade_monitor_events(symbol);
```

---

## 🧾 Acceptance Criteria

| Requirement | Status |
|--------------|--------|
| Continuous trade monitoring every 30s | ✅ Implemented |
| Dynamic rebalancing with AI logic | ✅ Implemented |
| Volatility guard & trailing stop | ✅ Implemented |
| Hedge execution framework | ✅ Implemented |
| UI dashboard for alerts | ✅ Complete |
| Database tracking for all events | ✅ Complete |
| Configurable thresholds | ✅ Config-ready |

---

## 🚀 Outcome

BoltzTrader now features **real-time, self-correcting AI trading supervision**:
- Continuous monitoring of active positions
- Auto-reallocation to maintain optimal balance
- Stop-loss protection & volatility adaptation
- Hedging system ready for production integration

> ✅ **Phase 9.5 Complete — Real-time Trade Monitoring & Auto-Rebalancing**
> BoltzTrader now acts like an autonomous portfolio manager, balancing trades dynamically while maintaining compliance and safety.