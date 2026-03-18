-- Migration 006: Change RLS to allow public read access
-- Depends on: 004
-- Created: 2026-03-18
-- Note: Idempotent - safe to re-run

-- Drop owner-only SELECT policies (from migration 004)
DROP POLICY IF EXISTS "Users can view own timeline events" ON timeline_events;
DROP POLICY IF EXISTS "Users can view own discovery items" ON discovery_items;
DROP POLICY IF EXISTS "Users can view own anniversaries" ON anniversaries;
DROP POLICY IF EXISTS "Users can view own province visits" ON user_province_visits;

-- Create public SELECT policies
CREATE POLICY "Anyone can view timeline events"
  ON timeline_events FOR SELECT USING (true);

CREATE POLICY "Anyone can view discovery items"
  ON discovery_items FOR SELECT USING (true);

CREATE POLICY "Anyone can view anniversaries"
  ON anniversaries FOR SELECT USING (true);

CREATE POLICY "Anyone can view province visits"
  ON user_province_visits FOR SELECT USING (true);

-- Note: INSERT/UPDATE/DELETE policies remain owner-only (unchanged)
