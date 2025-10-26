# AstroDating Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** October 22, 2025  
**Status:** Initial Draft  

---

## Goals and Background Context

### Goals

- Enable astrology-based matching for singles in Philippines and Thailand using tri-system compatibility (Western, Chinese, Vedic)
- Achieve 10,000 registered users within 3 months of Android launch with 15% profile completion rate
- Deliver Android MVP within 8-12 weeks using MERN stack with React Native/Expo
- Implement progressive profile unlocking to drive high-quality profile completion (5 photos, complete bio)
- Provide transparent compatibility scoring (2-of-3 rule) that builds user trust in matching algorithm
- Create scalable architecture using static compatibility matrices for infinite performance
- Establish cultural authenticity and differentiation in Southeast Asian dating market

### Background Context

AstroDating addresses a significant market gap in Southeast Asian dating applications by combining modern mobile technology with culturally-resonant astrological compatibility science. Traditional dating platforms operating in Philippines and Thailand rely on location-based or superficial photo-swiping mechanics that ignore the deeply-held cultural beliefs in astrological compatibility common in these markets. This creates friction between user expectations (compatibility guidance based on astrology) and product offerings (Western-centric matching algorithms).

The application employs a proprietary tri-astrology matching engine that evaluates compatibility across Western Zodiac, Chinese Zodiac, and Vedic Astrology systems. The "2-of-3 rule" unlocks chat functionality when users demonstrate compatibility in at least 2 of the 3 systems, balancing accessibility with meaningful compatibility. By automating astrological sign derivation from birthdates and pre-calculating compatibility through static matrices, the product delivers instant compatibility insights at scale while respecting traditional beliefs. The MVP targets Android-first deployment to capture the dominant mobile platform in the target markets.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| Oct 22, 2025 | 1.0 | Initial PRD draft created from Project Brief | Business Analyst |

---

## Requirements

### Functional Requirements

**FR1:** The system shall support user registration with email and password, sending a verification email upon signup that must be confirmed before profile browsing is enabled.

**FR2:** The system shall require users to select their gender (Male/Female) and seeking preference (Man/Woman) during onboarding via a clear home screen selector.

**FR3:** The system shall collect user profile information including: first name, last name, birthdate, country (Philippines/Thailand focus), marital status (single/divorced/widowed), and bio text.

**FR4:** The system shall require users to upload exactly 5 profile photos, with each image validated client-side to be under 10MB before upload to Cloudinary storage.

**FR5:** The system shall automatically derive and store three astrological signs for each user based on their birthdate: Western Zodiac (sun sign), Chinese Zodiac (animal), and Vedic Astrology (Rasi/Moon sign simplified).

**FR6:** The system shall calculate a compatibility score (0-3) between any two users by comparing their three astrological signs against pre-defined compatibility matrices, awarding 1 point for each compatible system.

**FR7:** The system shall enforce a "2-of-3 matching rule" where users can only initiate chat with profiles having a compatibility score of 2 or higher.

**FR8:** The system shall implement progressive browsing limits: users with incomplete profiles (missing any required field or having fewer than 5 photos) can view maximum 5 profiles per day; users with complete profiles have unlimited browsing.

**FR9:** The system shall provide an Explore/Browse screen with infinite scroll displaying profiles in Tinder-style swipeable cards showing first name, age, country, and prominent compatibility badges.

**FR10:** The system shall display detailed profile views containing all 5 photos, bio, astrological signs, compatibility score breakdown, and a conditional "Send Intro Message" button (visible only if compatibility score ≥ 2).

**FR11:** The system shall allow users to bookmark profiles to a "Hotlist" by swiping right, accessible from a dedicated screen displaying saved profiles.

**FR12:** The system shall provide a "My Account" screen displaying the user's three astrological signs, a list of signs highly compatible with theirs, and quick navigation to the Explore screen.

**FR13:** The system shall enable basic text chat messaging between matched users (compatibility score ≥ 2) using polling-based message delivery (checking for new messages every 10 seconds).

**FR14:** The system shall filter Explore screen results based on user's seeking preference (e.g., males see only females if seeking women, and vice versa).

**FR15:** The system shall track daily profile view counts per user to enforce the 5-profile-per-day limit for incomplete profiles, resetting the counter daily at midnight UTC.

**FR16:** The system shall hash all passwords using bcryptjs (minimum 12 salt rounds) before storage and authenticate users via JWT tokens with 7-day expiration.

