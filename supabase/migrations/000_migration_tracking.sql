-- Migration Tracking Table
-- Run this ONCE in Supabase SQL Editor before applying any migrations
-- Then update this table after each migration is applied

CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(10) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  applied_by VARCHAR(255),
  notes TEXT
);

-- Pre-populate with already-applied migrations (update as needed)
-- INSERT INTO schema_migrations (version, name, notes) VALUES
--   ('001', 'create_base_tables', 'Initial schema'),
--   ('002', 'seed_provinces', 'All 34 regions'),
--   ('003', 'seed_sample_anniversary', 'Sample anniversary'),
--   ('004', 'add_auth_and_rls', 'Auth + RLS'),
--   ('005', 'setup_storage', 'Supabase Storage'),
--   ('006', 'rls_public_read', 'Public read access'),
--   ('007', 'add_city_column', 'City column'),
--   ('008', 'support_multi_city', 'UUID PK + unique index');
