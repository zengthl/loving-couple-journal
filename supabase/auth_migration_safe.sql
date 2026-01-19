-- ============================================
-- Authentication Migration (Safe Version)
-- Handles existing columns gracefully
-- ============================================

-- Step 1: Add user_id columns if they don't exist
DO $$ 
BEGIN
  -- Add user_id to timeline_events if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'timeline_events' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE timeline_events ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  -- Add user_id to discovery_items if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discovery_items' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE discovery_items ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  -- Add user_id to anniversaries if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'anniversaries' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE anniversaries ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 2: Create user_province_visits table if not exists
CREATE TABLE IF NOT EXISTS user_province_visits (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  province_id VARCHAR(50) REFERENCES provinces(id),
  visit_date VARCHAR(20),
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, province_id)
);

-- Step 3: Enable Row Level Security (RLS)
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE anniversaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_province_visits ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies if they exist (to avoid errors on re-run)
DROP POLICY IF EXISTS "Users can view own timeline events" ON timeline_events;
DROP POLICY IF EXISTS "Users can insert own timeline events" ON timeline_events;
DROP POLICY IF EXISTS "Users can update own timeline events" ON timeline_events;
DROP POLICY IF EXISTS "Users can delete own timeline events" ON timeline_events;

DROP POLICY IF EXISTS "Users can view own discovery items" ON discovery_items;
DROP POLICY IF EXISTS "Users can insert own discovery items" ON discovery_items;
DROP POLICY IF EXISTS "Users can update own discovery items" ON discovery_items;
DROP POLICY IF EXISTS "Users can delete own discovery items" ON discovery_items;

DROP POLICY IF EXISTS "Users can view own anniversaries" ON anniversaries;
DROP POLICY IF EXISTS "Users can insert own anniversaries" ON anniversaries;
DROP POLICY IF EXISTS "Users can update own anniversaries" ON anniversaries;
DROP POLICY IF EXISTS "Users can delete own anniversaries" ON anniversaries;

DROP POLICY IF EXISTS "Users can view own province visits" ON user_province_visits;
DROP POLICY IF EXISTS "Users can insert own province visits" ON user_province_visits;
DROP POLICY IF EXISTS "Users can update own province visits" ON user_province_visits;
DROP POLICY IF EXISTS "Users can delete own province visits" ON user_province_visits;

-- Step 5: Create RLS Policies

-- Timeline Events
CREATE POLICY "Users can view own timeline events"
  ON timeline_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own timeline events"
  ON timeline_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own timeline events"
  ON timeline_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own timeline events"
  ON timeline_events FOR DELETE
  USING (auth.uid() = user_id);

-- Discovery Items
CREATE POLICY "Users can view own discovery items"
  ON discovery_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own discovery items"
  ON discovery_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own discovery items"
  ON discovery_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own discovery items"
  ON discovery_items FOR DELETE
  USING (auth.uid() = user_id);

-- Anniversaries
CREATE POLICY "Users can view own anniversaries"
  ON anniversaries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own anniversaries"
  ON anniversaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own anniversaries"
  ON anniversaries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own anniversaries"
  ON anniversaries FOR DELETE
  USING (auth.uid() = user_id);

-- User Province Visits
CREATE POLICY "Users can view own province visits"
  ON user_province_visits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own province visits"
  ON user_province_visits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own province visits"
  ON user_province_visits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own province visits"
  ON user_province_visits FOR DELETE
  USING (auth.uid() = user_id);

-- Step 6: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_timeline_user ON timeline_events(user_id);
CREATE INDEX IF NOT EXISTS idx_discovery_user ON discovery_items(user_id);
CREATE INDEX IF NOT EXISTS idx_anniversaries_user ON anniversaries(user_id);
CREATE INDEX IF NOT EXISTS idx_visits_user ON user_province_visits(user_id);

-- ============================================
-- Clean up existing data (OPTIONAL)
-- ============================================
-- Uncomment ONE of the following options:

-- Option A: Delete all existing data (recommended for clean start)
-- DELETE FROM timeline_events WHERE user_id IS NULL;
-- DELETE FROM discovery_items WHERE user_id IS NULL;
-- DELETE FROM anniversaries WHERE user_id IS NULL;

-- Option B: Assign existing data to a specific user
-- Replace 'your-user-uuid' with actual user ID after registering
-- UPDATE timeline_events SET user_id = 'your-user-uuid' WHERE user_id IS NULL;
-- UPDATE discovery_items SET user_id = 'your-user-uuid' WHERE user_id IS NULL;
-- UPDATE anniversaries SET user_id = 'your-user-uuid' WHERE user_id IS NULL;

-- Success message
SELECT 'Migration completed successfully!' as message;
