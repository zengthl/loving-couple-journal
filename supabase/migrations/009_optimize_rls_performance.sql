-- Migration 009: Optimize RLS performance
-- Fix: auth functions called for each row -> use (select auth.function())
-- Add: Missing index on user_province_visits.province_id
-- Created: 2026-03-18

-- ============================================
-- 1. Fix RLS policies - use (select auth.uid()) for single evaluation
-- ============================================

-- Timeline Events
DROP POLICY IF EXISTS "Users can insert own timeline events" ON timeline_events;
CREATE POLICY "Users can insert own timeline events"
  ON timeline_events FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own timeline events" ON timeline_events;
CREATE POLICY "Users can update own timeline events"
  ON timeline_events FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own timeline events" ON timeline_events;
CREATE POLICY "Users can delete own timeline events"
  ON timeline_events FOR DELETE
  USING ((select auth.uid()) = user_id);

-- Discovery Items
DROP POLICY IF EXISTS "Users can insert own discovery items" ON discovery_items;
CREATE POLICY "Users can insert own discovery items"
  ON discovery_items FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own discovery items" ON discovery_items;
CREATE POLICY "Users can update own discovery items"
  ON discovery_items FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own discovery items" ON discovery_items;
CREATE POLICY "Users can delete own discovery items"
  ON discovery_items FOR DELETE
  USING ((select auth.uid()) = user_id);

-- Anniversaries
DROP POLICY IF EXISTS "Users can insert own anniversaries" ON anniversaries;
CREATE POLICY "Users can insert own anniversaries"
  ON anniversaries FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own anniversaries" ON anniversaries;
CREATE POLICY "Users can update own anniversaries"
  ON anniversaries FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own anniversaries" ON anniversaries;
CREATE POLICY "Users can delete own anniversaries"
  ON anniversaries FOR DELETE
  USING ((select auth.uid()) = user_id);

-- User Province Visits
DROP POLICY IF EXISTS "Users can insert own province visits" ON user_province_visits;
CREATE POLICY "Users can insert own province visits"
  ON user_province_visits FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own province visits" ON user_province_visits;
CREATE POLICY "Users can update own province visits"
  ON user_province_visits FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own province visits" ON user_province_visits;
CREATE POLICY "Users can delete own province visits"
  ON user_province_visits FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- 2. Add missing index on user_province_visits.province_id
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_province_visits_province_id
  ON user_province_visits(province_id);
