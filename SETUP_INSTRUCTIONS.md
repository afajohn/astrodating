# AstroDating v2 - Environment Setup Instructions

## Quick Fix for Current Error

The app is showing "⚠️ Supabase not configured" because the environment variables are not set up yet.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub (recommended)
4. Click "New Project"
5. Fill in details:
   - **Name:** `AstroDating`
   - **Database Password:** Generate and save securely
   - **Region:** Southeast Asia (Singapore)
   - **Pricing Plan:** Free tier
6. Click "Create new project"
7. Wait 2-3 minutes for provisioning

## Step 2: Get API Keys

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy these values:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** Long string starting with `eyJ...`

## Step 3: Create Environment File

Create a `.env` file in the project root with:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key-here
```

**Important:** Replace `your-project-id` and `eyJ...your-anon-key-here` with your actual values from Step 2.

## Step 4: Restart Development Server

```bash
npx expo start --clear
```

## Expected Result

After setting up the environment variables, the app should show:
- ✅ Supabase connected successfully!
- Status: Configured

## Troubleshooting

### If you still get errors:
1. **Check .env file location** - Must be in project root (same level as package.json)
2. **Check variable names** - Must start with `EXPO_PUBLIC_`
3. **Restart server** - Run `npx expo start --clear`
4. **Check Supabase project** - Make sure it's active and not paused

### If you want to test without Supabase:
The app will show "⚠️ Supabase not configured" but won't crash. You can still test the basic app functionality.

---

**Next Steps:** Once Supabase is configured, we can proceed with implementing authentication screens and database schema.
