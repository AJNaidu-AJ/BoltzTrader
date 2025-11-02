-- Create risk policy tables
CREATE TABLE IF NOT EXISTS risk_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  policy_type TEXT NOT NULL,
  priority INTEGER DEFAULT 1,
  enabled BOOLEAN DEFAULT true,
  thresholds JSONB DEFAULT '{}',
  trigger_count INTEGER DEFAULT 0,
  last_triggered TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create risk evaluation logs
CREATE TABLE IF NOT EXISTS risk_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  trade_request JSONB NOT NULL,
  portfolio_state JSONB NOT NULL,
  market_data JSONB NOT NULL,
  risk_assessment JSONB NOT NULL,
  policies_triggered TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_risk_policies_policy_id ON risk_policies(policy_id);
CREATE INDEX idx_risk_policies_enabled ON risk_policies(enabled);
CREATE INDEX idx_risk_evaluations_symbol ON risk_evaluations(symbol);
CREATE INDEX idx_risk_evaluations_created_at ON risk_evaluations(created_at DESC);

-- Enable RLS
ALTER TABLE risk_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_evaluations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "System can manage risk policies" ON risk_policies
  FOR ALL USING (true);

CREATE POLICY "System can manage risk evaluations" ON risk_evaluations
  FOR ALL USING (true);

-- Insert default risk policies
INSERT INTO risk_policies (policy_id, name, description, policy_type, priority, thresholds) VALUES
('exposure_control_v1', 'Dynamic Exposure Control', 'Controls position sizing and portfolio exposure', 'exposure', 1, '{"max_single_position": 0.15, "max_total_exposure": 0.80, "max_sector_exposure": 0.25}'),
('volatility_gate_v1', 'Volatility-Adaptive Sizing', 'Adjusts position size based on market volatility', 'volatility', 2, '{"low_vol_threshold": 15, "high_vol_threshold": 25, "extreme_vol_threshold": 40}'),
('drawdown_controller_v1', 'Loss Containment System', 'Monitors losses and freezes trading when limits hit', 'drawdown', 1, '{"daily_loss_limit": 0.05, "max_drawdown_limit": 0.15, "cooling_period_hours": 24}'),
('reputation_logic_v1', 'Strategy Reputation System', 'Rates strategies based on historical performance', 'reputation', 3, '{"min_reputation_score": 0.3, "low_reputation_threshold": 0.5, "high_reputation_threshold": 0.8}')
ON CONFLICT (policy_id) DO NOTHING;

-- Update triggers
CREATE TRIGGER update_risk_policies_updated_at 
  BEFORE UPDATE ON risk_policies 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();