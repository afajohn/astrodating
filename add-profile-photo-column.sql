-- Add profile_photo column to profiles table
-- Run this in your Supabase SQL Editor

-- Add the profile_photo column
ALTER TABLE profiles 
ADD COLUMN profile_photo TEXT;

-- Add a comment to describe the column
COMMENT ON COLUMN profiles.profile_photo IS 'URL of the user''s main profile photo';

-- Optional: Add an index for better performance when querying by profile_photo
CREATE INDEX IF NOT EXISTS idx_profiles_profile_photo ON profiles(profile_photo) WHERE profile_photo IS NOT NULL;
