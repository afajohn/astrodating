# Fixing Gemini API Rate Limit Issues

## Problem

When new users sign up, the app tries to generate their astrology overview (3 signs × 3 systems = 9 potential Gemini API calls per user), hitting rate limits quickly.

**Gemini API Free Tier Limits:**
- 15 requests per minute
- 1,500 requests per day
- Limited tokens per request

## Root Cause

The current implementation calls Gemini API whenever:
1. A new user views their Account screen
2. `AIAstrologicalProfile` component loads
3. Sign descriptions are not cached in Supabase

## Solution: Pre-populate Cache + Use Cafe Astrology Content

### Step 1: Run Pre-population Script

```bash
# Install dependencies if needed
npm install

# Run the cache population script
npx tsx scripts/pre-populate-astrology-cache.ts
```

This script will:
- ✅ Populate **Western signs** with Cafe Astrology content (richest content)
- ✅ Populate **Chinese signs** with basic descriptions
- ✅ Populate **Vedic signs** with basic descriptions
- ✅ Skip Gemini API entirely for new user signups

### Step 2: Verify Cache Population

Check Supabase dashboard → Table Editor → `astrology_descriptions`

You should see 36 rows:
- 12 Western signs
- 12 Chinese signs  
- 12 Vedic signs

### Step 3: Test New User Signup

1. Sign up a new user
2. Navigate to Account screen
3. Verify astrology descriptions load instantly (no loading spinner)
4. Check browser console - should see "Using cached description" logs

## How It Works Now

```
Priority 1: Cafe Astrology Content (Western signs only)
    ↓ (if not found)
Priority 2: Supabase Cache (all signs)
    ↓ (if not found)  
Priority 3: Gemini AI API (only as last resort)
    ↓ (if fails)
Priority 4: Basic Fallback Description
```

## Benefits

- 🚀 **Zero API calls** for Western signs (uses pre-loaded Cafe Astrology content)
- 🚀 **Zero API calls** for Chinese/Vedic signs (uses pre-loaded basic descriptions)
- 🚀 **Instant loading** for all users
- 💰 **Zero Gemini API costs** for signup flow
- 📈 **Unlimited scaling** - can handle thousands of signups per day

## Alternative: Use Comprehensive Astrology Website

If you want even richer content for Chinese and Vedic signs, you could:

1. **Use a reference site** like:
   - https://www.chinesezodiac.com/
   - https://www.astroved.com/ (Vedic)
   
2. **Scrape or manually input** their content into the cache

3. **Or subscribe to a paid astrology content API** like:
   - AstroAPI.com
   - Horoscope.com API
   - AstrologyAPI.com

But the current solution (Cafe Astrology + Basic descriptions) is sufficient for MVP.

## Monitoring

Check Gemini API usage:
1. Visit https://makersuite.google.com/
2. Click your project → API usage
3. Should see minimal/quota usage after pre-population

## Rollback Plan

If you need to regenerate descriptions:

```sql
-- Clear cache in Supabase
TRUNCATE TABLE astrology_descriptions;

-- Then run the pre-population script again
npx tsx scripts/pre-populate-astrology-cache.ts
```

## Next Steps

1. ✅ Run the pre-population script
2. ✅ Verify cache is populated
3. ✅ Test new user signup
4. ✅ Monitor Gemini API usage (should be near zero)
5. ✅ Add photo upload functionality
6. ✅ Implement compatibility scoring
