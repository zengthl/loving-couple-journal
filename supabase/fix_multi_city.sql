-- ============================================
-- Fix: Allow multiple cities per province
-- The old PK (user_id, province_id) only allows one row per province.
-- We need to support multiple cities per province per user.
-- Run this SQL in Supabase SQL Editor
-- ============================================

-- Step 1: Drop the old primary key constraint
ALTER TABLE user_province_visits DROP CONSTRAINT user_province_visits_pkey;

-- Step 2: Add an auto-generated UUID id column as primary key
ALTER TABLE user_province_visits ADD COLUMN id UUID DEFAULT uuid_generate_v4() PRIMARY KEY;

-- Step 3: Add a unique constraint to prevent duplicate (user_id, province_id, city) combos
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_province_city
  ON user_province_visits (user_id, province_id, COALESCE(city, ''));

SELECT 'Multi-city province fix completed!' as message;
