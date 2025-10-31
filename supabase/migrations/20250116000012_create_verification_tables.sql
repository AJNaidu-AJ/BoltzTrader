-- Create GPT usage logs table
CREATE TABLE IF NOT EXISTS gpt_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  model TEXT NOT NULL,
  prompt_tokens INTEGER NOT NULL,
  completion_tokens INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,
  cost_usd DECIMAL(10,6) NOT NULL,
  endpoint TEXT NOT NULL,
  request_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create broker configs table
CREATE TABLE IF NOT EXISTS broker_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_sandbox BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  api_endpoint TEXT NOT NULL,
  sandbox_endpoint TEXT,
  live_endpoint TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user feedback table
CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT CHECK (type IN ('bug', 'feature', 'improvement', 'general')) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  page_url TEXT,
  user_agent TEXT,
  status TEXT CHECK (status IN ('new', 'reviewed', 'resolved', 'closed')) DEFAULT 'new',
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create PWA installations table
CREATE TABLE IF NOT EXISTS pwa_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  platform TEXT NOT NULL,
  user_agent TEXT,
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE gpt_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE pwa_installations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for GPT usage logs
CREATE POLICY "Users can view own GPT usage" ON gpt_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert GPT usage" ON gpt_usage_logs
  FOR INSERT WITH CHECK (true);

-- RLS Policies for broker configs (admin only)
CREATE POLICY "Admins can manage broker configs" ON broker_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = id 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Users can view broker configs" ON broker_configs
  FOR SELECT USING (true);

-- RLS Policies for user feedback
CREATE POLICY "Users can view own feedback" ON user_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create feedback" ON user_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all feedback" ON user_feedback
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = id 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for PWA installations
CREATE POLICY "Users can view own installations" ON pwa_installations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create installations" ON pwa_installations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_gpt_usage_logs_user_id ON gpt_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_gpt_usage_logs_timestamp ON gpt_usage_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_gpt_usage_logs_model ON gpt_usage_logs(model);

CREATE INDEX IF NOT EXISTS idx_broker_configs_broker_id ON broker_configs(broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_configs_active ON broker_configs(is_active);

CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_type ON user_feedback(type);
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON user_feedback(status);
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON user_feedback(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pwa_installations_user_id ON pwa_installations(user_id);
CREATE INDEX IF NOT EXISTS idx_pwa_installations_platform ON pwa_installations(platform);

-- Update triggers
CREATE TRIGGER update_user_feedback_updated_at 
  BEFORE UPDATE ON user_feedback 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default broker configurations
INSERT INTO broker_configs (broker_id, name, is_sandbox, is_active, api_endpoint, sandbox_endpoint, live_endpoint) VALUES
('zerodha', 'Zerodha', true, true, 'https://api.kite.trade', 'https://api.kite.trade', 'https://api.kite.trade'),
('alpaca', 'Alpaca', true, true, 'https://paper-api.alpaca.markets', 'https://paper-api.alpaca.markets', 'https://api.alpaca.markets'),
('interactive_brokers', 'Interactive Brokers', true, false, 'https://localhost:5000', 'https://localhost:5000', 'https://api.interactivebrokers.com')
ON CONFLICT (broker_id) DO NOTHING;

-- Function to get GPT usage summary
CREATE OR REPLACE FUNCTION get_gpt_usage_summary(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  start_date TIMESTAMP WITH TIME ZONE;
BEGIN
  start_date := NOW() - INTERVAL '1 day' * p_days;
  
  SELECT json_build_object(
    'total_tokens', COALESCE(SUM(total_tokens), 0),
    'total_cost', COALESCE(SUM(cost_usd), 0),
    'request_count', COUNT(*),
    'by_model', json_object_agg(
      model, 
      json_build_object(
        'tokens', SUM(total_tokens),
        'cost', SUM(cost_usd),
        'requests', COUNT(*)
      )
    )
  ) INTO result
  FROM gpt_usage_logs 
  WHERE user_id = p_user_id 
    AND timestamp >= start_date
  GROUP BY model;
  
  RETURN COALESCE(result, '{"total_tokens": 0, "total_cost": 0, "request_count": 0, "by_model": {}}'::json);
END;
$$ LANGUAGE plpgsql;