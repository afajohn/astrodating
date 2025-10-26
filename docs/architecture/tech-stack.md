# AstroDating Technology Stack

**Version:** 1.0  
**Date:** October 22, 2025  
**Source:** Extracted from Architecture Document  

---

## Overview

This is the **DEFINITIVE technology selection** for the entire AstroDating project. All development must use these exact versions. This document serves as the single source of truth for technology choices.

---

## Complete Technology Stack

| Category | Technology | Version | Purpose | Rationale |
|----------|-----------|---------|---------|-----------|
| **Frontend Language** | TypeScript | 5.0+ | Type-safe mobile development | Catch errors at compile-time, excellent IDE support, shared types with backend |
| **Frontend Framework** | React Native | 0.72+ | Cross-platform mobile UI | Industry-standard for mobile apps, enables future iOS deployment, large ecosystem |
| **Mobile Platform** | Expo SDK | 49+ (managed workflow) | React Native development platform | Simplifies native module management, OTA updates, EAS build service for APKs |
| **UI Component Library** | React Native Paper | 5.x | Material Design components | Pre-built accessible components, consistent design system, well-maintained |
| **State Management** | React Context API | Built-in | Global state (auth, user profile) | Sufficient for MVP's limited global state, zero dependencies, upgrade to Redux Toolkit if needed |
| **Navigation** | React Navigation | 6.x | Screen navigation and routing | De facto standard for React Native, type-safe, bottom tabs + stack navigation |
| **Backend Language** | JavaScript (Node.js) | 18 LTS | Server-side runtime | Long-term support, mature ecosystem, same language as mobile for code sharing |
| **Backend Framework** | Express.js | 4.18.x | REST API server | Industry standard, minimal, flexible, huge middleware ecosystem |
| **API Style** | REST | N/A | HTTP JSON API | Simple, well-understood, excellent mobile client support, stateless |
| **Database** | MongoDB | 6.x | Document database | Schema flexibility for evolving user profiles, excellent JSON compatibility, free tier available |
| **ORM/ODM** | Mongoose | 7.x | MongoDB object modeling | Schema validation, middleware hooks, relationship management, query builder |
| **Cache** | None (MVP) | N/A | Phase 2: Redis | Pre-calculated compatibility eliminates cache need for MVP; Redis planned for Phase 2 API caching |
| **File Storage** | Cloudinary | Latest SDK | Image hosting and CDN | Free tier (25GB), automatic optimization, transformation API, global CDN |
| **Authentication** | JWT + bcryptjs | jsonwebtoken 9.x, bcryptjs 2.x | Token-based auth | Stateless, mobile-friendly, bcryptjs for password hashing (12 salt rounds) |
| **Frontend Testing** | Jest + React Native Testing Library | Jest 29.x, RNTL 12.x | Mobile component tests | React Native standard, component isolation, user-centric queries |
| **Backend Testing** | Jest + Supertest | Jest 29.x, Supertest 6.x | API integration tests | Node.js standard, HTTP assertions, easy mocking |
| **E2E Testing** | Manual (MVP) | N/A | Phase 2: Detox | Manual testing on physical devices for MVP; Detox automation in Phase 2 |
| **Linting** | ESLint | 8.x | Code quality | Catch errors, enforce standards, shared config across backend/mobile |
| **Code Formatting** | Prettier | 3.x | Consistent formatting | Auto-format on save, shared config, zero debates on style |
| **Build Tool** | npm | 9.x (with workspaces) | Package management | Built-in workspaces for monorepo, no extra tooling needed |
| **Bundler** | Metro (Expo) | Built-in | React Native bundler | Expo's default, optimized for React Native, supports Hermes engine |
| **IaC Tool** | None (MVP) | N/A | Phase 2: Terraform | Railway dashboard configuration for MVP; IaC when multi-environment needed |
| **CI/CD** | Railway Auto-Deploy | Built-in | Continuous deployment | Deploy on git push to main, zero config, preview deployments |
| **Monitoring** | Railway Logs | Built-in | Phase 2: Sentry | Railway's built-in logging for MVP; Sentry for error tracking in Phase 2 |
| **Logging** | Winston | 3.x | Structured backend logging | JSON logs, multiple transports, log levels, request context |
| **HTTP Client** | Axios | 1.x | Mobile API communication | Interceptors for JWT injection, request/response transformation, error handling |
| **Form Management** | React Hook Form | 7.x | Mobile form validation | Performance (uncontrolled components), validation, error handling |
| **Date Handling** | date-fns | 2.x | Date calculations and formatting | Lightweight, tree-shakeable, better than Moment.js for bundle size |
| **Environment Variables** | dotenv | 16.x | Configuration management | Load .env files, separate dev/prod configs |
| **Email Service** | Nodemailer | 6.x | Transactional emails | SMTP client, Gmail integration, template support |
| **Input Validation** | express-validator | 7.x | API input validation | Express middleware, sanitization, error formatting |
| **Rate Limiting** | express-rate-limit | 6.x | API rate limiting | Prevent brute force, configurable windows, Redis-ready |
| **CORS** | cors | 2.x | Cross-origin requests | Express middleware, mobile app domain whitelisting |
| **Image Handling** | expo-image-picker, expo-image-manipulator | Expo SDK | Mobile photo selection and compression | Native image picker, client-side resize/compress before upload |
| **Swipe Cards** | react-native-deck-swiper | 2.x | Tinder-style UI | Gesture-based card stack, customizable animations |
| **Batch Jobs** | node-cron | 3.x | Scheduled tasks | Nightly compatibility calculation, daily reset logic |
| **Password Hashing** | bcryptjs | 2.x | Secure password storage | 12 salt rounds, async hashing, pure JS (no native dependencies) |

