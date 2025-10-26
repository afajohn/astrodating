-- AstroDating v2 - Advanced Astrology Features Database Schema
-- This file contains the database tables needed for:
-- 1. Daily astrology quotes
-- 2. Personalized sign descriptions
-- 3. User notification preferences
-- 4. User activity patterns

-- Table for storing daily astrology quotes
CREATE TABLE IF NOT EXISTS astrology_quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('life', 'career', 'heartbreak', 'finances', 'losses', 'health', 'motivation')),
    time_of_day VARCHAR(20) NOT NULL CHECK (time_of_day IN ('morning', 'afternoon', 'evening')),
    sign VARCHAR(50) NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for caching personalized sign descriptions
CREATE TABLE IF NOT EXISTS sign_descriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sign VARCHAR(100) UNIQUE NOT NULL, -- Increased length to support "SignName_System" format
    description TEXT NOT NULL,
    strengths TEXT[] DEFAULT '{}',
    challenges TEXT[] DEFAULT '{}',
    advice TEXT NOT NULL,
    astrology_system VARCHAR(20) NOT NULL CHECK (astrology_system IN ('western', 'chinese', 'vedic')),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for user notification preferences
CREATE TABLE IF NOT EXISTS user_notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    preferences JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for tracking user activity patterns
CREATE TABLE IF NOT EXISTS user_activity_patterns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    morning_active BOOLEAN DEFAULT FALSE,
    afternoon_active BOOLEAN DEFAULT FALSE,
    evening_active BOOLEAN DEFAULT FALSE,
    last_active_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    average_active_hours INTEGER[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing push notification tokens
CREATE TABLE IF NOT EXISTS user_push_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_astrology_quotes_user_id ON astrology_quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_astrology_quotes_generated_at ON astrology_quotes(generated_at);
CREATE INDEX IF NOT EXISTS idx_sign_descriptions_sign ON sign_descriptions(sign);
CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user_id ON user_notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_patterns_user_id ON user_activity_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_user_push_tokens_user_id ON user_push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_push_tokens_active ON user_push_tokens(is_active);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE astrology_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sign_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;

-- Policies for astrology_quotes
CREATE POLICY "Users can view their own quotes" ON astrology_quotes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quotes" ON astrology_quotes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for sign_descriptions (public read)
CREATE POLICY "Anyone can view sign descriptions" ON sign_descriptions
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can insert sign descriptions" ON sign_descriptions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policies for user_notification_preferences
CREATE POLICY "Users can manage their own notification preferences" ON user_notification_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Policies for user_activity_patterns
CREATE POLICY "Users can manage their own activity patterns" ON user_activity_patterns
    FOR ALL USING (auth.uid() = user_id);

-- Policies for user_push_tokens
CREATE POLICY "Users can manage their own push tokens" ON user_push_tokens
    FOR ALL USING (auth.uid() = user_id);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at columns
CREATE TRIGGER update_user_notification_preferences_updated_at 
    BEFORE UPDATE ON user_notification_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_activity_patterns_updated_at 
    BEFORE UPDATE ON user_activity_patterns 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_push_tokens_updated_at 
    BEFORE UPDATE ON user_push_tokens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default sign descriptions (fallback data) - Western Zodiac examples
INSERT INTO sign_descriptions (sign, description, strengths, challenges, advice, astrology_system) VALUES
('Aries_western', 'As an Aries, you are a natural-born leader with incredible energy and determination. Your fiery spirit drives you to take initiative and blaze new trails. You possess the courage to face any challenge head-on and inspire others with your enthusiasm.', 
 ARRAY['Natural leadership', 'High energy', 'Courageous'], 
 ARRAY['Impatience', 'Impulsiveness'], 
 'Channel your energy into focused goals and practice patience with others.',
 'western'),
 
('Taurus_western', 'As a Taurus, you are grounded, reliable, and deeply connected to the physical world. Your steady nature provides stability for those around you, and your appreciation for beauty and comfort makes life more enjoyable for everyone.', 
 ARRAY['Reliability', 'Practical wisdom', 'Appreciation for beauty'], 
 ARRAY['Stubbornness', 'Resistance to change'], 
 'Embrace change gradually and use your determination to achieve long-term goals.',
 'western'),
 
('Gemini_western', 'As a Gemini, you are intellectually curious and endlessly adaptable. Your quick wit and communication skills make you a natural connector of people and ideas. You bring fresh perspectives and keep conversations lively and engaging.', 
 ARRAY['Intellectual curiosity', 'Communication skills', 'Adaptability'], 
 ARRAY['Restlessness', 'Indecisiveness'], 
 'Focus your mental energy on meaningful projects and trust your intuition when making decisions.',
 'western')
ON CONFLICT (sign) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE astrology_quotes IS 'Stores daily personalized astrology quotes generated by AI';
COMMENT ON TABLE sign_descriptions IS 'Caches personalized zodiac sign descriptions generated by AI';
COMMENT ON TABLE user_notification_preferences IS 'User preferences for astrology quote notifications';
COMMENT ON TABLE user_activity_patterns IS 'Tracks user activity patterns for optimal notification timing';
COMMENT ON TABLE user_push_tokens IS 'Stores push notification tokens for each user and platform';
