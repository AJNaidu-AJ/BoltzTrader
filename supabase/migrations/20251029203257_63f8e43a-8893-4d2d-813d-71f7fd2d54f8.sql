-- Create enum for signal rank
CREATE TYPE public.signal_rank AS ENUM ('top', 'medium', 'low');

-- Create enum for notification channels
CREATE TYPE public.notification_channel AS ENUM ('system', 'telegram', 'discord', 'whatsapp', 'email', 'push');

-- Create enum for notification status
CREATE TYPE public.notification_status AS ENUM ('unread', 'read', 'archived');

-- Signals Table
CREATE TABLE public.signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  company_name TEXT NOT NULL,
  sector TEXT NOT NULL,
  rank signal_rank NOT NULL,
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  current_price DECIMAL(15,2) NOT NULL,
  price_change DECIMAL(10,2) NOT NULL,
  price_change_percent DECIMAL(5,2) NOT NULL,
  volume BIGINT NOT NULL,
  volume_change_percent DECIMAL(5,2),
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  sentiment_score DECIMAL(3,2) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  signal_reasons JSONB DEFAULT '[]'::jsonb,
  technical_indicators JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  timeframe TEXT DEFAULT '1h' CHECK (timeframe IN ('5m', '15m', '1h', '4h', '1d')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_signals_symbol ON public.signals(symbol);
CREATE INDEX idx_signals_rank ON public.signals(rank);
CREATE INDEX idx_signals_sector ON public.signals(sector);
CREATE INDEX idx_signals_confidence ON public.signals(confidence DESC);
CREATE INDEX idx_signals_created_at ON public.signals(created_at DESC);
CREATE INDEX idx_signals_active ON public.signals(is_active) WHERE is_active = true;

-- Sectors Table
CREATE TABLE public.sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  market_cap BIGINT,
  performance_1d DECIMAL(5,2),
  performance_1w DECIMAL(5,2),
  performance_1m DECIMAL(5,2),
  aggregate_score DECIMAL(3,2) CHECK (aggregate_score >= 0 AND aggregate_score <= 1),
  trend TEXT CHECK (trend IN ('bullish', 'neutral', 'bearish')),
  constituent_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sectors_name ON public.sectors(name);
CREATE INDEX idx_sectors_aggregate_score ON public.sectors(aggregate_score DESC);

-- Watchlists Table
CREATE TABLE public.watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  symbols TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

CREATE INDEX idx_watchlists_user_id ON public.watchlists(user_id);
CREATE INDEX idx_watchlists_default ON public.watchlists(user_id, is_default) WHERE is_default = true;

-- Notifications Table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL,
  channel notification_channel NOT NULL DEFAULT 'system',
  status notification_status NOT NULL DEFAULT 'unread',
  metadata JSONB DEFAULT '{}'::jsonb,
  signal_id UUID REFERENCES public.signals(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_status ON public.notifications(user_id, status);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Performance Tracking Table
CREATE TABLE public.signal_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID NOT NULL REFERENCES public.signals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  symbol TEXT NOT NULL,
  entry_price DECIMAL(15,2) NOT NULL,
  exit_price DECIMAL(15,2),
  entry_time TIMESTAMPTZ NOT NULL,
  exit_time TIMESTAMPTZ,
  predicted_direction TEXT CHECK (predicted_direction IN ('up', 'down', 'neutral')),
  actual_direction TEXT CHECK (actual_direction IN ('up', 'down', 'neutral')),
  confidence_at_entry DECIMAL(3,2) NOT NULL,
  return_percent DECIMAL(10,2),
  was_accurate BOOLEAN,
  timeframe TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_signal_performance_signal_id ON public.signal_performance(signal_id);
CREATE INDEX idx_signal_performance_user_id ON public.signal_performance(user_id);
CREATE INDEX idx_signal_performance_symbol ON public.signal_performance(symbol);
CREATE INDEX idx_signal_performance_entry_time ON public.signal_performance(entry_time DESC);
CREATE INDEX idx_signal_performance_accuracy ON public.signal_performance(was_accurate);

-- User Preferences Table
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  notification_channels JSONB DEFAULT '{"email": true, "push": true, "telegram": false, "discord": false, "whatsapp": false}'::jsonb,
  alert_settings JSONB DEFAULT '{"high_confidence": true, "top_signals": true, "watchlist_alerts": true}'::jsonb,
  display_settings JSONB DEFAULT '{"theme": "dark", "timezone": "UTC", "market_hours_only": false}'::jsonb,
  api_key TEXT,
  webhook_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Enable Row Level Security
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Signals (public read for all authenticated users)
CREATE POLICY "Anyone can view active signals"
  ON public.signals FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage signals"
  ON public.signals FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for Sectors (public read)
CREATE POLICY "Anyone can view sectors"
  ON public.sectors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage sectors"
  ON public.sectors FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for Watchlists (user-specific)
CREATE POLICY "Users can view own watchlists"
  ON public.watchlists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own watchlists"
  ON public.watchlists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watchlists"
  ON public.watchlists FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlists"
  ON public.watchlists FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for Notifications (user-specific)
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for Signal Performance
CREATE POLICY "Users can view all signal performance"
  ON public.signal_performance FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can track own performance"
  ON public.signal_performance FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can manage performance tracking"
  ON public.signal_performance FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for User Preferences (user-specific)
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_signals_updated_at
  BEFORE UPDATE ON public.signals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_sectors_updated_at
  BEFORE UPDATE ON public.sectors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_watchlists_updated_at
  BEFORE UPDATE ON public.watchlists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Function to create default user preferences on signup
CREATE OR REPLACE FUNCTION public.handle_user_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_preferences();