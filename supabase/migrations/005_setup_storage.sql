-- Migration 005: Setup Supabase Storage
-- Depends on: none (independent)
-- Created: 2026-03-18
-- Note: Idempotent - safe to re-run

-- Create public bucket for user images
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-images', 'user-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
DROP POLICY IF EXISTS "Users can upload own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own images" ON storage.objects;
DROP POLICY IF EXISTS "Public images are viewable by all" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- Upload: authenticated users to own folder
CREATE POLICY "Users can upload own images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'user-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- View (authenticated): own images
CREATE POLICY "Users can view own images"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'user-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- View (public): all images (bucket is public)
CREATE POLICY "Public images are viewable by all"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'user-images');

-- Delete: own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'user-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
