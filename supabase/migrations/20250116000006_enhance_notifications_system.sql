-- Enhance notifications table for alerts system
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS delivery_method TEXT[] DEFAULT '{"system"}';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;

-- Create news_items table
CREATE TABLE IF NOT EXISTS news_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT UNIQUE,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  url TEXT,
  source TEXT NOT NULL,
  author TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')) DEFAULT 'neutral',
  sentiment_score DECIMAL(3,2) DEFAULT 0.00,
  symbols TEXT[] DEFAULT '{}',
  categories TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for news_items
CREATE INDEX IF NOT EXISTS idx_news_items_published_at ON news_items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_items_symbols ON news_items USING GIN(symbols);
CREATE INDEX IF NOT EXISTS idx_news_items_sentiment ON news_items(sentiment);
CREATE INDEX IF NOT EXISTS idx_news_items_source ON news_items(source);
CREATE INDEX IF NOT EXISTS idx_news_items_active ON news_items(is_active);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  notification_type TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  delivery_methods TEXT[] DEFAULT '{"system"}',
  conditions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, notification_type)
);

-- Enable RLS for new tables
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for news_items (public read)
CREATE POLICY "Anyone can view active news" ON news_items
  FOR SELECT USING (is_active = true);

-- RLS Policies for notification_preferences
CREATE POLICY "Users can view own notification preferences" ON notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own notification preferences" ON notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for notification enhancements
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_delivery_method ON notifications USING GIN(delivery_method);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_at ON notifications(scheduled_at);

-- Update trigger for news_items
CREATE TRIGGER update_news_items_updated_at 
  BEFORE UPDATE ON news_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update trigger for notification_preferences
CREATE TRIGGER update_notification_preferences_updated_at 
  BEFORE UPDATE ON notification_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();