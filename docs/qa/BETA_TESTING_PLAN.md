# AstroDating v2 - Beta Testing Plan

**Date:** December 2024  
**Status:** Ready to Execute  
**Prepared By:** Quinn (Test Architect)

---

## Beta Testing Overview

**Objective:** Comprehensive end-to-end testing of all features before production launch

**Duration:** 2-3 hours of focused testing

**Test Accounts Required:** 2+ test users to simulate real interactions

---

## Pre-Testing Setup

### 1. Environment Verification
- [ ] Supabase backend is running
- [ ] `.env` file configured with valid credentials
- [ ] All 36 astrology descriptions cached in Supabase
- [ ] Storage buckets configured (`profile-photos`, `chat-images`)
- [ ] RLS policies applied

### 2. Test Data Preparation
- [ ] Clear any existing test data if needed
- [ ] Database tables created and migrations applied
- [ ] Cache populated (run `npx tsx scripts/populate-astrology-cache.ts` if not done)

### 3. Device Setup
- [ ] Android device or emulator ready
- [ ] App installed and running
- [ ] Network connection stable

---

## Test Scenarios

### Scenario 1: Complete User Journey
**Duration:** 45 minutes  
**Priority:** CRITICAL

#### Test Steps:
1. **Sign Up**
   - Create account "TestUser1"
   - Email: testuser1@example.com
   - Password: Test1234!
   - Verify email verification flow
   - Check verification email received

2. **Complete Profile**
   - Fill personal information (name, birth date, country, bio)
   - Upload 5 photos
   - Verify all astrology signs calculated
   - Check profile completion status

3. **Browse Profiles**
   - See profile cards in Explore
   - View compatibility scores
   - Swipe right to hotlist
   - Check browse limit display

4. **View Profile Details**
   - Tap on a profile card
   - View all photos in carousel
   - Check compatibility breakdown
   - Verify astrology signs displayed

5. **Send Message (if 2/3 match)**
   - Check if "Send Intro" button appears
   - Send intro message
   - Verify real-time message delivery

6. **Receive Message**
   - Login as TestUser2
   - Check unread badge
   - Read message
   - Reply to message

**Expected Results:**
- ✅ All flows work end-to-end
- ✅ No crashes or errors
- ✅ Real-time updates working
- ✅ Compatibility calculated correctly

---

### Scenario 2: Compatibility Testing
**Duration:** 30 minutes  
**Priority:** CRITICAL

#### Test Cases:

**TC-COMPAT-001: Perfect Match (3/3)**
- User A: Western=Aries, Chinese=Dragon, Vedic=Leo
- User B: Western=Aries, Chinese=Dragon, Vedic=Leo
- Expected: 3/3 MATCH, can message ✅

**TC-COMPAT-002: Good Match (2/3)**
- User A: Western=Aries, Chinese=Dragon, Vedic=Leo
- User B: Western=Aries, Chinese=Dragon, Vedic=Virgo
- Expected: 2/3 MATCH, can message ✅

**TC-COMPAT-003: Weak Match (1/3)**
- User A: Western=Aries, Chinese=Dragon, Vedic=Leo
- User B: Western=Taurus, Chinese=Tiger, Vedic=Virgo
- Expected: 1/3 (NO MATCH), message button hidden ✅

**TC-COMPAT-004: No Match (0/3)**
- User A: Western=Aries, Chinese=Dragon, Vedic=Leo
- User B: Western=Libr, Chinese=Pig, Vedic=Gemini
- Expected: 0/3 (NO MATCH), message button hidden ✅

**Test Steps:**
1. Create test accounts with different birth dates
2. Calculate expected compatibility
3. Browse profiles and verify compatibility scores
4. Check if message button appears/disappears correctly

**Expected Results:**
- ✅ Compatibility calculations accurate
- ✅ Message button conditional rendering works
- ✅ Visual badges display correctly

---

### Scenario 3: Browse Limits Testing
**Duration:** 20 minutes  
**Priority:** HIGH

#### Test Cases:

**TC-BROWSE-001: Incomplete Profile Limit**
- Create profile with NO photos
- Browse profiles
- Expected: Shows "X/5" counter, limited browsing ✅

**TC-BROWSE-002: Complete Profile Unlimited**
- Complete profile with 5 photos
- Browse profiles
- Expected: Unlimited browsing, no counter ✅

**TC-BROWSE-003: Daily Reset**
- Browse 5 profiles (incomplete profile)
- Wait until next day OR manually change device date
- Expected: Counter resets to 0 ✅

**Test Steps:**
1. Create incomplete profile (no photos)
2. Browse profiles, verify limit message appears
3. Complete profile (add 5 photos)
4. Browse again, verify unlimited access
5. Test daily reset (change date manually for testing)

