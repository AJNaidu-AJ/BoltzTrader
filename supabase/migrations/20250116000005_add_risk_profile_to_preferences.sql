-- Add risk profiling fields to user_preferences table
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS risk_tolerance TEXT CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')) DEFAULT 'moderate';
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS holding_time TEXT CHECK (holding_time IN ('short', 'medium', 'long')) DEFAULT 'medium';
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS trade_frequency TEXT CHECK (trade_frequency IN ('low', 'medium', 'high')) DEFAULT 'medium';
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS max_position_size DECIMAL(10,2) DEFAULT 1000.00;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS preferred_sectors TEXT[] DEFAULT '{}';
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS risk_profile_completed BOOLEAN DEFAULT false;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS risk_profile_completed_at TIMESTAMP WITH TIME ZONE;

-- Add risk level to signals table
ALTER TABLE signals ADD COLUMN IF NOT EXISTS risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')) DEFAULT 'medium';

-- Create index for risk-based signal filtering
CREATE INDEX IF NOT EXISTS idx_signals_risk_level ON signals(risk_level);

-- Function to calculate signal risk level based on confidence and volatility
CREATE OR REPLACE FUNCTION calculate_signal_risk_level(confidence DECIMAL, price_change_percent DECIMAL)
RETURNS TEXT AS $$
BEGIN
  -- High risk: Low confidence OR high volatility
  IF confidence < 0.6 OR ABS(price_change_percent) > 5 THEN
    RETURN 'high';
  -- Low risk: High confidence AND low volatility  
  ELSIF confidence > 0.8 AND ABS(price_change_percent) < 2 THEN
    RETURN 'low';
  -- Medium risk: Everything else
  ELSE
    RETURN 'medium';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Update existing signals with risk levels
UPDATE signals 
SET risk_level = calculate_signal_risk_level(confidence, price_change_percent)
WHERE risk_level IS NULL;