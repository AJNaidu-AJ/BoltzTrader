-- Create execution_metrics table for tracking order execution performance
CREATE TABLE IF NOT EXISTS execution_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES trades(id),
  symbol TEXT NOT NULL,
  broker TEXT NOT NULL,
  execution_latency_ms DECIMAL(10,2),
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'timeout')),
  error TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_execution_metrics_timestamp ON execution_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_execution_metrics_symbol ON execution_metrics(symbol);
CREATE INDEX IF NOT EXISTS idx_execution_metrics_broker ON execution_metrics(broker);
CREATE INDEX IF NOT EXISTS idx_execution_metrics_status ON execution_metrics(status);

-- Add execution tracking fields to trades table
ALTER TABLE trades ADD COLUMN IF NOT EXISTS execution_latency_ms DECIMAL(10,2);
ALTER TABLE trades ADD COLUMN IF NOT EXISTS queued_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE trades ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE trades ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;

-- Enable RLS for execution_metrics
ALTER TABLE execution_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policy for execution_metrics (admin and system access)
CREATE POLICY "System can manage execution metrics" ON execution_metrics
  FOR ALL USING (true);

-- Function to update trade execution status
CREATE OR REPLACE FUNCTION update_trade_execution_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update execution latency in trades table when metrics are inserted
  IF TG_OP = 'INSERT' AND NEW.order_id IS NOT NULL THEN
    UPDATE trades 
    SET execution_latency_ms = NEW.execution_latency_ms
    WHERE id = NEW.order_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to sync execution metrics with trades
CREATE TRIGGER sync_execution_metrics
  AFTER INSERT ON execution_metrics
  FOR EACH ROW EXECUTE FUNCTION update_trade_execution_status();