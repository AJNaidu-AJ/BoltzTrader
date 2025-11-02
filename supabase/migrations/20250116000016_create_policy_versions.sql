-- Create policy versions table for version control
CREATE TABLE IF NOT EXISTS policy_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID REFERENCES risk_policies(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  definition JSONB NOT NULL,
  changed_by UUID,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  comment TEXT,
  UNIQUE(policy_id, version)
);

-- Create indexes
CREATE INDEX idx_policy_versions_policy_id ON policy_versions(policy_id);
CREATE INDEX idx_policy_versions_version ON policy_versions(policy_id, version DESC);

-- Add updated_by column to risk_policies
ALTER TABLE risk_policies ADD COLUMN IF NOT EXISTS updated_by UUID;

-- Function to auto-version policy changes
CREATE OR REPLACE FUNCTION log_policy_version()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO policy_versions (policy_id, version, definition, changed_by, changed_at)
  VALUES (
    NEW.id,
    COALESCE((SELECT MAX(version) + 1 FROM policy_versions WHERE policy_id = NEW.id), 1),
    NEW.thresholds,
    NEW.updated_by,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-versioning on policy updates
DROP TRIGGER IF EXISTS policy_version_after_update ON risk_policies;
CREATE TRIGGER policy_version_after_update
  AFTER UPDATE ON risk_policies
  FOR EACH ROW
  WHEN (OLD.thresholds IS DISTINCT FROM NEW.thresholds)
  EXECUTE FUNCTION log_policy_version();

-- Enable RLS
ALTER TABLE policy_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "System can manage policy versions" ON policy_versions
  FOR ALL USING (true);

-- Insert initial versions for existing policies
INSERT INTO policy_versions (policy_id, version, definition, changed_at)
SELECT id, 1, thresholds, created_at
FROM risk_policies
WHERE id NOT IN (SELECT DISTINCT policy_id FROM policy_versions WHERE policy_id IS NOT NULL);