**FR17:** The system shall validate profile completion status (boolean flag) based on presence of all required fields (first name, last name, birthdate, country, marital status, bio, and exactly 5 photos).

**FR18:** The system shall implement a nightly batch job (3 AM UTC) to pre-calculate and cache compatibility scores for all user pairs, storing results in a UserCompatibility collection for instant browse performance.

**FR19:** The system shall allow users to report inappropriate profiles with predefined reasons (inappropriate photos, fake profile, spam, harassment, other), storing reports for manual review.

**FR20:** The system shall provide profile editing functionality allowing users to update personal information, bio, and photos after initial profile creation, with automatic sign recalculation if birthdate changes.

### Non-Functional Requirements

**NFR1:** The Android application shall launch in under 3 seconds on mid-range devices (minimum 2GB RAM, Android 8.0+).

**NFR2:** The Explore screen shall load the first 20 profiles in under 3 seconds on 4G connections, with seamless pagination as users scroll.

**NFR3:** The backend API shall maintain 99.5% uptime during business hours (8 AM - 11 PM local time in Philippines/Thailand).

**NFR4:** All API endpoints shall respond within 2 seconds at the 95th percentile latency under normal load conditions.

**NFR5:** The system shall store all user images on Cloudinary CDN with automatic optimization and serve via HTTPS with TLS 1.3 encryption.

**NFR6:** The system shall implement CORS restrictions limiting API access to the authorized mobile application domain only.

**NFR7:** The astrology service compatibility calculation module shall be isolated, testable, and independently executable from other system components.

**NFR8:** The MongoDB database shall use composite indexes on (gender + seeking + is_profile_complete) fields to optimize Explore screen queries.

**NFR9:** The system shall operate within free-tier infrastructure limits during MVP phase: MongoDB Atlas M0, Railway/Render free tier, Cloudinary free tier (maximum $100/month total spend).

**NFR10:** The Android APK size shall not exceed 50MB to ensure easy downloads on limited bandwidth connections common in target markets.

**NFR11:** The system shall implement rate limiting on authentication endpoints (maximum 5 login attempts per IP per 15 minutes) to prevent brute force attacks.

**NFR12:** The system shall be functional on 3G networks (minimum) and optimized for 4G/LTE performance with graceful degradation.

**NFR13:** All user-generated content displayed in the application shall be sanitized using appropriate escaping to prevent XSS vulnerabilities.

**NFR14:** The codebase shall use a monorepo structure with `/backend` and `/mobile` directories for simplified version control and deployment coordination.

**NFR15:** The system shall support data export and deletion requests to align with GDPR-inspired privacy principles.

**NFR16:** Chat message polling shall be optimized with adaptive intervals (10 seconds active, 30 seconds if idle, stopped when backgrounded) to balance real-time feel with resource efficiency.

**NFR17:** The compatibility calculation batch job shall process 1,000 user pairs in under 10 minutes with progress logging and error resilience.

**NFR18:** Profile views shall be tracked in a ProfileView collection for analytics purposes with fire-and-forget API calls that don't block UI interactions.

---

## User Interface Design Goals

### Overall UX Vision

AstroDating delivers a modern, visually appealing mobile experience that balances simplicity with cultural authenticity. The interface emphasizes **visual discovery** through prominent photo displays while maintaining **transparency in compatibility** through clear scoring indicators. The UX prioritizes **progressive disclosure**—users see basic profile cards in browse mode, then access detailed astrological insights on-demand. Navigation follows familiar dating app patterns (bottom tab bar) while introducing unique elements like the compatibility score badge and astrological sign iconography. The overall feel should be warm, trustworthy, and slightly mystical (reflecting astrology theme) without appearing gimmicky or overwhelming.

### Key Interaction Paradigms

- **Tinder-Style Swipe Discovery:** Full-screen profile cards with swipe gestures for browsing
  - **Swipe Right:** Add to Hotlist (like/interested)
  - **Swipe Left:** Pass (not interested)
  - **Tap Card:** View full profile details
- **Compatibility-First Visual Design:** Large, prominent compatibility score badge (e.g., "2/3 MATCH" or "PERFECT 3/3 MATCH") displayed on each card
- **Progressive Profile Reveal:** Swipe card shows primary photo + basic info; tap card reveals full profile (all photos, bio, astrological breakdown)
- **Photo Carousel:** Full profile view allows swiping through all 5 user photos
- **Bottom Tab Navigation:** Primary navigation via persistent bottom tabs (Explore, Hotlist, Chat, My Account)
- **Visual Compatibility Breakdown:** Detailed view shows individual astrology system results (✓ Western Compatible, ✓ Chinese Compatible, ✗ Vedic Incompatible)
- **Conditional CTA:** "Send Intro Message" button appears prominently only when compatibility score ≥ 2

