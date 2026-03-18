-- Migration 007: Add city column to user_province_visits
-- Depends on: 004
-- Created: 2026-03-18
-- Note: Idempotent - safe to re-run

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_province_visits' AND column_name = 'city'
  ) THEN
    ALTER TABLE user_province_visits ADD COLUMN city VARCHAR(100);
  END IF;
END $$;
