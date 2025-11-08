-- Agent registry
CREATE TABLE IF NOT EXISTS agent_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text DEFAULT 'strategy', -- strategy / risk / sentiment / macro
  reliability numeric DEFAULT 0.5,
  confidence numeric DEFAULT 0.5,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Consensus decisions
CREATE TABLE IF NOT EXISTS consensus_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id uuid,
  agent_id uuid REFERENCES agent_nodes(id),
  signal text, -- BUY / SELL / HOLD
  confidence numeric,
  weight numeric,
  decision text,
  created_at timestamptz DEFAULT now()
);

-- Cross-market correlation
CREATE TABLE IF NOT EXISTS market_correlations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  base_symbol text,
  related_symbol text,
  correlation numeric,
  timeframe text DEFAULT '1D',
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_nodes_active ON agent_nodes(active);
CREATE INDEX IF NOT EXISTS idx_consensus_votes_trade ON consensus_votes(trade_id);
CREATE INDEX IF NOT EXISTS idx_market_correlations_symbols ON market_correlations(base_symbol, related_symbol);