### Core Screens and Views

1. **Onboarding/Welcome Screen** - Gender preference selection ("I am a [M/F] looking for a [M/F]"), login/signup entry point
2. **Authentication Screens** - Email/password signup, login, email verification prompt
3. **Profile Creation/Edit Screen** - Multi-step form for personal info, bio, photo upload with progress indicator
4. **Explore/Browse Screen** - Tinder-style full-screen swipeable cards with compatibility badges, infinite profile loading
5. **Profile Detail View** - Full-screen profile with photo carousel, all astrological signs, compatibility score breakdown, bio, "Send Intro Message" CTA
6. **My Account Screen** - User's own astrological profile, compatibility insights, "highly compatible with" list, link to edit profile
7. **Hotlist Screen** - Saved/bookmarked profiles in two-column grid format
8. **Chat List Screen** - List of active conversations with message previews and unread badges
9. **Chat Detail Screen** - One-on-one text messaging interface with message history and polling-based delivery
10. **Settings/Profile Management** - Account settings, logout, delete account (basic)

### Accessibility

**WCAG AA Compliance (Target for Phase 2)** - MVP will focus on foundational accessibility:
- Sufficient color contrast for text and interactive elements (4.5:1 minimum)
- Touch targets minimum 44x44 pixels for all tappable elements
- Screen reader support for core navigation and profile information
- Alternative text for profile photos (user-provided or auto-generated)
- Form labels and error messaging clearly associated with inputs

**Note:** Full WCAG AA audit and remediation planned for Phase 2; MVP establishes good foundation but may have gaps.

### Branding

**Visual Style:**
- **Color Palette:** Deep cosmic blues and purples as primary colors (evoking night sky/astrology), warm gold/amber for accents (stars, compatibility highlights), neutral grays for text and backgrounds
- **Typography:** Modern sans-serif for readability (Inter, SF Pro, or Roboto), slightly larger font sizes for accessibility in target markets
- **Iconography:** Custom astrological sign icons for each zodiac system, consistent icon style throughout (likely outlined/line-based for modern feel)
- **Photography Style:** User-generated photos take center stage; UI elements should complement without competing
- **Mood:** Sophisticated yet approachable—not overly mystical or "fortune teller" aesthetic; think modern astrology app meets premium dating experience

**Note:** Brand identity suggested based on astrology concept; requires validation with founder/stakeholders.

### Target Device and Platforms

**Mobile Only - Android First (Cross-platform codebase)**

- **Primary Target:** Android smartphones (API level 26+, ~85% market coverage in Philippines/Thailand)
- **Device Range:** Mid-range to flagship devices (minimum 2GB RAM, 720p display)
- **Screen Sizes:** Optimized for 5.5" - 6.7" displays (most common in target markets)
- **Orientation:** Portrait mode only (standard for dating apps)
- **Phase 2:** iOS deployment using same React Native codebase with platform-specific adaptations

**Technical Implementation:** React Native with Expo enables cross-platform code sharing while delivering native performance. UI components will use React Native Paper or NativeBase for consistent, accessible design system out-of-the-box.

---

## Technical Assumptions

### Repository Structure: Monorepo

**Decision:** Single Git repository with `/backend` and `/mobile` directories.

**Rationale:** Simplifies version control and deployment coordination between API and mobile app; shared documentation, configuration, and tooling (ESLint, Prettier); easier to maintain consistency across full stack during rapid MVP development; common for MERN stack projects with single development team.

**Structure:**
```
AstroDating/
├── backend/          # Express.js API
│   ├── src/
│   ├── config/       # Compatibility matrices, env config
│   ├── models/       # Mongoose schemas
│   ├── services/     # Astrology service, auth, email
│   ├── controllers/  # Route handlers
│   ├── middleware/   # Auth, rate limiting
│   ├── jobs/         # Batch jobs (compatibility calculation)
│   └── package.json
├── mobile/           # React Native (Expo)
│   ├── src/
│   ├── screens/
│   ├── components/
│   ├── navigation/
│   └── package.json
├── docs/             # Shared documentation
└── README.md
```

### Service Architecture: Monolith API + Mobile Client