---

## Infrastructure Stack

| Service | Platform | Tier | Purpose |
|---------|----------|------|---------|
| **API Hosting** | Railway.app | Free → Paid | Express.js API deployment |
| **Database** | MongoDB Atlas | M0 Free → M10 Paid | Document database hosting |
| **Image Storage** | Cloudinary | Free → Paid | CDN and image transformations |
| **Email** | Gmail SMTP (MVP) | Free | Transactional emails |
| **Email (Upgrade)** | SendGrid | Free → Paid | Transactional emails at scale |
| **Mobile Build** | Expo EAS | Free builds | Android APK builds |
| **Version Control** | GitHub | Free | Code repository |
| **Monitoring** | Railway Logs | Free | Basic monitoring |
| **Monitoring (Upgrade)** | Sentry | Free → Paid | Error tracking and APM |

---

## Platform Details

### Railway.app

**Purpose:** Backend API hosting  
**Configuration:**
- Node.js 18 buildpack (automatic detection)
- Auto-deploy on git push to `main`
- Health check: `/api/health`
- Environment variables via dashboard or railway.json

**Free Tier Limits:**
- $5 usage credit per month
- ~500 hours compute time
- Shared resources

**Upgrade Path:**
- Starter: $5/month
- Pro: $20/month

---

### MongoDB Atlas

**Purpose:** Database hosting  
**Configuration:**
- M0 free tier cluster
- Region: Singapore or Mumbai (nearest to target market)
- Automatic daily backups
- IP whitelist: Railway + developer IPs

**Free Tier Limits:**
- 512MB storage
- Shared cluster resources
- No connection limit (recommend pooling)

**Upgrade Path:**
- M10 shared: $9/month (2GB storage, dedicated resources)
- M20 dedicated: $60/month (10GB storage, 2 vCPU)

---

### Cloudinary

**Purpose:** Image storage and CDN  
**Configuration:**
- Upload preset: `astrodating/profiles/`
- Transformations: `f_auto,q_auto,w_1920,h_1920,c_limit`
- Signed uploads for security

**Free Tier Limits:**
- 25GB storage
- 25GB bandwidth/month
- Unlimited transformations

**Upgrade Path:**
- Plus: $89/month (165GB storage/bandwidth)

---

### Expo EAS

**Purpose:** Mobile app build service  
**Configuration:**
- Build profiles: development, preview, production
- Platform: Android (MVP), iOS (Phase 2)
- Build type: APK (MVP), AAB for Play Store (Phase 2)

**Free Tier:**
- 30 builds/month (shared across all apps)
- Priority builds for paid plans

---

## Development Tools

### Required Software

