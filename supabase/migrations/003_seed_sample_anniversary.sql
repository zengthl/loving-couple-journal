-- Migration 003: Seed sample anniversary
-- Depends on: 001
-- Created: 2026-03-18
-- Note: Idempotent - safe to re-run

INSERT INTO anniversaries (title, date, image, location) VALUES
  ('我们在一起', '2023-05-20', NULL, NULL)
ON CONFLICT DO NOTHING;