**Decision:** Single Express.js monolithic API server; React Native mobile app as separate client.

**Rationale:** MVP scope doesn't justify microservices complexity or overhead; monolith is faster to develop, deploy, and debug for small team; astrology service module is isolated within monolith (can be extracted later if needed); stateless RESTful API design allows horizontal scaling if needed; Cloudinary handles image storage (offloaded from API); database (MongoDB Atlas) is managed cloud service.

**Key Services/Modules:**
- **Authentication Service:** JWT generation, password hashing (bcryptjs), email verification
- **Astrology Service:** Sign derivation, compatibility calculation (isolated, testable module)
- **User Service:** Profile CRUD, browse queries, hotlist management
- **Chat Service:** Basic message storage and retrieval (polling-based for MVP, no WebSockets)
- **Email Service:** Transactional emails via Nodemailer or SendGrid

### Testing Requirements: Unit + Integration + Manual Testing

**Decision:** Focused testing strategy balancing quality with MVP speed constraints.

**Testing Layers:**

1. **Unit Tests (Required):**
   - **Astrology Service:** 100% coverage on sign derivation and compatibility calculation (core business logic)
   - **Authentication:** Password hashing, JWT generation/verification
   - **Utility Functions:** Date parsing, validation helpers
   - **Framework:** Jest (Node.js standard)

2. **Integration Tests (Selective):**
   - **API Endpoints:** Critical user flows (signup, login, browse, chat initiation)
   - **Database Operations:** User model CRUD, compatibility queries
   - **Framework:** Jest + Supertest for API testing

3. **Manual Testing (Required):**
   - **Mobile App:** Full user journey testing on physical Android devices (target market devices preferred)
   - **Email Flow:** Verification email delivery and link functionality
   - **Image Upload:** Cloudinary integration, file size limits, error handling
   - **Cross-Device:** Test on minimum spec device (2GB RAM, Android 8.0) and flagship device

4. **E2E Testing (Deferred to Phase 2):**
   - Automated mobile UI testing (Detox or Appium) deferred due to setup complexity
   - Manual testing covers user flows for MVP

**Testing Convenience:**
- Seed script to populate database with test users and varied compatibility scores
- Postman/Insomnia collection for API endpoint testing
- Expo Go for rapid mobile testing without full builds

### Additional Technical Assumptions and Requests

**Backend:**
- **Language/Runtime:** Node.js v18 LTS (current long-term support)
- **Framework:** Express.js v4.x (industry standard, mature ecosystem)
- **Database:** MongoDB v6.x with Mongoose ODM v7.x
- **Authentication:** JWT via `jsonwebtoken` library, bcryptjs for password hashing (12 salt rounds)
- **Email Service:** Nodemailer with Gmail SMTP for MVP (free); migrate to SendGrid if volume increases
- **Image Storage:** Cloudinary free tier (25 GB storage, 25 GB bandwidth/month)
- **CORS:** Configured to allow requests from mobile app domain only
- **Rate Limiting:** `express-rate-limit` on auth endpoints (5 attempts per 15 min per IP)

**Frontend (Mobile):**
- **Framework:** React Native v0.72+ with Expo SDK v49+ (managed workflow)
- **Navigation:** React Navigation v6
- **State Management:** React Context API for MVP (authentication state, user profile); consider Redux Toolkit if complexity grows
- **Forms:** React Hook Form for performance and validation
- **Image Handling:** 
  - `expo-image-picker` for selecting photos
  - `expo-image-manipulator` for client-side compression (<10MB enforcement)
- **HTTP Client:** Axios for API requests with interceptors for JWT token injection
- **Swipe Cards:** `react-native-deck-swiper` or `react-native-gesture-handler` for Tinder-style UI
- **UI Components:** React Native Paper (Material Design) or NativeBase for consistent design system

**Astrology Logic:**
- **Sign Derivation Libraries:** 
  - Research `zodiac-signs` npm package for Western zodiac
  - Custom lookup table for Chinese zodiac (year-based, straightforward)
  - Simplified Vedic (Rasi) calculation (date-based only for MVP; no birth time/location)
- **Compatibility Matrices:** Static JavaScript objects in `backend/config/compatibilityMatrix.js`
  - **CRITICAL:** Requires expert validation before implementation (must consult astrologer)
  - Matrices define binary compatibility (1=compatible, 0=not) for all sign combinations

