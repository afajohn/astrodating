-- Ultra Simple Storage Policy - This should work without errors
-- Run this single statement in Supabase SQL Editor:

CREATE POLICY "Allow profile photos access" ON storage.objects
USING (bucket_id = 'profile-photos');
