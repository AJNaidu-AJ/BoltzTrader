-- Create marketplace_strategies table
CREATE TABLE IF NOT EXISTS marketplace_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID NOT NULL REFERENCES strategies(id),
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) DEFAULT 0.00,
  rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  performance_metrics JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  rejection_reason TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create strategy_purchases table
CREATE TABLE IF NOT EXISTS strategy_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID NOT NULL REFERENCES marketplace_strategies(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount DECIMAL(10,2) NOT NULL,
  stripe_payment_id TEXT,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(strategy_id, user_id)
);

-- Create strategy_reviews table
CREATE TABLE IF NOT EXISTS strategy_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID NOT NULL REFERENCES marketplace_strategies(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(strategy_id, user_id)
);

-- Create creator_payouts table
CREATE TABLE IF NOT EXISTS creator_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_sales DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  creator_share DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  stripe_transfer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE marketplace_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for marketplace_strategies
CREATE POLICY "Anyone can view approved strategies" ON marketplace_strategies
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Creators can view own strategies" ON marketplace_strategies
  FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "Creators can manage own strategies" ON marketplace_strategies
  FOR ALL USING (auth.uid() = creator_id);

-- RLS Policies for strategy_purchases
CREATE POLICY "Users can view own purchases" ON strategy_purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create purchases" ON strategy_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for strategy_reviews
CREATE POLICY "Anyone can view reviews" ON strategy_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own reviews" ON strategy_reviews
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for creator_payouts
CREATE POLICY "Creators can view own payouts" ON creator_payouts
  FOR SELECT USING (auth.uid() = creator_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_strategies_status ON marketplace_strategies(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_strategies_creator ON marketplace_strategies(creator_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_strategies_rating ON marketplace_strategies(rating DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_strategies_downloads ON marketplace_strategies(download_count DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_strategies_price ON marketplace_strategies(price);

CREATE INDEX IF NOT EXISTS idx_strategy_purchases_user ON strategy_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_strategy_purchases_strategy ON strategy_purchases(strategy_id);
CREATE INDEX IF NOT EXISTS idx_strategy_purchases_status ON strategy_purchases(status);

CREATE INDEX IF NOT EXISTS idx_strategy_reviews_strategy ON strategy_reviews(strategy_id);
CREATE INDEX IF NOT EXISTS idx_strategy_reviews_rating ON strategy_reviews(rating);

CREATE INDEX IF NOT EXISTS idx_creator_payouts_creator ON creator_payouts(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_payouts_status ON creator_payouts(status);

-- Update triggers
CREATE TRIGGER update_marketplace_strategies_updated_at 
  BEFORE UPDATE ON marketplace_strategies 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_strategy_reviews_updated_at 
  BEFORE UPDATE ON strategy_reviews 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Functions for rating and download count updates
CREATE OR REPLACE FUNCTION increment_download_count(strategy_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE marketplace_strategies 
  SET download_count = download_count + 1 
  WHERE id = strategy_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_strategy_rating(strategy_id UUID)
RETURNS void AS $$
DECLARE
  avg_rating DECIMAL(3,2);
  total_reviews INTEGER;
BEGIN
  SELECT AVG(rating), COUNT(*) 
  INTO avg_rating, total_reviews
  FROM strategy_reviews 
  WHERE strategy_reviews.strategy_id = update_strategy_rating.strategy_id;
  
  UPDATE marketplace_strategies 
  SET rating = COALESCE(avg_rating, 0.00),
      review_count = total_reviews
  WHERE id = update_strategy_rating.strategy_id;
END;
$$ LANGUAGE plpgsql;