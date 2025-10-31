-- Create agent_configs table
CREATE TABLE IF NOT EXISTS agent_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agent_decisions table
CREATE TABLE IF NOT EXISTS agent_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  decision_id TEXT NOT NULL UNIQUE,
  symbol TEXT NOT NULL,
  action TEXT CHECK (action IN ('buy', 'sell', 'hold')) NOT NULL,
  quantity INTEGER NOT NULL,
  confidence DECIMAL(3,2) NOT NULL,
  reasoning TEXT[] DEFAULT '{}',
  risk_score DECIMAL(3,2) NOT NULL,
  expected_return DECIMAL(8,4),
  stop_loss DECIMAL(15,4),
  take_profit DECIMAL(15,4),
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'executed')) DEFAULT 'pending',
  performance_score DECIMAL(8,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agent_feedback table
CREATE TABLE IF NOT EXISTS agent_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  decision_id TEXT NOT NULL REFERENCES agent_decisions(decision_id),
  user_action TEXT CHECK (user_action IN ('approved', 'rejected', 'modified')) NOT NULL,
  actual_outcome TEXT CHECK (actual_outcome IN ('profit', 'loss', 'neutral')),
  user_notes TEXT,
  performance_score DECIMAL(8,4) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agent_learning_data table
CREATE TABLE IF NOT EXISTS agent_learning_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  decision_id TEXT NOT NULL,
  feedback TEXT NOT NULL,
  outcome TEXT,
  score DECIMAL(8,4) NOT NULL,
  market_conditions JSONB DEFAULT '{}',
  features JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agent_performance_metrics table
CREATE TABLE IF NOT EXISTS agent_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  date DATE NOT NULL,
  total_decisions INTEGER DEFAULT 0,
  approved_decisions INTEGER DEFAULT 0,
  rejected_decisions INTEGER DEFAULT 0,
  avg_confidence DECIMAL(3,2) DEFAULT 0,
  total_return DECIMAL(8,4) DEFAULT 0,
  win_rate DECIMAL(3,2) DEFAULT 0,
  sharpe_ratio DECIMAL(8,4) DEFAULT 0,
  max_drawdown DECIMAL(8,4) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE agent_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_learning_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agent_configs
CREATE POLICY "Users can view own agent config" ON agent_configs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own agent config" ON agent_configs
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for agent_decisions
CREATE POLICY "Users can view own agent decisions" ON agent_decisions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own agent decisions" ON agent_decisions
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for agent_feedback
CREATE POLICY "Users can view own agent feedback" ON agent_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own agent feedback" ON agent_feedback
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for agent_learning_data
CREATE POLICY "Users can view own learning data" ON agent_learning_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own learning data" ON agent_learning_data
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for agent_performance_metrics
CREATE POLICY "Users can view own performance metrics" ON agent_performance_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own performance metrics" ON agent_performance_metrics
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agent_configs_user_id ON agent_configs(user_id);

CREATE INDEX IF NOT EXISTS idx_agent_decisions_user_id ON agent_decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_decisions_decision_id ON agent_decisions(decision_id);
CREATE INDEX IF NOT EXISTS idx_agent_decisions_symbol ON agent_decisions(symbol);
CREATE INDEX IF NOT EXISTS idx_agent_decisions_status ON agent_decisions(status);
CREATE INDEX IF NOT EXISTS idx_agent_decisions_created_at ON agent_decisions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_feedback_user_id ON agent_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_feedback_decision_id ON agent_feedback(decision_id);

CREATE INDEX IF NOT EXISTS idx_agent_learning_data_user_id ON agent_learning_data(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_learning_data_decision_id ON agent_learning_data(decision_id);

CREATE INDEX IF NOT EXISTS idx_agent_performance_metrics_user_id ON agent_performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_performance_metrics_date ON agent_performance_metrics(date DESC);

-- Update triggers
CREATE TRIGGER update_agent_configs_updated_at 
  BEFORE UPDATE ON agent_configs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_decisions_updated_at 
  BEFORE UPDATE ON agent_decisions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update daily performance metrics
CREATE OR REPLACE FUNCTION update_daily_agent_metrics(p_user_id UUID, p_date DATE)
RETURNS void AS $$
DECLARE
  v_total_decisions INTEGER;
  v_approved_decisions INTEGER;
  v_rejected_decisions INTEGER;
  v_avg_confidence DECIMAL(3,2);
  v_total_return DECIMAL(8,4);
BEGIN
  -- Calculate daily metrics
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'approved'),
    COUNT(*) FILTER (WHERE status = 'rejected'),
    AVG(confidence),
    AVG(performance_score) FILTER (WHERE performance_score IS NOT NULL)
  INTO 
    v_total_decisions,
    v_approved_decisions,
    v_rejected_decisions,
    v_avg_confidence,
    v_total_return
  FROM agent_decisions 
  WHERE user_id = p_user_id 
    AND DATE(created_at) = p_date;

  -- Upsert daily metrics
  INSERT INTO agent_performance_metrics (
    user_id, date, total_decisions, approved_decisions, rejected_decisions,
    avg_confidence, total_return
  ) VALUES (
    p_user_id, p_date, v_total_decisions, v_approved_decisions, v_rejected_decisions,
    COALESCE(v_avg_confidence, 0), COALESCE(v_total_return, 0)
  )
  ON CONFLICT (user_id, date) 
  DO UPDATE SET
    total_decisions = EXCLUDED.total_decisions,
    approved_decisions = EXCLUDED.approved_decisions,
    rejected_decisions = EXCLUDED.rejected_decisions,
    avg_confidence = EXCLUDED.avg_confidence,
    total_return = EXCLUDED.total_return;
END;
$$ LANGUAGE plpgsql;