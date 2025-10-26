# Supabase Setup Guide for AstroDating

**Estimated Time:** 10 minutes  
**Difficulty:** Easy ⭐

---

## Step 1: Create Supabase Account (2 minutes)

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub (recommended) or email
4. You'll be redirected to the dashboard

---

## Step 2: Create New Project (3 minutes)

1. Click "New Project"
2. Fill in details:
   - **Name:** `AstroDating`
   - **Database Password:** Click "Generate a password" (SAVE THIS!)
   - **Region:** Southeast Asia (Singapore) - nearest to Philippines/Thailand
   - **Pricing Plan:** Free tier
3. Click "Create new project"
4. Wait 2-3 minutes for database to provision

---

## Step 3: Get API Keys (1 minute)

1. Once project is ready, go to **Settings** (gear icon) → **API**
2. Copy these values:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** Long string starting with `eyJ...`
   - **service_role key:** (Secret key - only for backend)

3. Save these - we'll add them to `.env` files

---

## Step 4: Configure Authentication (2 minutes)

1. Go to **Authentication** → **Providers**
2. **Email** provider should be enabled by default
3. Settings to configure:
   - **Enable email confirmations:** ✅ ON (default)
   - **Confirm email:** ✅ ON
   - **Double confirm email changes:** Optional
4. Go to **Authentication** → **URL Configuration**
5. **Site URL:** `exp://localhost:8081` (for development)
6. **Redirect URLs:** Add `exp://localhost:8081/**` (allows Expo deep links)

---

## Step 5: Create Database Tables (5 minutes)

1. Go to **SQL Editor**
2. Click "New Query"
3. Paste this SQL schema:

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

-- RLS Policies for profiles (users can read all verified profiles, update only their own)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for messages (users can read messages they're involved in)
CREATE POLICY "Users can view own messages"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- RLS Policies for conversations
CREATE POLICY "Users can view own conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = participant_a OR auth.uid() = participant_b);

CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = participant_a OR auth.uid() = participant_b);

-- RLS Policies for compatibility (everyone can read)
CREATE POLICY "Compatibility scores are viewable by everyone"
  ON public.user_compatibility FOR SELECT
  USING (true);

-- RLS Policies for reports
CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- RLS Policies for profile views
CREATE POLICY "Users can log profile views"
  ON public.profile_views FOR INSERT
  WITH CHECK (auth.uid() = viewer_id);

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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

4. Click **RUN** (bottom right)
5. You should see "Success. No rows returned"

---

## Step 6: Configure Storage for Photos (2 minutes)

1. Go to **Storage** in left sidebar
2. Click "Create a new bucket"
3. Bucket name: `profile-photos`
4. Public bucket: ✅ YES (photos need to be publicly accessible)
5. Click "Create bucket"
6. Click on `profile-photos` bucket
7. Go to **Policies** tab
8. Add policy:
   - **Policy name:** "Users can upload own photos"
   - **Allowed operations:** INSERT
   - **Policy definition:**
   ```sql
   (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1])
   ```
9. Add another policy:
   - **Policy name:** "Photos are publicly accessible"
   - **Allowed operations:** SELECT
   - **Policy definition:** `true`

---

## Step 7: Configure Environment Variables

Create `backend/.env`:

```bash
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key

# Server
NODE_ENV=development
PORT=5000

# JWT (Supabase handles this, but we might need for custom logic)
JWT_SECRET=your-generated-secret
```

Create `mobile/.env`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
```

---

## Step 8: Test Connection

```bash
# Backend can query Supabase
npm run start:backend

# Mobile app connects to Supabase
npm run start:mobile
```

---

## Next Steps

Once Supabase is set up:

1. ✅ I'll update backend package.json (remove MongoDB deps, add Supabase)
2. ✅ I'll create Supabase client configuration
3. ✅ I'll implement auth screens with Supabase Auth
4. ✅ I'll implement profile management with Supabase queries
5. ✅ I'll implement real-time chat with Supabase Realtime

**Estimated dev time savings: 60-70% of Epic 1, 40% of Epic 5**

---

## Benefits Summary

| Feature | MongoDB Approach | Supabase Approach | Time Saved |
|---------|-----------------|-------------------|------------|
| Setup | 30 min | 5 min | 25 min |
| Authentication | 2-3 days (6 stories) | 2 hours (use Supabase Auth) | 2.5 days |
| File Upload | 1 day (Cloudinary integration) | 1 hour (Supabase Storage) | 1 day |
| Chat | 2 days (polling implementation) | 4 hours (real-time subscriptions) | 1.5 days |
| **TOTAL** | **~2 weeks** | **~3-4 days** | **~1.5 weeks** |

---

**Ready for setup?** Follow the steps above and let me know when you have your Supabase project URL and API keys! 🚀