**Infrastructure:**
- **Backend Hosting:** Railway.app or Render.com free tier (automatic deployments from Git)
- **Database:** MongoDB Atlas M0 free tier (512MB storage, shared cluster)
- **Environment Variables:** `.env` files (local), platform environment config (production)
- **Version Control:** Git with GitHub (main branch protected, feature branch workflow)
- **CI/CD:** Basic automated deployment on push to main (Railway/Render built-in)

**Development Tools:**
- **Code Quality:** ESLint + Prettier (shared config across backend/mobile)
- **Package Manager:** npm (consistent across backend and mobile)
- **Node Version Management:** nvm (ensure all developers use Node v18)
- **API Documentation:** Postman collection or Swagger/OpenAPI (Phase 2 consideration)

**Security:**
- All API communication over HTTPS (TLS 1.3)
- JWT tokens stored in React Native secure storage (not AsyncStorage)
- Password policy enforced: minimum 8 characters, must include letter and number
- Cloudinary signed upload presets to prevent unauthorized uploads
- Input validation on all API endpoints (express-validator)
- MongoDB connection string stored securely in environment variables

**Performance:**
- **Pre-Calculated Compatibility Scores:** Nightly batch job (cron task) calculates and caches compatibility scores for all user pairs in database, storing in `UserCompatibility` collection
- Pagination for Explore screen (20 profiles per page)
- Database indexes on: `(gender, seeking, is_profile_complete)`, `email` (unique), `(conversationId, createdAt)`, `(recipientId, isRead)`
- Cloudinary automatic image optimization (format, quality)
- API response caching considered for Phase 2 (Redis)

**Chat Implementation (Future-Proofing):**
- **MVP:** Polling-based chat (API checks for new messages every 10 seconds, adaptive intervals)
- **Architecture:** Message data model and API endpoints designed to support WebSocket upgrade
- **Phase 2:** Migrate to Socket.io for real-time messaging without breaking changes

**Moderation:**
- No admin panel required for MVP
- Manual database queries via MongoDB Compass or CLI for rare moderation needs
- Basic user reporting mechanism (flag profile button) stores reports in database for manual review

**Monitoring & Logging (Basic):**
- **Backend:** `winston` or `pino` for structured logging to file
- **Mobile:** Expo built-in error reporting (Sentry integration in Phase 2)
- **Analytics:** Basic usage tracking with Expo Analytics; upgrade to Mixpanel/Amplitude in Phase 2

---

## Epic List

**Epic 1: Foundation & Authentication Infrastructure**  
Establish project setup, authentication, and basic user management. Delivers: Working API + database + user signup/login flow.

**Epic 2: User Profile & Astrology Engine**  
Implement complete user profile creation, astrology sign derivation service, and compatibility matrix configuration. Delivers: Users can create complete profiles; system calculates astrological signs automatically.

**Epic 3: Compatibility Calculation & Browse Discovery**  
Build the core 2-of-3 matching engine, pre-calculation batch job, and Explore screen with Tinder-style swipe cards. Delivers: Users can browse and discover compatible matches.

**Epic 4: Hotlist, Account Management & Profile Details**  
Implement hotlist functionality, My Account screen, and detailed profile view with conditional chat initiation. Delivers: Users can curate matches and view detailed compatibility insights.

**Epic 5: Basic Chat Messaging (Polling-Based)**  
Enable text messaging between matched users with polling-based delivery. Delivers: Matched users can communicate via text chat.

**Epic 6: Polish, Testing & Production Launch**  
Comprehensive testing, performance optimization, Android APK build, deployment, and soft launch. Delivers: Production-ready Android application.

---

*(Epic details with full story breakdowns would follow here in the complete PRD - see previous messages for Epic 1-6 detailed stories)*

---

## Next Steps

### Architect Prompt

> **"Hello! I'm ready to design the technical architecture for AstroDating based on this PRD. I'll create a comprehensive architecture document covering the system design, data models, API specifications, and deployment strategy. The architecture will focus on the monorepo MERN stack structure with React Native/Expo, ensuring the astrology service is properly isolated and the compatibility calculation is optimized with pre-calculated scores. I'll pay special attention to the polling-based chat architecture that can be upgraded to WebSockets in Phase 2. Let's begin with the architecture design."**

---

**Document Status:** ✅ Draft Complete - Ready for Review  
**Next Review Date:** [To be scheduled]  
**Owner:** Business Analyst / Product Manager  
**Approvers:** Technical Lead, UX Designer, Product Owner

