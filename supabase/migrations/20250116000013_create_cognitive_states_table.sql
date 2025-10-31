-- Create cognitive_states table for persistent shared state
CREATE TABLE IF NOT EXISTS cognitive_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  state_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(symbol)
);

-- Create index for fast symbol lookups
CREATE INDEX idx_cognitive_states_symbol ON cognitive_states(symbol);
CREATE INDEX idx_cognitive_states_updated_at ON cognitive_states(updated_at DESC);

-- Enable RLS
ALTER TABLE cognitive_states ENABLE ROW LEVEL SECURITY;

-- RLS Policy for cognitive states
CREATE POLICY "System can manage cognitive states" ON cognitive_states
  FOR ALL USING (true);

-- Update trigger
CREATE TRIGGER update_cognitive_states_updated_at 
  BEFORE UPDATE ON cognitive_states 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();