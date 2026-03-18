-- Migration 008: Support multiple cities per province per user
-- Depends on: 007 (city column must exist)
-- Created: 2026-03-18
-- Note: Idempotent - safe to re-run

-- Step 1: Drop old composite PK (if it exists and hasn't been dropped yet)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_province_visits_pkey'
  ) THEN
    ALTER TABLE user_province_visits DROP CONSTRAINT user_province_visits_pkey;
  END IF;
END $$;

-- Step 2: Add UUID id column as new PK (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_province_visits' AND column_name = 'id'
  ) THEN
    ALTER TABLE user_province_visits ADD COLUMN id UUID DEFAULT uuid_generate_v4() PRIMARY KEY;
  END IF;
END $$;

-- Step 3: Add unique constraint to prevent duplicate (user_id, province_id, city)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_province_city
  ON user_province_visits (user_id, province_id, COALESCE(city, ''));
