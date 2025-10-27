# How to Set Up .env File

## Step 1: Get Your Supabase Credentials

1. Go to https://app.supabase.com
2. Sign in to your AstroDating project
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **service_role key**: (the secret key, NOT the anon key)

## Step 2: Create .env File

Create a file named `.env` in the project root (same folder as `package.json`):

```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-api-key-here
```

## Step 3: Run the Pre-population Script

```bash
npx tsx scripts/pre-populate-astrology-cache-node.ts
```

This will populate all 36 astrology descriptions (12 Western + 12 Chinese + 12 Vedic) into your Supabase database cache.

## Why This Solves the Rate Limit Problem

After running this script:
- ✅ All sign descriptions are cached in Supabase
- ✅ New users get instant astrology overviews (no Gemini API calls needed)
- ✅ Zero Gemini API rate limit issues during signup
- ✅ Cost savings - no API usage for descriptions

The app will now use:
1. **Cafe Astrology content** (Western signs - rich, pre-loaded)
2. **Supabase cache** (all signs - pre-populated by script)
3. **Basic descriptions** (fallback if cache miss)
4. **Gemini API** (only as last resort)

This means new users will almost NEVER trigger Gemini API calls!
