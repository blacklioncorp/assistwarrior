-- Migration: Add missing is_all_day and avatar_url, plus create storage bucket
-- This fixes the runtime errors for blocked_slots and profile photo upload

-- 1. Add is_all_day to blocked_slots if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blocked_slots' AND column_name = 'is_all_day'
  ) THEN
    ALTER TABLE public.blocked_slots ADD COLUMN is_all_day BOOLEAN DEFAULT false;
  END IF;
END $$;

-- 2. Add avatar_url to professionals if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'professionals' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE public.professionals ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- 3. Create 'avatars' storage bucket and set policies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for 'avatars' bucket
-- Allow public read access to all avatars
CREATE POLICY "Avatar images are publicly accessible." 
  ON storage.objects FOR SELECT 
  USING ( bucket_id = 'avatars' );

-- Allow professionals to upload their own avatar (folder must match their auth.uid)
CREATE POLICY "Professionals can upload their own avatar." 
  ON storage.objects FOR INSERT 
  WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow professionals to update their own avatar
CREATE POLICY "Professionals can update their own avatar." 
  ON storage.objects FOR UPDATE 
  USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow professionals to delete their own avatar
CREATE POLICY "Professionals can delete their own avatar." 
  ON storage.objects FOR DELETE 
  USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
