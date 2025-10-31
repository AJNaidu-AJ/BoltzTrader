-- Create KYC profiles table
CREATE TABLE IF NOT EXISTS kyc_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  nationality TEXT NOT NULL,
  address JSONB NOT NULL,
  phone TEXT NOT NULL,
  occupation TEXT NOT NULL,
  source_of_funds TEXT NOT NULL,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('incomplete', 'pending', 'approved', 'rejected')) DEFAULT 'incomplete',
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_by UUID REFERENCES auth.users(id),
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create KYC documents table
CREATE TABLE IF NOT EXISTS kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT CHECK (type IN ('passport', 'drivers_license', 'national_id', 'utility_bill', 'bank_statement')) NOT NULL,
  file_path TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Create AML checks table
CREATE TABLE IF NOT EXISTS aml_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  check_type TEXT CHECK (check_type IN ('sanctions', 'pep', 'adverse_media')) NOT NULL,
  result TEXT CHECK (result IN ('clear', 'match', 'error')) NOT NULL,
  details JSONB DEFAULT '{}',
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  details JSONB DEFAULT '{}',
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical')) DEFAULT 'low',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create API keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  key TEXT NOT NULL UNIQUE,
  secret TEXT NOT NULL,
  permissions TEXT[] DEFAULT '{}',
  rate_limit INTEGER DEFAULT 1000,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- Create API usage table
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  requests_count INTEGER DEFAULT 1,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(api_key_id, endpoint, method, date)
);

-- Create API requests table for rate limiting
CREATE TABLE IF NOT EXISTS api_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enterprise subscriptions table
CREATE TABLE IF NOT EXISTS enterprise_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  plan TEXT CHECK (plan IN ('pro', 'enterprise', 'institutional')) NOT NULL,
  features TEXT[] DEFAULT '{}',
  api_quota INTEGER DEFAULT 0,
  custom_limits JSONB DEFAULT '{}',
  status TEXT CHECK (status IN ('active', 'suspended', 'cancelled')) DEFAULT 'active',
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'annual')) DEFAULT 'monthly',
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create compliance reports table
CREATE TABLE IF NOT EXISTS compliance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  data JSONB NOT NULL,
  generated_by UUID REFERENCES auth.users(id),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE kyc_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE aml_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for KYC
CREATE POLICY "Users can view own KYC profile" ON kyc_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own KYC profile" ON kyc_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own KYC documents" ON kyc_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own KYC documents" ON kyc_documents
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for AML
CREATE POLICY "Users can view own AML checks" ON aml_checks
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for audit logs (admin only for full access)
CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for API keys
CREATE POLICY "Users can view own API keys" ON api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own API keys" ON api_keys
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for API usage
CREATE POLICY "Users can view own API usage" ON api_usage
  FOR SELECT USING (
    api_key_id IN (
      SELECT id FROM api_keys WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for enterprise subscriptions
CREATE POLICY "Users can view own subscription" ON enterprise_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own subscription" ON enterprise_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_kyc_profiles_user_id ON kyc_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_profiles_status ON kyc_profiles(status);

CREATE INDEX IF NOT EXISTS idx_kyc_documents_user_id ON kyc_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_type ON kyc_documents(type);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_status ON kyc_documents(status);

CREATE INDEX IF NOT EXISTS idx_aml_checks_user_id ON aml_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_aml_checks_type ON aml_checks(check_type);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_risk_level ON audit_logs(risk_level);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);

CREATE INDEX IF NOT EXISTS idx_api_usage_key_date ON api_usage(api_key_id, date);
CREATE INDEX IF NOT EXISTS idx_api_requests_key_created ON api_requests(api_key_id, created_at);

CREATE INDEX IF NOT EXISTS idx_enterprise_subscriptions_user_id ON enterprise_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_enterprise_subscriptions_plan ON enterprise_subscriptions(plan);
CREATE INDEX IF NOT EXISTS idx_enterprise_subscriptions_status ON enterprise_subscriptions(status);

-- Update triggers
CREATE TRIGGER update_kyc_profiles_updated_at 
  BEFORE UPDATE ON kyc_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enterprise_subscriptions_updated_at 
  BEFORE UPDATE ON enterprise_subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment API usage
CREATE OR REPLACE FUNCTION increment_api_usage(
  p_api_key_id UUID,
  p_endpoint TEXT,
  p_method TEXT,
  p_date DATE
)
RETURNS void AS $$
BEGIN
  INSERT INTO api_usage (api_key_id, endpoint, method, date, requests_count)
  VALUES (p_api_key_id, p_endpoint, p_method, p_date, 1)
  ON CONFLICT (api_key_id, endpoint, method, date)
  DO UPDATE SET requests_count = api_usage.requests_count + 1;
  
  -- Update last_used_at for API key
  UPDATE api_keys 
  SET last_used_at = NOW() 
  WHERE id = p_api_key_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate compliance report
CREATE OR REPLACE FUNCTION generate_compliance_report(
  start_date DATE,
  end_date DATE
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'period_start', start_date,
    'period_end', end_date,
    'total_events', (
      SELECT COUNT(*) FROM audit_logs 
      WHERE DATE(timestamp) BETWEEN start_date AND end_date
    ),
    'high_risk_events', (
      SELECT COUNT(*) FROM audit_logs 
      WHERE DATE(timestamp) BETWEEN start_date AND end_date 
      AND risk_level IN ('high', 'critical')
    ),
    'failed_logins', (
      SELECT COUNT(*) FROM audit_logs 
      WHERE DATE(timestamp) BETWEEN start_date AND end_date 
      AND event_type = 'user_login' 
      AND (details->>'success')::boolean = false
    ),
    'kyc_approvals', (
      SELECT COUNT(*) FROM kyc_profiles 
      WHERE DATE(approved_at) BETWEEN start_date AND end_date
    ),
    'api_requests', (
      SELECT COALESCE(SUM(requests_count), 0) FROM api_usage 
      WHERE date BETWEEN start_date AND end_date
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;