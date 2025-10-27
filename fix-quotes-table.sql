-- Fix astrology_quotes table structure for proper upsert
-- This adds unique constraints and fixes the table

-- First, add unique constraint on combination of columns
ALTER TABLE astrology_quotes 
ADD CONSTRAINT IF NOT EXISTS unique_user_system_date 
UNIQUE (user_id, astrology_system, date);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_astrology_quotes_user_system_date 
ON astrology_quotes(user_id, astrology_system, date);

-- Verify the constraint
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'astrology_quotes' 
AND constraint_type = 'UNIQUE';
