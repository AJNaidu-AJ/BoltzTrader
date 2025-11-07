-- Broker integrations database schema
CREATE TABLE IF NOT EXISTS broker_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  broker_name text NOT NULL,
  api_key text NOT NULL,
  api_secret text NOT NULL,
  access_token text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS broker_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  broker text NOT NULL,
  symbol text NOT NULL,
  side text CHECK (side IN ('buy','sell')),
  quantity numeric NOT NULL,
  price numeric,
  status text DEFAULT 'pending',
  order_reference text,
  ai_signal_id uuid,
  confidence numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_broker_accounts_user ON broker_accounts (user_id);
CREATE INDEX IF NOT EXISTS idx_broker_orders_user ON broker_orders (user_id);
CREATE INDEX IF NOT EXISTS idx_broker_orders_status ON broker_orders (status);