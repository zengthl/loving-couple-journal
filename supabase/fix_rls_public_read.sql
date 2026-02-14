-- ============================================
-- Fix RLS: Allow public read access for all users
-- Guests and new registered users can view all content
-- Only data owners can write/update/delete
-- Run this SQL in Supabase SQL Editor
-- ============================================

-- Step 1: Drop existing SELECT policies
DROP POLICY IF EXISTS "Users can view own timeline events" ON timeline_events;
DROP POLICY IF EXISTS "Users can view own discovery items" ON discovery_items;
DROP POLICY IF EXISTS "Users can view own anniversaries" ON anniversaries;
DROP POLICY IF EXISTS "Users can view own province visits" ON user_province_visits;

-- Step 2: Create new public SELECT policies (allow ALL reads)
CREATE POLICY "Anyone can view timeline events"
  ON timeline_events FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view discovery items"
  ON discovery_items FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view anniversaries"
  ON anniversaries FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view province visits"
  ON user_province_visits FOR SELECT
  USING (true);

-- Note: INSERT/UPDATE/DELETE policies remain unchanged
-- (only data owners with auth.uid() = user_id can modify)

SELECT 'RLS public read migration completed!' as message;
