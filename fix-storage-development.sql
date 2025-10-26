-- DEFINITIVE SOLUTION: Disable RLS for Development
-- Run this in your Supabase SQL Editor

-- Step 1: Disable RLS on storage.objects table
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Step 2: Verify the bucket exists and is public
-- Check if bucket is public in Supabase Dashboard → Storage → profile-photos bucket settings

-- Step 3: Test upload (this should work now)
-- The PhotoUploadService should now work without RLS blocking it

-- IMPORTANT: Re-enable RLS in production with proper policies:
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
-- Then add proper policies for production
