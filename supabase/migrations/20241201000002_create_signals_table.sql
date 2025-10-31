-- Create signals table with ranking, confidence, and metadata
CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('buy', 'sell', 'hold', 'strong_buy', 'strong_sell')),
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  ranking INTEGER,
  price_target DECIMAL(10,2),
  current_price DECIMAL(10,2),
  stop_loss DECIMAL(10,2),
  time_horizon TEXT CHECK (time_horizon IN ('short', 'medium', 'long')),
  sector TEXT,
  market_cap_category TEXT CHECK (market_cap_category IN ('small', 'mid', 'large', 'mega')),
  explanation TEXT,
  technical_indicators JSONB DEFAULT '{}',
  fundamental_data JSONB DEFAULT '{}',
  risk_factors TEXT[],
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0
);

-- Create indexes
CREATE INDEX idx_signals_symbol ON signals(symbol);
CREATE INDEX idx_signals_type ON signals(signal_type);
CREATE INDEX idx_signals_confidence ON signals(confidence_score DESC);
CREATE INDEX idx_signals_ranking ON signals(ranking);
CREATE INDEX idx_signals_sector ON signals(sector);
CREATE INDEX idx_signals_created_at ON signals(created_at DESC);
CREATE INDEX idx_signals_active ON signals(is_active);

-- Enable RLS
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active signals" ON signals
  FOR SELECT USING (is_active = true);

CREATE POLICY "Premium users can create signals" ON signals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND subscription_status IN ('premium', 'enterprise')
    )
  );

CREATE POLICY "Users can update own signals" ON signals
  FOR UPDATE USING (created_by = auth.uid());

-- Update trigger
CREATE TRIGGER update_signals_updated_at 
  BEFORE UPDATE ON signals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();