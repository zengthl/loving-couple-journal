-- ============================================
-- Add city column to user_province_visits
-- Allows grouping album photos by city within a province
-- Run this SQL in Supabase SQL Editor
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_province_visits' AND column_name = 'city'
  ) THEN
    ALTER TABLE user_province_visits ADD COLUMN city VARCHAR(100);
  END IF;
END $$;

SELECT 'City column migration completed!' as message;
