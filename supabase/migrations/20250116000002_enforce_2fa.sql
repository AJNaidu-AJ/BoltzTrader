-- Create function to check 2FA status
CREATE OR REPLACE FUNCTION check_2fa_required()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user has 2FA enabled for premium features
  IF NEW.subscription_status IN ('power_user', 'professional') THEN
    -- This would be enforced at the application level
    -- Supabase handles 2FA through auth.mfa table
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add 2FA requirement tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mfa_required BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mfa_enabled_at TIMESTAMP WITH TIME ZONE;

-- Update profiles for premium users to require 2FA
UPDATE profiles SET mfa_required = true 
WHERE id IN (
  SELECT user_id FROM user_roles 
  WHERE role IN ('power_user', 'admin')
);

-- Create policy to enforce 2FA for sensitive operations
CREATE OR REPLACE FUNCTION enforce_mfa_for_sensitive_ops()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if operation requires 2FA
  IF TG_TABLE_NAME IN ('backtests', 'user_preferences') THEN
    -- Verify user has 2FA enabled if required
    IF EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND mfa_required = true 
      AND mfa_enabled_at IS NULL
    ) THEN
      RAISE EXCEPTION 'Two-factor authentication required for this operation';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for 2FA enforcement
CREATE TRIGGER enforce_mfa_backtests
  BEFORE INSERT OR UPDATE ON backtests
  FOR EACH ROW EXECUTE FUNCTION enforce_mfa_for_sensitive_ops();

CREATE TRIGGER enforce_mfa_preferences
  BEFORE INSERT OR UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION enforce_mfa_for_sensitive_ops();