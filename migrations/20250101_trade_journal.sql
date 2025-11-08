-- Trade journal: entries, tags, annotations, snapshots
CREATE TABLE IF NOT EXISTS trade_journal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  trade_id uuid REFERENCES trades(id),
  symbol text,
  broker text,
  side text, -- BUY/SELL
  size numeric,
  price numeric,
  pnl numeric,
  entry_time timestamptz,
  exit_time timestamptz,
  strategy_id uuid,
  notes text, -- user notes / narrative
  tags text[] DEFAULT ARRAY[]::text[],
  xai_id uuid, -- reference to xai_reasoning if exists
  metadata jsonb DEFAULT '{}', -- arbitrary snapshot (order payload, trade context)
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS journal_annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid REFERENCES trade_journal(id) ON DELETE CASCADE,
  author_id uuid REFERENCES users(id),
  comment text,
  visibility text DEFAULT 'private', -- private/public/internal
  created_at timestamptz DEFAULT now()
);

-- Precomputed analytics summary per strategy/symbol/timeframe
CREATE TABLE IF NOT EXISTS analytics_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES users(id),
  scope text NOT NULL, -- e.g., strategy:1234 or symbol:BTCUSDT or global:user
  timeframe text, -- 7d/30d/90d/all
  metrics jsonb, -- {total_trades, win_rate, avg_return, max_drawdown, sharpe, alpha}
  computed_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_journal_user ON trade_journal (user_id);
CREATE INDEX IF NOT EXISTS idx_journal_trade ON trade_journal (trade_id);
CREATE INDEX IF NOT EXISTS idx_journal_symbol ON trade_journal (symbol);
CREATE INDEX IF NOT EXISTS idx_analytics_scope ON analytics_summary (owner_id, scope, timeframe);