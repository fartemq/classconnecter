
-- SQL script to ensure avatars bucket exists with proper permissions
-- This file is for reference only and should be executed manually if needed

-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'avatars', 'avatars', true
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'avatars'
);

-- Create policy to allow authenticated users to upload their own avatars
CREATE POLICY IF NOT EXISTS "Users can upload their own avatars" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow public read access to avatars
CREATE POLICY IF NOT EXISTS "Public can view all avatars" ON storage.objects
FOR SELECT USING (
  bucket_id = 'avatars'
);
