-- Run this SQL in Supabase SQL Editor to create tables and sample data

-- 1. Add asset_type to signals table if it doesn't exist
ALTER TABLE signals ADD COLUMN IF NOT EXISTS asset_type TEXT DEFAULT 'equity' CHECK (asset_type IN ('equity', 'crypto', 'etf'));
CREATE INDEX IF NOT EXISTS idx_signals_asset_type ON signals(asset_type);

-- 2. Create symbols table
CREATE TABLE IF NOT EXISTS symbols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('equity', 'crypto', 'etf')),
  sector TEXT,
  exchange TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_symbols_asset_type ON symbols(asset_type);
CREATE INDEX IF NOT EXISTS idx_symbols_symbol ON symbols(symbol);

-- 3. Enable RLS
ALTER TABLE symbols ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
DROP POLICY IF EXISTS "Anyone can view active symbols" ON symbols;
CREATE POLICY "Anyone can view active symbols" ON symbols FOR SELECT USING (is_active = true);

-- 5. Insert sample symbols
INSERT INTO symbols (symbol, name, asset_type, sector, exchange) VALUES
('AAPL', 'Apple Inc.', 'equity', 'Technology', 'NASDAQ'),
('MSFT', 'Microsoft Corporation', 'equity', 'Technology', 'NASDAQ'),
('TSLA', 'Tesla Inc.', 'equity', 'Consumer Cyclical', 'NASDAQ'),
('BTC-USD', 'Bitcoin', 'crypto', 'Cryptocurrency', 'Binance'),
('ETH-USD', 'Ethereum', 'crypto', 'Cryptocurrency', 'Binance'),
('SPY', 'SPDR S&P 500 ETF', 'etf', 'Broad Market', 'NYSE')
ON CONFLICT (symbol) DO NOTHING;

-- 6. Insert sample signals
INSERT INTO signals (symbol, company_name, current_price, price_change, price_change_percent, volume, confidence, rank, sector, asset_type, timeframe) VALUES
('AAPL', 'Apple Inc.', 150.25, 2.50, 1.69, 45000000, 85, 'top', 'Technology', 'equity', '1d'),
('BTC-USD', 'Bitcoin', 42500.00, 1250.00, 3.03, 28000000, 78, 'top', 'Cryptocurrency', 'crypto', '1d'),
('SPY', 'SPDR S&P 500 ETF', 475.80, -1.20, -0.25, 12000000, 65, 'medium', 'Broad Market', 'etf', '1d')
ON CONFLICT DO NOTHING;