- **Node.js:** v18 LTS or higher
- **npm:** v9 or higher (comes with Node.js)
- **Git:** Latest stable version
- **MongoDB Compass:** Optional (database GUI)
- **Android Studio:** For Android emulator
- **Expo CLI:** Installed globally via npm
- **Code Editor:** VS Code recommended

### VS Code Extensions (Recommended)

- ESLint
- Prettier
- React Native Tools
- MongoDB for VS Code
- GitLens
- Thunder Client (API testing)

---

## Package Versions Reference

### Backend package.json

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.3",
    "dotenv": "^16.0.3",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "express-validator": "^7.0.1",
    "express-rate-limit": "^6.7.0",
    "cloudinary": "^1.36.0",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.1",
    "winston": "^3.8.2",
    "date-fns": "^2.30.0",
    "node-cron": "^3.0.2"
  },
  "devDependencies": {
    "nodemon": "^2.0.22",
    "jest": "^29.5.0",
    "supertest": "^6.3.3"
  }
}
```

### Mobile package.json

```json
{
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.72.3",
    "expo": "~49.0.0",
    "@react-navigation/native": "^6.1.6",
    "@react-navigation/stack": "^6.3.16",
    "@react-navigation/bottom-tabs": "^6.5.7",
    "react-native-paper": "^5.8.0",
    "axios": "^1.4.0",
    "expo-secure-store": "~12.3.1",
    "expo-image-picker": "~14.3.2",
    "expo-image-manipulator": "~11.3.0",
    "react-hook-form": "^7.43.9",
    "react-native-deck-swiper": "^2.0.14",
    "react-native-vector-icons": "^9.2.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@types/react": "~18.2.14",
    "typescript": "^5.1.3",
    "@testing-library/react-native": "^12.1.2",
    "jest": "^29.5.0"
  }
}
```

---

## Technology Decision Rationale

### Why TypeScript on Mobile but JavaScript on Backend?

**Decision:** TypeScript for mobile, JavaScript for backend

**Rationale:**
- Mobile benefits from type safety (complex UI state, navigation types)
- Backend uses JavaScript to avoid build step (faster development iteration)
- Shared types exported from backend as TypeScript for mobile consumption
- Mongoose provides runtime validation, reducing need for TypeScript on backend

---

### Why React Native Paper over NativeBase?

**Decision:** React Native Paper

**Rationale:**
- Better Material Design compliance
- More accessible out-of-the-box (WCAG AA foundation)
- Well-maintained by React Native community
- Smaller bundle size than NativeBase

---

### Why Context API over Redux?

**Decision:** React Context API for MVP, Redux Toolkit for Phase 2 if needed

**Rationale:**
- MVP has limited global state (auth user, profile completion status)
- Context API sufficient for 2-3 global values
- Zero dependencies, simpler mental model
- Redux adds complexity without benefit for MVP scope
- Clear upgrade path if state grows complex

---

### Why MongoDB over PostgreSQL?

**Decision:** MongoDB with Mongoose

**Rationale:**
- Document model fits evolving user profile schema (adding fields easier)
- JSON-native (perfect for JSON API responses)
- Compatibility scores are simple lookups, not complex joins (no SQL advantage)
- Free tier available (MongoDB Atlas M0)
- Mongoose ODM provides schema validation and middleware

---

### Why REST over GraphQL?

**Decision:** REST API

**Rationale:**
- Simpler to implement and debug
- Mobile clients have excellent REST support (Axios)
- No over-fetching problem (endpoints return exactly what mobile needs)
- OpenAPI tooling superior to GraphQL for documentation
- Stateless design easier with REST than GraphQL subscriptions

---

### Why Polling over WebSockets for Chat?

**Decision:** Polling for MVP, WebSocket for Phase 2

**Rationale:**
- Simpler to implement and deploy (no WebSocket server needed)
- Adequate for <1K users (manageable request volume)
- Free-tier hosting (Railway) handles HTTP better than persistent WebSocket connections
- Architecture designed for easy WebSocket migration (transport-agnostic message model)
- MVP validation first, then optimize

---

## Phase 2 Technology Additions

Technologies planned for Phase 2 (not in MVP):

- **Redis:** API response caching, session storage
- **Socket.io:** Real-time chat (migrate from polling)
- **Sentry:** Error tracking and performance monitoring
- **SendGrid:** Scalable transactional email (migrate from Gmail SMTP)
- **Detox:** Automated E2E testing for mobile
- **Terraform:** Infrastructure as Code
- **Firebase Cloud Messaging:** Push notifications
- **Mixpanel/Amplitude:** Advanced analytics
- **Stripe:** Payment processing for premium features

---

## Dependency Installation

### Initial Setup

```bash
# Install all dependencies (backend + mobile)
npm run install:all

