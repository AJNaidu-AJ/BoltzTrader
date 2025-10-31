-- Create sectors table with market cap and performance data
CREATE TABLE IF NOT EXISTS sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  market_cap DECIMAL(15,2),
  total_companies INTEGER DEFAULT 0,
  performance_1d DECIMAL(5,2),
  performance_1w DECIMAL(5,2),
  performance_1m DECIMAL(5,2),
  performance_3m DECIMAL(5,2),
  performance_6m DECIMAL(5,2),
  performance_1y DECIMAL(5,2),
  performance_ytd DECIMAL(5,2),
  volatility DECIMAL(5,2),
  beta DECIMAL(4,2),
  pe_ratio DECIMAL(6,2),
  dividend_yield DECIMAL(4,2),
  top_companies TEXT[],
  key_metrics JSONB DEFAULT '{}',
  news_sentiment DECIMAL(3,2),
  analyst_rating TEXT CHECK (analyst_rating IN ('strong_buy', 'buy', 'hold', 'sell', 'strong_sell')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_data_update TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_sectors_name ON sectors(name);
CREATE INDEX idx_sectors_code ON sectors(code);
CREATE INDEX idx_sectors_performance_1d ON sectors(performance_1d DESC);
CREATE INDEX idx_sectors_market_cap ON sectors(market_cap DESC);
CREATE INDEX idx_sectors_updated ON sectors(last_data_update DESC);

-- Enable RLS
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view sectors" ON sectors
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage sectors" ON sectors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Update trigger
CREATE TRIGGER update_sectors_updated_at 
  BEFORE UPDATE ON sectors 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();