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