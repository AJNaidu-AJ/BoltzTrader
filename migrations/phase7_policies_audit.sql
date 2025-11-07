-- Phase 7: Governance, Compliance & Explainable AI Database Schema

-- Compliance Policies Table
CREATE TABLE IF NOT EXISTS compliance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL UNIQUE,
  kyc_required BOOLEAN DEFAULT true,
  aml_checks BOOLEAN DEFAULT true,
  max_trade_volume NUMERIC DEFAULT 100000,
  require_2fa BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit Ledger (Immutable) Table
CREATE TABLE IF NOT EXISTS audit_ledger (
  id BIGSERIAL PRIMARY KEY,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  performed_by TEXT,
  payload JSONB,
  hash TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Explainable AI Storage Table
CREATE TABLE IF NOT EXISTS xai_reasoning (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id TEXT NOT NULL,
  decision JSONB NOT NULL,
  gpt_reasoning TEXT NOT NULL,
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default compliance policies
INSERT INTO compliance_policies (region, kyc_required, aml_checks, max_trade_volume, require_2fa) 
VALUES 
  ('US', true, true, 100000, true),
  ('EU', true, true, 50000, true),
  ('IN', true, true, 75000, true),
  ('DEFAULT', true, true, 25000, true)
ON CONFLICT (region) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_ledger_entity ON audit_ledger(entity);
CREATE INDEX IF NOT EXISTS idx_audit_ledger_created_at ON audit_ledger(created_at);
CREATE INDEX IF NOT EXISTS idx_xai_reasoning_strategy_id ON xai_reasoning(strategy_id);
CREATE INDEX IF NOT EXISTS idx_xai_reasoning_created_at ON xai_reasoning(created_at);