# Beta Testing Quick Start

**Status:** Ready to Begin  
**Estimated Time:** 10 minutes setup + 2-3 hours testing

---

## Quick Setup Checklist

### ✅ Pre-Flight Checks (5 minutes)

1. **Verify .env file exists**
   ```bash
   # In project root, check if .env file exists
   ls -la .env
   ```

2. **Verify Supabase connection**
   ```bash
   # Test Supabase connection
   npm run start
   # App should start without errors
   ```

3. **Verify astrology cache is populated**
   - Go to Supabase Dashboard → Table Editor
   - Check `astrology_descriptions` table has 36 rows
   - If not, run: `npx tsx scripts/populate-astrology-cache.ts`

---

## Start Beta Testing

### Step 1: Launch App
```bash
npm run start
# or
npx expo start
```

### Step 2: Choose Your Testing Device
- ✅ Android phone (recommended)
- ✅ Android emulator
- ✅ iOS simulator (for iOS testing)

### Step 3: Begin Testing
Open: `docs/qa/BETA_TESTING_PLAN.md` and follow the scenarios

---

## Quick Test Script (15 minutes)

If you want a **quick smoke test** before full beta:

### 🚀 Quick Smoke Test

1. **Sign Up** (2 min)
   - Create test account
   - Verify email (if required)
   - Login

2. **Profile Creation** (3 min)
   - Fill personal info
   - Upload 5 photos (use sample images)
   - Check astrology signs displayed

3. **Browse Profiles** (2 min)
   - View profile cards
   - Check compatibility scores appear
   - Swipe right on a profile

4. **Hotlist** (1 min)
   - Check hotlisted profile appears
   - View profile details

5. **Chat** (5 min)
   - Create 2nd test account
   - Message between accounts
   - Verify real-time delivery
   - Check unread badges

6. **Account** (2 min)
   - View My Account screen
   - Check astrology information
   - Verify navigation

**Total Time:** ~15 minutes  
**If all pass:** Proceed to full beta testing  
**If issues found:** Document and fix before proceeding

---

## What to Look For

### ✅ Good Signs
- App loads quickly
- No crashes or errors
- Real-time updates working
- Photos upload successfully
- Messages deliver instantly
- Compatibility scores accurate

### ⚠️ Red Flags
- App crashes on startup
- Photos don't upload
- Messages don't deliver in real-time
- Compatibility calculations wrong
- Errors in console

---

## Reporting Issues

If you find bugs:

1. **Document immediately** in `docs/qa/BUGS_FOUND.md`
2. **Take screenshot** of error
3. **Copy console logs** (if relevant)
4. **Note device and OS version**

---

## Beta Testing Command Reference

```bash
# Start the app
npm run start

# Run in specific mode
npx expo start --android
npx expo start --ios

# Clear cache and restart
npx expo start -c

# View logs
npx expo start --dev-client
```

---

## Test Accounts Setup

**Account 1:** "Alice"
- Email: alice@test.com
- Gender: Female, Seeking: Male
- Birth Date: 1990-01-15 (Aries/Dragon/Leo)

**Account 2:** "Bob"
- Email: bob@test.com
- Gender: Male, Seeking: Female
- Birth Date: 1995-06-20 (Gemini/Pig/Virgo)

*Adjust birth dates for desired compatibility testing*

---

## Ready to Start?

1. ✅ Review this guide
2. ✅ Launch app (`npm run start`)
3. ✅ Open on your device
4. ✅ Begin with Quick Smoke Test
5. ✅ Proceed to full beta testing if smoke test passes

**Good luck with beta testing!** 🧪

---

**Questions?** Check: `docs/qa/BETA_TESTING_PLAN.md` for detailed test cases

