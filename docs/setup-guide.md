# AstroDating v2 Setup Guide

**Version:** 1.0  
**Date:** December 2024  
**Purpose:** Complete setup guide for AstroDating with Expo + Supabase  

---

## PREREQUISITES

### Required Software
- **Node.js:** 18.19.0 LTS or higher
- **npm:** 9.0.0 or higher
- **Git:** Latest stable version
- **Android Studio:** For Android development
- **Expo CLI:** Will be installed during setup

### Check Prerequisites
```bash
# Check Node.js version
node --version  # Should be 18.19.0+

# Check npm version
npm --version   # Should be 9.0.0+

# Check Git
git --version
```

---

## STEP 1: PROJECT INITIALIZATION

### Create New Expo Project
```bash
# Create new Expo project with TypeScript
npx create-expo-app@latest AstroDating_v2 --template expo-template-blank-typescript

# Navigate to project
cd AstroDating_v2

# Verify project structure
ls -la
```

### Expected Project Structure
```
AstroDating_v2/
├── app.json
├── package.json
├── tsconfig.json
├── app/
├── components/
├── assets/
└── node_modules/
```

---

## STEP 2: SUPABASE SETUP

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub (recommended)
4. Click "New Project"
5. Fill in details:
   - **Name:** `AstroDating`
   - **Database Password:** Generate and save
   - **Region:** Southeast Asia (Singapore)
   - **Pricing Plan:** Free tier
6. Click "Create new project"
7. Wait 2-3 minutes for provisioning

### Get API Keys
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** Long string starting with `eyJ...`
   - **service_role key:** (Secret key - for backend only)

### Configure Environment Variables
Create `.env` file in project root:
```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key

# Optional: Service role key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
```

---

## STEP 3: INSTALL DEPENDENCIES

### Core Dependencies (CRITICAL: Use expo install)
```bash
# Supabase integration
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage

# Navigation
npx expo install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs

# UI Components
npx expo install react-native-paper react-native-vector-icons

# Forms
npx expo install react-hook-form

# Image handling
npx expo install expo-image-picker expo-image-manipulator expo-media-library

# Gestures and animations
npx expo install react-native-gesture-handler react-native-reanimated

# Swipe components
npx expo install react-native-deck-swiper

# Utilities
npx expo install date-fns expo-secure-store expo-constants
```

### Platform-Specific Dependencies
```bash
# Install iOS dependencies (if targeting iOS later)
npx expo install --ios

# Install Android dependencies
npx expo install --android
```

---

## STEP 4: SUPABASE CONFIGURATION

### Create Supabase Client
Create `lib/supabase.ts`:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### Create Database Schema
Go to Supabase **SQL Editor** and run this schema:

