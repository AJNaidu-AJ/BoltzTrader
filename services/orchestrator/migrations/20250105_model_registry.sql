-- Phase 9.10: Global AI Orchestrator & Model Governance Center
-- Database schema for model registry and audit logging

CREATE TABLE IF NOT EXISTS ai_model_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name TEXT NOT NULL,
  version TEXT NOT NULL,
  parent_version TEXT,
  training_round INT,
  performance_metrics JSONB,
  status TEXT DEFAULT 'staging', -- staging, production, archived, rejected
  checksum TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS model_audit_log (
  id BIGSERIAL PRIMARY KEY,
  model_id UUID REFERENCES ai_model_registry(id),
  event_type TEXT,
  details JSONB,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_model_status ON ai_model_registry(status);
CREATE INDEX IF NOT EXISTS idx_model_audit_model_id ON model_audit_log(model_id);
CREATE INDEX IF NOT EXISTS idx_model_name_version ON ai_model_registry(model_name, version);