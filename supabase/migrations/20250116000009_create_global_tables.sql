-- Create global_market_data table for multi-region data
CREATE TABLE IF NOT EXISTS global_market_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  region TEXT NOT NULL,
  exchange TEXT NOT NULL,
  price DECIMAL(15,4) NOT NULL,
  change_amount DECIMAL(15,4) DEFAULT 0,
  change_percent DECIMAL(8,4) DEFAULT 0,
  volume BIGINT DEFAULT 0,
  currency TEXT NOT NULL,
  market_cap BIGINT,
  last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create broker_connections table
CREATE TABLE IF NOT EXISTS broker_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  broker_id TEXT NOT NULL,
  broker_name TEXT NOT NULL,
  account_id TEXT NOT NULL,
  region TEXT NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0,
  currency TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  credentials_encrypted TEXT,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, broker_id, account_id)
);

-- Create user_preferences table for localization
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  locale TEXT DEFAULT 'en-US',
  timezone TEXT DEFAULT 'UTC',
  currency TEXT DEFAULT 'USD',
  date_format TEXT DEFAULT 'MM/dd/yyyy',
  number_format TEXT DEFAULT 'en-US',
  theme TEXT DEFAULT 'light',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create currency_rates table
CREATE TABLE IF NOT EXISTS currency_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency TEXT NOT NULL,
  target_currency TEXT NOT NULL,
  rate DECIMAL(15,8) NOT NULL,
  last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(base_currency, target_currency)
);

-- Enable RLS
ALTER TABLE global_market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE currency_rates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for global_market_data (public read)
CREATE POLICY "Anyone can view market data" ON global_market_data
  FOR SELECT USING (true);

-- RLS Policies for broker_connections
CREATE POLICY "Users can view own broker connections" ON broker_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own broker connections" ON broker_connections
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for currency_rates (public read)
CREATE POLICY "Anyone can view currency rates" ON currency_rates
  FOR SELECT USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_global_market_data_symbol ON global_market_data(symbol);
CREATE INDEX IF NOT EXISTS idx_global_market_data_region ON global_market_data(region);
CREATE INDEX IF NOT EXISTS idx_global_market_data_exchange ON global_market_data(exchange);
CREATE INDEX IF NOT EXISTS idx_global_market_data_last_update ON global_market_data(last_update DESC);

CREATE INDEX IF NOT EXISTS idx_broker_connections_user_id ON broker_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_broker_connections_broker_id ON broker_connections(broker_id);
CREATE INDEX IF NOT EXISTS idx_broker_connections_active ON broker_connections(is_active);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_currency_rates_base ON currency_rates(base_currency);
CREATE INDEX IF NOT EXISTS idx_currency_rates_target ON currency_rates(target_currency);

-- Update triggers
CREATE TRIGGER update_broker_connections_updated_at 
  BEFORE UPDATE ON broker_connections 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample currency rates
INSERT INTO currency_rates (base_currency, target_currency, rate) VALUES
('USD', 'EUR', 0.85),
('USD', 'GBP', 0.73),
('USD', 'JPY', 110.0),
('USD', 'CAD', 1.25),
('USD', 'AUD', 1.35),
('EUR', 'USD', 1.18),
('GBP', 'USD', 1.37),
('JPY', 'USD', 0.0091),
('CAD', 'USD', 0.80),
('AUD', 'USD', 0.74)
ON CONFLICT (base_currency, target_currency) DO NOTHING;