```sql
-- Users table (Supabase creates auth.users automatically)
-- We create a public.profiles table to extend it
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  birth_date DATE,
  age INTEGER GENERATED ALWAYS AS (
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date))::INTEGER
  ) STORED,
  country TEXT CHECK (country IN ('Philippines', 'Thailand')),
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  seeking TEXT NOT NULL CHECK (seeking IN ('male', 'female')),
  marital_status TEXT CHECK (marital_status IN ('single', 'divorced', 'widowed')),
  bio TEXT CHECK (LENGTH(bio) <= 500),
  photos TEXT[] DEFAULT '{}',
  western_sign TEXT,
  chinese_sign TEXT,
  vedic_sign TEXT,
  hotlist UUID[] DEFAULT '{}',
  profiles_browsed_today INTEGER DEFAULT 0,
  last_browse_reset_date TIMESTAMPTZ DEFAULT NOW(),
  is_profile_complete BOOLEAN GENERATED ALWAYS AS (
    first_name IS NOT NULL AND
    last_name IS NOT NULL AND
    birth_date IS NOT NULL AND
    country IS NOT NULL AND
    marital_status IS NOT NULL AND
    bio IS NOT NULL AND
    ARRAY_LENGTH(photos, 1) = 5
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User compatibility cache
CREATE TABLE public.user_compatibility (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_a UUID REFERENCES public.profiles(id) NOT NULL,
  user_b UUID REFERENCES public.profiles(id) NOT NULL,
  total_score INTEGER CHECK (total_score >= 0 AND total_score <= 3),
  western_compatible BOOLEAN NOT NULL,
  chinese_compatible BOOLEAN NOT NULL,
  vedic_compatible BOOLEAN NOT NULL,
  is_match BOOLEAN GENERATED ALWAYS AS (total_score >= 2) STORED,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_a, user_b),
  CHECK (user_a != user_b)
);

-- Conversations
CREATE TABLE public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_a UUID REFERENCES public.profiles(id) NOT NULL,
  participant_b UUID REFERENCES public.profiles(id) NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  last_message_sender UUID REFERENCES public.profiles(id),
  initiated_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_a, participant_b),
  CHECK (participant_a != participant_b)
);

-- Messages
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) NOT NULL,
  recipient_id UUID REFERENCES public.profiles(id) NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image')),
  content TEXT CHECK (LENGTH(content) <= 1000),
  image_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports
CREATE TABLE public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES public.profiles(id) NOT NULL,
  reported_user_id UUID REFERENCES public.profiles(id) NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('inappropriate_photos', 'fake_profile', 'spam', 'harassment', 'other')),
  details TEXT CHECK (LENGTH(details) <= 500),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'action_taken')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profile views (analytics)
CREATE TABLE public.profile_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  viewer_id UUID REFERENCES public.profiles(id) NOT NULL,
  viewed_user_id UUID REFERENCES public.profiles(id) NOT NULL,
  source TEXT DEFAULT 'explore' CHECK (source IN ('explore', 'hotlist', 'chat')),
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_profiles_gender_seeking ON public.profiles(gender, seeking);
CREATE INDEX idx_profiles_country ON public.profiles(country);
CREATE INDEX idx_user_compatibility_user_a ON public.user_compatibility(user_a);
CREATE INDEX idx_user_compatibility_user_b ON public.user_compatibility(user_b);
CREATE INDEX idx_user_compatibility_is_match ON public.user_compatibility(is_match);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_recipient_unread ON public.messages(recipient_id, is_read);
CREATE INDEX idx_conversations_participants ON public.conversations(participant_a, participant_b);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, gender, seeking)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'gender',
    NEW.raw_user_meta_data->>'seeking'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Configure Storage for Photos
1. Go to **Storage** in Supabase dashboard
2. Click "Create a new bucket"
3. Bucket name: `profile-photos`
4. Public bucket: ✅ YES
5. Click "Create bucket"
6. Add policies for upload access

---

## STEP 5: PROJECT CONFIGURATION

### Update package.json
Ensure your `package.json` matches the template in `docs/tech-stack-supabase.md`:

```json
{
  "name": "astrodating-v2",
  "version": "1.0.0",
  "main": "expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "audit": "scripts/audit-dependencies.bat"
  },
  "dependencies": {
    "expo": "~51.0.0",
    "react": "18.2.0",
    "react-native": "0.74.5",
    "@supabase/supabase-js": "2.39.3",
    "@react-native-async-storage/async-storage": "1.21.0",
    "@react-navigation/native": "6.1.9",
    "@react-navigation/stack": "6.3.20",
    "@react-navigation/bottom-tabs": "6.5.11",
    "react-native-paper": "5.12.3",
    "react-native-vector-icons": "10.0.3",
    "react-hook-form": "7.48.2",
    "expo-image-picker": "15.0.7",
    "expo-image-manipulator": "12.0.1",
    "expo-media-library": "16.0.2",
    "react-native-gesture-handler": "2.14.0",
    "react-native-reanimated": "3.6.2",
    "react-native-deck-swiper": "2.0.17",
    "date-fns": "3.0.6",
    "expo-secure-store": "12.8.1",
    "expo-constants": "15.4.5"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.45",
    "typescript": "~5.3.3"
  },
  "engines": {
    "npm": ">=9.0.0",
    "node": ">=18.19.0"
  },
  "packageManager": "npm@9.8.1",
  "overrides": {
    "@supabase/supabase-js": "2.39.3",
    "@react-native-async-storage/async-storage": "1.21.0",
    "react-native-paper": "5.12.3"
  },
  "private": true
}
```

### Configure App.json
Update `app.json` with your project details:
```json
{
  "expo": {
    "name": "AstroDating",
    "slug": "astrodating-v2",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

---

## STEP 6: VERIFICATION

### Run Dependency Audit
```bash
# Run the audit script
scripts/audit-dependencies.bat

# Or manually check
npx expo doctor
```

### Test Supabase Connection
Create `test-supabase.ts`:
```typescript
import { supabase } from './lib/supabase';

async function testConnection() {
  try {
    const { data, error } = await supabase.from('profiles').select('count');
    if (error) {
      console.error('Supabase connection error:', error);
    } else {
      console.log('Supabase connection successful!');
    }
  } catch (err) {
    console.error('Connection test failed:', err);
  }
}

testConnection();
```

### Start Development Server
```bash
# Start Expo development server
npx expo start

# Or start with specific platform
npx expo start --android
npx expo start --ios
```

---

## STEP 7: INITIAL TESTING

### Test Authentication
1. Create a simple auth screen
2. Test signup/login flow
3. Verify email verification works
4. Check profile creation

### Test Database Operations
1. Create a test profile
2. Test profile updates
3. Verify photo uploads
4. Test compatibility calculations

### Test Navigation
1. Set up basic navigation structure
2. Test screen transitions
3. Verify bottom tabs work
4. Test stack navigation

---

## TROUBLESHOOTING

### Common Issues

#### Issue 1: Supabase Connection Failed
**Solution:**
- Check environment variables in `.env`
- Verify Supabase project is active
- Check network connectivity

#### Issue 2: Package Version Conflicts
**Solution:**
- Run `scripts/audit-dependencies.bat`
- Use `npx expo install` for all packages
- Check `docs/version-compatibility-matrix.md`

#### Issue 3: Metro Bundler Errors
**Solution:**
- Clear Metro cache: `npx expo start --clear`
- Restart development server
- Check for conflicting packages

#### Issue 4: Android Build Issues
**Solution:**
- Ensure Android Studio is installed
- Check Android SDK configuration
- Run `npx expo install --android`

### Getting Help
1. Check `docs/version-compatibility-matrix.md`
2. Run `npx expo doctor`
3. Check Supabase dashboard for errors
4. Review Expo documentation

---

## NEXT STEPS

After successful setup:

1. ✅ **Implement authentication screens**
2. ✅ **Create profile management**
3. ✅ **Build astrology service**
4. ✅ **Implement browse functionality**
5. ✅ **Add chat features**

### Development Workflow
1. **Always use:** `npx expo install <package>`
2. **Never use:** `npm install <package>` directly
3. **Run audit weekly:** `scripts/audit-dependencies.bat`
4. **Test thoroughly** after each change
5. **Commit package-lock.json** to version control

---

**Setup Status:** ✅ Complete  
**Last Updated:** December 2024  
**Owner:** Development Team
