-- Create backtests table
CREATE TABLE IF NOT EXISTS backtests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  period_days INTEGER NOT NULL,
  results JSONB NOT NULL,
  metrics JSONB NOT NULL,
  pdf_url TEXT,
  csv_url TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_backtests_symbol ON backtests(symbol);
CREATE INDEX IF NOT EXISTS idx_backtests_created_at ON backtests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backtests_status ON backtests(status);

-- Enable RLS
ALTER TABLE backtests ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Anyone can view backtests" ON backtests
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create backtests" ON backtests
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);