**Expected Results:**
- ✅ Limits enforced correctly
- ✅ Complete profiles get unlimited access
- ✅ Daily reset working (with manual date change test)

---

### Scenario 4: Real-Time Messaging
**Duration:** 30 minutes  
**Priority:** CRITICAL

#### Test Cases:

**TC-CHAT-001: Send Text Message**
- User A sends message to User B
- Expected: Message appears instantly, no refresh needed ✅

**TC-CHAT-002: Receive Real-Time**
- User B receives message without app refresh
- Expected: Message appears in real-time ✅

**TC-CHAT-003: Unread Badges**
- User A sends message
- User B sees unread badge count
- Expected: Badge shows correct count ✅

**TC-CHAT-004: Message History**
- View conversation
- Expected: Previous messages displayed in order ✅

**TC-CHAT-005: Multiple Conversations**
- Have multiple active conversations
- Expected: All show in chat list, sorted by recent ✅

**Test Steps:**
1. User A and User B open chat simultaneously
2. User A sends message
3. Verify User B receives immediately (no refresh)
4. User B replies
5. Verify User A receives reply
6. Check unread badges update correctly
7. Test with multiple conversation threads

**Expected Results:**
- ✅ Messages deliver instantly
- ✅ No manual refresh needed
- ✅ Unread badges accurate
- ✅ History persists

---

### Scenario 5: Photo Management
**Duration:** 15 minutes  
**Priority:** HIGH

#### Test Cases:

**TC-PHOTO-001: Upload Photos**
- Upload 5 photos via PhotoManagementScreen
- Expected: All photos upload successfully ✅

**TC-PHOTO-002: Delete Photos**
- Delete one photo
- Expected: Photo removed, can upload new one ✅

**TC-PHOTO-003: Set Profile Photo**
- Set primary profile photo
- Expected: Profile photo updated in UI ✅

**TC-PHOTO-004: Profile Photo Display**
- View profile in Explore
- Expected: First photo displays correctly ✅

**Test Steps:**
1. Navigate to Account → Manage Photos
2. Upload 5 photos
3. Delete one photo
4. Upload replacement photo
5. Set profile photo
6. View profile in Explore
7. Verify photos display correctly

**Expected Results:**
- ✅ Upload working (Supabase Storage)
- ✅ Delete working
- ✅ Photos display correctly
- ✅ Profile photo updates

---

### Scenario 6: Edge Cases & Error Handling
**Duration:** 20 minutes  
**Priority:** MEDIUM

#### Test Cases:

**TC-EDGE-001: Network Failure**
- Disable network during upload
- Expected: Clear error message, retry option ✅

**TC-EDGE-002: Invalid Input**
- Try to send empty message
- Expected: Button disabled, validation message ✅

**TC-EDGE-003: Logout/Login**
- Logout and login again
- Expected: Session persists, profile loads ✅

**TC-EDGE-004: Token Expiry**
- Simulate token expiry
- Expected: Graceful redirect to login ✅

**Test Steps:**
1. Test with poor network connection
2. Try various invalid inputs
3. Test logout/login flow
4. Check error messages are user-friendly

**Expected Results:**
- ✅ Graceful error handling
- ✅ User-friendly messages
- ✅ No crashes or freezes

---

## Bug Tracking Template

If issues are found, document using this template:

```markdown
### Bug ID: [BUG-001]
**Severity:** Critical / High / Medium / Low
**Component:** [Feature/File]
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
- 

**Actual Behavior:**
- 

**Screenshot/Videos:**
- 

**Device/OS:**
- 
```

---

## Success Criteria

### Must Pass (Blockers):
- ✅ User signup and login working
- ✅ Photo upload working
- ✅ Browse profiles working
- ✅ Compatibility calculations accurate
- ✅ Real-time messaging working
- ✅ 2-of-3 matching rule enforced

### Should Pass (Non-Blockers):
- ✅ Daily browse reset working
- ✅ Hotlist functionality working
- ✅ Profile editing working
- ✅ Account management working
- ✅ All error handling graceful

### Nice to Have:
- ⏳ Image upload in chat
- ⏳ Push notifications
- ⏳ Advanced filters

---

## Post-Testing Tasks

1. **Document Findings**
   - List all bugs found
   - Prioritize bugs (Critical/High/Medium/Low)
   - Update QA report

2. **Fix Critical Issues**
   - Address any blockers immediately
   - Verify fixes work

3. **Final QA Gate**
   - Re-review fixed issues
   - Update gate decisions if needed
   - Generate final PASS recommendation

---

## Reporting

After testing, create:
- `docs/qa/BETA_TESTING_RESULTS.md` - Detailed test results
- `docs/qa/BUGS_FOUND.md` - List of any issues discovered
- Updated gate files if issues found

---

**Ready to Begin Beta Testing!** 🧪

**Test Lead:** Quinn (Test Architect)  
**Date:** December 2024

