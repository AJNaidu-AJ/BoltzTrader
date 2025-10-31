-- Enable RLS for backtests table
ALTER TABLE backtests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view backtests" ON backtests;
DROP POLICY IF EXISTS "Authenticated users can create backtests" ON backtests;

-- Add user-specific policies for backtests
CREATE POLICY "Users can view own backtests" ON backtests
  FOR SELECT USING (auth.uid()::text = created_by OR created_by IS NULL);

CREATE POLICY "Users can create own backtests" ON backtests
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own backtests" ON backtests
  FOR UPDATE USING (auth.uid()::text = created_by);

-- Add created_by column to backtests if not exists
ALTER TABLE backtests ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT auth.uid()::text;

-- Enable RLS for watchlists table (already has RLS)
-- Add user-specific policies for watchlists
CREATE POLICY "Users can view own watchlists" ON watchlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own watchlists" ON watchlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watchlists" ON watchlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlists" ON watchlists
  FOR DELETE USING (auth.uid() = user_id);

-- Update signals table policies to be more restrictive
DROP POLICY IF EXISTS "Anyone can view active signals" ON signals;
DROP POLICY IF EXISTS "Premium users can create signals" ON signals;
DROP POLICY IF EXISTS "Users can update own signals" ON signals;

-- New restrictive policies for signals
CREATE POLICY "Users can view active signals" ON signals
  FOR SELECT USING (is_active = true);

CREATE POLICY "System can create signals" ON signals
  FOR INSERT WITH CHECK (true); -- Allow system/API to create signals

CREATE POLICY "Users can update own signals" ON signals
  FOR UPDATE USING (created_by = auth.uid());

-- Enable RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Enable RLS for user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid()::text = user_id);