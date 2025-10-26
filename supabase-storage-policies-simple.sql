-- Alternative: Simple Supabase Storage Policies
-- If the above policies cause errors, try this simpler approach

-- Option 1: Disable RLS temporarily for testing (NOT for production)
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Option 2: Create very simple policies
-- Drop any existing policies first
DROP POLICY IF EXISTS "Allow all operations on profile-photos" ON storage.objects;

-- Create a single policy that allows all operations on the profile-photos bucket
CREATE POLICY "Allow all operations on profile-photos" ON storage.objects
USING (bucket_id = 'profile-photos');

-- Option 3: If you want to be more restrictive, use these policies instead:
-- DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
-- 
-- CREATE POLICY "Allow authenticated uploads" ON storage.objects
-- FOR INSERT WITH CHECK (
--   bucket_id = 'profile-photos' 
--   AND auth.role() = 'authenticated'
-- );
-- 
-- CREATE POLICY "Allow public reads" ON storage.objects
-- FOR SELECT USING (bucket_id = 'profile-photos');
