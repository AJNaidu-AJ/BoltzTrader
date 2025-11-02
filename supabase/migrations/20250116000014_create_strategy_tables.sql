-- Create strategy performance tracking tables
CREATE TABLE IF NOT EXISTS strategy_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('BUY', 'SELL', 'HOLD')),
  confidence DECIMAL(3,2) NOT NULL,
  entry_price DECIMAL(10,2),
  exit_price DECIMAL(10,2),
  pnl DECIMAL(10,2),
  trade_duration INTEGER, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create strategy metadata table
CREATE TABLE IF NOT EXISTS strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  strategy_type TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  weight DECIMAL(3,2) DEFAULT 1.0,
  parameters JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_strategy_performance_strategy_id ON strategy_performance(strategy_id);
CREATE INDEX idx_strategy_performance_symbol ON strategy_performance(symbol);
CREATE INDEX idx_strategy_performance_created_at ON strategy_performance(created_at DESC);
CREATE INDEX idx_strategies_strategy_id ON strategies(strategy_id);
CREATE INDEX idx_strategies_enabled ON strategies(enabled);

-- Enable RLS
ALTER TABLE strategy_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "System can manage strategy performance" ON strategy_performance
  FOR ALL USING (true);

CREATE POLICY "System can manage strategies" ON strategies
  FOR ALL USING (true);

-- Insert default strategies
INSERT INTO strategies (strategy_id, name, description, strategy_type, parameters) VALUES
('momentum_v1', 'Momentum Trend Following', 'Follows strong directional trends using RSI, EMA, and Volume', 'momentum', '{"rsi_threshold": 60, "volume_multiplier": 1.5}'),
('mean_reversion_v1', 'Mean Reversion', 'Trades oversold/overbought reversals using RSI and Bollinger Bands', 'mean_reversion', '{"oversold_threshold": 30, "overbought_threshold": 70}'),
('breakout_v1', 'Breakout Detection', 'Detects price breaking key support/resistance levels with volume', 'breakout', '{"volume_threshold": 1.8}'),
('sentiment_fusion_v1', 'Sentiment Fusion', 'Combines market sentiment with technical indicators', 'sentiment_fusion', '{"sentiment_threshold": 0.6}')
ON CONFLICT (strategy_id) DO NOTHING;

-- Update triggers
CREATE TRIGGER update_strategies_updated_at 
  BEFORE UPDATE ON strategies 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();