# Or manually:
cd backend && npm install
cd ../mobile && npm install
```

### Adding New Dependencies

**Backend:**
```bash
cd backend
npm install <package-name>
# Update this document with new dependency
```

**Mobile:**
```bash
cd mobile
npm install <package-name>
# or for Expo SDK packages:
npx expo install <package-name>
# Update this document with new dependency
```

### Security Audits

```bash
# Check for vulnerabilities
npm audit

# Auto-fix if possible
npm audit fix

# Manual review for high/critical
npm audit --audit-level=high
```

---

## Version Management

### Node.js Version

**Required:** Node.js 18 LTS or higher

**Check version:**
```bash
node --version  # Should be >= 18.0.0
```

**Use nvm to manage versions:**
```bash
# Install Node 18
nvm install 18

# Use Node 18
nvm use 18

# Set as default
nvm alias default 18
```

### Package Version Updates

**Strategy:**
- **Patch updates:** Auto-update (npm update)
- **Minor updates:** Review changelog, update quarterly
- **Major updates:** Test thoroughly, update with caution

**Lock Files:**
- Commit `package-lock.json` to Git
- Never delete lock file (ensures consistent installs)
- Regenerate if corrupted: `rm package-lock.json && npm install`

---

## External Service Versions

### Cloudinary

**SDK Version:** Latest (no version pinning needed)  
**API Version:** v1.1 (stable)  
**Upgrade:** SDK updates via npm

### MongoDB Atlas

**Database Version:** MongoDB 6.x (managed by Atlas)  
**Upgrade:** Atlas handles version upgrades automatically

### Gmail SMTP

**Protocol:** SMTP (port 587, TLS)  
**API Version:** N/A (SMTP protocol)  
**Upgrade Path:** Migrate to SendGrid API in Phase 2

---

## Build Targets

### Mobile (Android)

- **Minimum SDK:** Android 8.0 (API Level 26)
- **Target SDK:** Latest stable (Android 13+)
- **Build Output:** APK (MVP), AAB (Play Store in Phase 2)
- **APK Size Limit:** < 50MB

### Backend

- **Runtime:** Node.js 18 LTS
- **Platform:** Linux x64 (Railway containers)
- **Build:** No build step (JavaScript runs directly)

---

## Environment-Specific Configurations

### Development

```bash
# Backend
NODE_ENV=development
API_URL=http://localhost:5000/api

# Mobile
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

### Staging

```bash
# Backend
NODE_ENV=staging
API_URL=https://astrodating-staging.up.railway.app/api

# Mobile
EXPO_PUBLIC_API_URL=https://astrodating-staging.up.railway.app/api
```

### Production

```bash
# Backend
NODE_ENV=production
API_URL=https://astrodating.up.railway.app/api

# Mobile
EXPO_PUBLIC_API_URL=https://astrodating.up.railway.app/api
```

---

## Compatibility Matrix

### React Native & Expo Compatibility

- React Native 0.72.x requires Expo SDK 49+
- Expo SDK 49 supports Node 18+
- TypeScript 5.0+ compatible with all above

### Backend Compatibility

- Express 4.18.x compatible with Node 18
- Mongoose 7.x requires Node 14+ (18 LTS recommended)
- All backend dependencies compatible with Node 18 LTS

---

## Known Issues & Workarounds

### React Native Deck Swiper

**Issue:** Gesture conflicts with React Navigation gestures  
**Workaround:** Disable swipe-back gesture on Explore screen

### Expo SecureStore

**Issue:** Not available in Expo Go (requires custom dev client)  
**Workaround:** Use AsyncStorage in development, SecureStore in production builds

### MongoDB Atlas M0

**Issue:** Shared cluster can have variable performance  
**Workaround:** Implement connection pooling (maxPoolSize: 10), retry logic

---

**Document Status:** ✅ Complete  
**Last Updated:** October 22, 2025  
**Owner:** Architect (Winston)

