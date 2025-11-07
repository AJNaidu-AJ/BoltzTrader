-- Phase 8: Marketplace Layer Database Schema

-- Strategy Marketplace Listings
CREATE TABLE IF NOT EXISTS strategy_marketplace (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID,
  creator_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  is_public BOOLEAN DEFAULT true,
  is_paid BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  avg_rating NUMERIC DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- active, pending, banned, removed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Strategy Purchases
CREATE TABLE IF NOT EXISTS strategy_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES strategy_marketplace(id),
  buyer_id UUID,
  amount NUMERIC,
  currency TEXT,
  payment_provider TEXT,
  payment_reference TEXT,
  status TEXT DEFAULT 'pending', -- pending, completed, refunded, failed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Strategy Access (Entitlements)
CREATE TABLE IF NOT EXISTS user_strategy_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  strategy_id UUID,
  listing_id UUID REFERENCES strategy_marketplace(id),
  access_type TEXT DEFAULT 'purchased', -- purchased, free, trial
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Creator Payouts
CREATE TABLE IF NOT EXISTS creator_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID,
  amount NUMERIC,
  currency TEXT,
  provider TEXT,
  provider_reference TEXT,
  status TEXT DEFAULT 'queued', -- queued, paid, failed
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- Strategy Reviews
CREATE TABLE IF NOT EXISTS strategy_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES strategy_marketplace(id),
  user_id UUID,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_strategy_tags ON strategy_marketplace USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_listing_creator ON strategy_marketplace (creator_id);
CREATE INDEX IF NOT EXISTS idx_purchases_buyer ON strategy_purchases (buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_listing ON strategy_purchases (listing_id);
CREATE INDEX IF NOT EXISTS idx_user_access ON user_strategy_access (user_id, strategy_id);
CREATE INDEX IF NOT EXISTS idx_reviews_listing ON strategy_reviews (listing_id);

-- Insert sample marketplace data
INSERT INTO strategy_marketplace (strategy_id, creator_id, title, description, price, currency, tags, avg_rating, total_reviews, total_sales) 
VALUES 
  (gen_random_uuid(), gen_random_uuid(), 'AI Momentum Strategy', 'Advanced momentum trading with GPT-4 analysis', 99.99, 'USD', ARRAY['momentum', 'ai', 'trending'], 4.5, 12, 45),
  (gen_random_uuid(), gen_random_uuid(), 'Mean Reversion Pro', 'Statistical arbitrage using machine learning', 149.99, 'USD', ARRAY['mean-reversion', 'ml', 'arbitrage'], 4.8, 8, 23),
  (gen_random_uuid(), gen_random_uuid(), 'Crypto Scalper', 'High-frequency crypto trading bot', 199.99, 'USD', ARRAY['crypto', 'scalping', 'hft'], 4.2, 15, 67);