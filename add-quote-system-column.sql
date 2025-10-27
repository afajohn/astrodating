-- Add astrology_system and date columns to astrology_quotes table
-- This allows storing quotes for Western, Chinese, and Vedic astrology systems

-- Add astrology_system column if it doesn't exist
ALTER TABLE astrology_quotes 
ADD COLUMN IF NOT EXISTS astrology_system VARCHAR(20) 
CHECK (astrology_system IN ('western', 'chinese', 'vedic'));

-- Add date column if it doesn't exist
ALTER TABLE astrology_quotes 
ADD COLUMN IF NOT EXISTS date DATE;

-- Add comments
COMMENT ON COLUMN astrology_quotes.astrology_system IS 'Astrology system: western, chinese, or vedic';
COMMENT ON COLUMN astrology_quotes.date IS 'Date when the quote was generated (YYYY-MM-DD)';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_astrology_quotes_system 
ON astrology_quotes(astrology_system);

CREATE INDEX IF NOT EXISTS idx_astrology_quotes_date 
ON astrology_quotes(date);

CREATE INDEX IF NOT EXISTS idx_astrology_quotes_user_date 
ON astrology_quotes(user_id, date);

-- Update existing quotes to default to 'western' and set date from generated_at
UPDATE astrology_quotes 
SET astrology_system = 'western',
    date = DATE(generated_at)
WHERE astrology_system IS NULL OR date IS NULL;

-- Make columns NOT NULL after setting defaults
ALTER TABLE astrology_quotes 
ALTER COLUMN astrology_system SET NOT NULL;

ALTER TABLE astrology_quotes 
ALTER COLUMN date SET NOT NULL;
