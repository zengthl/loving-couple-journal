-- ============================================
-- Supabase Database Schema for Couple Journal
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== Timeline Events ====================
CREATE TABLE IF NOT EXISTS timeline_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date VARCHAR(10) NOT NULL,
  day_of_week VARCHAR(10) NOT NULL,
  month VARCHAR(10) NOT NULL,
  year VARCHAR(10) NOT NULL,
  title VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  images TEXT[] DEFAULT '{}',
  note TEXT,
  is_special BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== Provinces (Map Data) ====================
CREATE TABLE IF NOT EXISTS provinces (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  en_name VARCHAR(50) NOT NULL,
  position DOUBLE PRECISION[] NOT NULL,
  visited BOOLEAN DEFAULT FALSE,
  visit_date VARCHAR(20),
  photos TEXT[] DEFAULT '{}'
);

-- ==================== Discovery Items ====================
CREATE TABLE IF NOT EXISTS discovery_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  image TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('food', 'goods', 'shop', 'fun')),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  checked BOOLEAN DEFAULT FALSE,
  top_badge BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== Anniversaries ====================
CREATE TABLE IF NOT EXISTS anniversaries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  image TEXT,
  location VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== Row Level Security (RLS) ====================
-- Disable RLS for now (enable when adding authentication)
ALTER TABLE timeline_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE provinces DISABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE anniversaries DISABLE ROW LEVEL SECURITY;

-- ==================== Indexes ====================
CREATE INDEX IF NOT EXISTS idx_timeline_created ON timeline_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discovery_created ON discovery_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_provinces_visited ON provinces(visited);
