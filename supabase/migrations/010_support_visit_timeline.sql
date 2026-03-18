-- Migration 010: Support multiple visits per city (timeline feature)
-- Depends on: 008 (unique constraint exists)
-- Created: 2026-03-18
-- Note: Idempotent - safe to re-run

-- Step 1: Drop unique constraint that prevents multiple visits per city
-- This allows users to have multiple entries for the same city at different dates
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_user_province_city'
  ) THEN
    DROP INDEX idx_user_province_city;
  END IF;
END $$;

-- Step 2: Add index for efficient city lookups (without uniqueness constraint)
CREATE INDEX IF NOT EXISTS idx_user_province_visits_city_lookup
  ON user_province_visits(user_id, province_id, city);

-- Step 3: Add index for date-based sorting (timeline view)
CREATE INDEX IF NOT EXISTS idx_user_province_visits_date
  ON user_province_visits(user_id, visit_date DESC);
