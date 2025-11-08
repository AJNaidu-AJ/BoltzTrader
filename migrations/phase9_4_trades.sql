-- Phase 9.4: Live Trade Execution Database Schema

-- Trade Orders Table
CREATE TABLE IF NOT EXISTS trade_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  side text NOT NULL CHECK (side IN ('BUY', 'SELL')),
  qty numeric NOT NULL CHECK (qty > 0),
  price numeric,
  broker text NOT NULL,
  user_id uuid REFERENCES users(id),
  ai_confidence numeric CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
  ai_reasoning text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'executed', 'cancelled', 'failed')),
  order_id text, -- Broker's order ID
  executed_price numeric,
  executed_qty numeric,
  fees numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  audit_hash text
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trade_orders_user ON trade_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_orders_symbol ON trade_orders(symbol);
CREATE INDEX IF NOT EXISTS idx_trade_orders_status ON trade_orders(status);
CREATE INDEX IF NOT EXISTS idx_trade_orders_created ON trade_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_trade_orders_broker ON trade_orders(broker);

-- Trade Execution Stats Table
CREATE TABLE IF NOT EXISTS trade_execution_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  date date DEFAULT CURRENT_DATE,
  total_trades integer DEFAULT 0,
  successful_trades integer DEFAULT 0,
  failed_trades integer DEFAULT 0,
  cancelled_trades integer DEFAULT 0,
  total_volume numeric DEFAULT 0,
  total_fees numeric DEFAULT 0,
  avg_confidence numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Risk Management Limits Table
CREATE TABLE IF NOT EXISTS risk_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  max_daily_trades integer DEFAULT 10,
  max_exposure_ratio numeric DEFAULT 0.2 CHECK (max_exposure_ratio > 0 AND max_exposure_ratio <= 1),
  min_confidence numeric DEFAULT 0.7 CHECK (min_confidence >= 0 AND min_confidence <= 1),
  max_position_size numeric DEFAULT 10000,
  allowed_symbols text[], -- Array of allowed trading symbols
  blocked_symbols text[], -- Array of blocked trading symbols
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- AI Signal History Table
CREATE TABLE IF NOT EXISTS ai_signal_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  signal_type text NOT NULL CHECK (signal_type IN ('BUY', 'SELL', 'HOLD')),
  confidence numeric NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  reasoning text,
  market_price numeric,
  executed boolean DEFAULT false,
  trade_order_id uuid REFERENCES trade_orders(id),
  user_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Indexes for AI signal history
CREATE INDEX IF NOT EXISTS idx_ai_signals_symbol ON ai_signal_history(symbol);
CREATE INDEX IF NOT EXISTS idx_ai_signals_user ON ai_signal_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_signals_created ON ai_signal_history(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_signals_executed ON ai_signal_history(executed);

-- Function to update trade execution stats
CREATE OR REPLACE FUNCTION update_trade_execution_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO trade_execution_stats (user_id, date, total_trades, successful_trades, failed_trades, cancelled_trades)
  VALUES (NEW.user_id, CURRENT_DATE, 1, 
    CASE WHEN NEW.status = 'executed' THEN 1 ELSE 0 END,
    CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END,
    CASE WHEN NEW.status = 'cancelled' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id, date) DO UPDATE SET
    total_trades = trade_execution_stats.total_trades + 1,
    successful_trades = trade_execution_stats.successful_trades + 
      CASE WHEN NEW.status = 'executed' THEN 1 ELSE 0 END,
    failed_trades = trade_execution_stats.failed_trades + 
      CASE WHEN NEW.status = 'failed' THEN 1 ELSE 0 END,
    cancelled_trades = trade_execution_stats.cancelled_trades + 
      CASE WHEN NEW.status = 'cancelled' THEN 1 ELSE 0 END,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update stats
CREATE TRIGGER trigger_update_trade_stats
  AFTER INSERT OR UPDATE ON trade_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_trade_execution_stats();

-- Insert default risk limits for existing users
INSERT INTO risk_limits (user_id, max_daily_trades, max_exposure_ratio, min_confidence)
SELECT id, 10, 0.2, 0.7 FROM users
ON CONFLICT (user_id) DO NOTHING;