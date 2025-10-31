-- Create strategies table for low-code strategy builder
CREATE TABLE IF NOT EXISTS strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  conditions JSONB NOT NULL DEFAULT '[]',
  logic JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create backtest_results table
CREATE TABLE IF NOT EXISTS backtest_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID NOT NULL REFERENCES strategies(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  symbol TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_return DECIMAL(10,4),
  sharpe_ratio DECIMAL(10,4),
  max_drawdown DECIMAL(10,4),
  win_rate DECIMAL(5,4),
  total_trades INTEGER,
  profit_factor DECIMAL(10,4),
  results JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE backtest_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for strategies
CREATE POLICY "Users can view own strategies" ON strategies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own strategies" ON strategies
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for backtest_results
CREATE POLICY "Users can view own backtest results" ON backtest_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own backtest results" ON backtest_results
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_strategies_user_id ON strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_strategies_active ON strategies(is_active);
CREATE INDEX IF NOT EXISTS idx_strategies_created_at ON strategies(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_backtest_results_strategy_id ON backtest_results(strategy_id);
CREATE INDEX IF NOT EXISTS idx_backtest_results_user_id ON backtest_results(user_id);
CREATE INDEX IF NOT EXISTS idx_backtest_results_symbol ON backtest_results(symbol);

-- Update triggers
CREATE TRIGGER update_strategies_updated_at 
  BEFORE UPDATE ON strategies 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();