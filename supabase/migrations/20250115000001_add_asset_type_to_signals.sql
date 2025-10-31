-- Add asset_type column to signals table
ALTER TABLE signals ADD COLUMN IF NOT EXISTS asset_type TEXT DEFAULT 'equity' CHECK (asset_type IN ('equity', 'crypto', 'etf'));

-- Create index for asset_type
CREATE INDEX IF NOT EXISTS idx_signals_asset_type ON signals(asset_type);

-- Update existing records to have asset_type = 'equity'
UPDATE signals SET asset_type = 'equity' WHERE asset_type IS NULL;

-- Create symbols table for asset metadata
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

-- Create indexes for symbols table
CREATE INDEX IF NOT EXISTS idx_symbols_asset_type ON symbols(asset_type);
CREATE INDEX IF NOT EXISTS idx_symbols_symbol ON symbols(symbol);
CREATE INDEX IF NOT EXISTS idx_symbols_active ON symbols(is_active);

-- Enable RLS for symbols table
ALTER TABLE symbols ENABLE ROW LEVEL SECURITY;

-- RLS Policy for symbols
CREATE POLICY "Anyone can view active symbols" ON symbols
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage symbols" ON symbols
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Insert sample data
INSERT INTO symbols (symbol, name, asset_type, sector, exchange) VALUES
('AAPL', 'Apple Inc.', 'equity', 'Technology', 'NASDAQ'),
('MSFT', 'Microsoft Corporation', 'equity', 'Technology', 'NASDAQ'),
('TSLA', 'Tesla Inc.', 'equity', 'Consumer Cyclical', 'NASDAQ'),
('BTC-USD', 'Bitcoin', 'crypto', 'Cryptocurrency', 'Binance'),
('ETH-USD', 'Ethereum', 'crypto', 'Cryptocurrency', 'Binance'),
('SPY', 'SPDR S&P 500 ETF', 'etf', 'Broad Market', 'NYSE'),
('QQQ', 'Invesco QQQ Trust', 'etf', 'Technology', 'NASDAQ')
ON CONFLICT (symbol) DO NOTHING;