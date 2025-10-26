-- Clean Supabase Storage Policies - Run each statement separately
-- Copy and paste each CREATE POLICY statement one at a time

-- Step 1: Drop existing policies (run this first)
DROP POLICY IF EXISTS "Users can upload their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view all photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;

-- Step 2: Create upload policy (run this second)
CREATE POLICY "Users can upload their own photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Step 3: Create view policy (run this third)
CREATE POLICY "Users can view all photos" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-photos');

-- Step 4: Create update policy (run this fourth)
CREATE POLICY "Users can update their own photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Step 5: Create delete policy (run this fifth)
CREATE POLICY "Users can delete their own photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
