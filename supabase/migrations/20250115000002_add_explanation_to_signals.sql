-- Add explanation fields to signals table
ALTER TABLE signals ADD COLUMN IF NOT EXISTS explanation TEXT;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS explanation_generated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE signals ADD COLUMN IF NOT EXISTS rule_matches JSONB DEFAULT '[]';

-- Create index for explanation queries
CREATE INDEX IF NOT EXISTS idx_signals_explanation ON signals(explanation_generated_at) WHERE explanation IS NOT NULL;