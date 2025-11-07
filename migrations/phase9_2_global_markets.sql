-- Global Market Snapshots
CREATE TABLE IF NOT EXISTS global_market_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region text NOT NULL,
  symbol text NOT NULL,
  price numeric,
  change_percent numeric,
  volume numeric,
  market_cap numeric,
  timestamp timestamptz DEFAULT now()
);

-- Audit for Market Data Fetch
CREATE TABLE IF NOT EXISTS market_audit (
  id bigserial PRIMARY KEY,
  source text NOT NULL,
  status text NOT NULL,
  symbols_fetched integer DEFAULT 0,
  error_message text,
  fetched_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_global_market_snapshots_symbol ON global_market_snapshots (symbol);
CREATE INDEX IF NOT EXISTS idx_global_market_snapshots_timestamp ON global_market_snapshots (timestamp);
CREATE INDEX IF NOT EXISTS idx_market_audit_fetched_at ON market_audit (fetched_at);