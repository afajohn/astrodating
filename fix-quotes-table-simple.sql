-- Simple fix for astrology_quotes table
-- Run this in Supabase SQL Editor

-- Drop the constraint if it exists (ignore error if it doesn't)
ALTER TABLE astrology_quotes DROP CONSTRAINT IF EXISTS unique_user_system_date;

-- Add the constraint
ALTER TABLE astrology_quotes 
ADD CONSTRAINT unique_user_system_date 
UNIQUE (user_id, astrology_system, date);

-- Verify it worked
SELECT * FROM pg_constraint 
WHERE conname = 'unique_user_system_date';
