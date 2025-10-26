# AstroDating Technology Stack (SUPABASE VERSION)

**Version:** 2.0  
**Date:** December 2024  
**Status:** Updated for Supabase Integration  

---

## CRITICAL VERSION ALIGNMENT RULES

### Installation Rules
1. ✅ **ALWAYS use:** `npx expo install <package>`
2. ❌ **NEVER use:** `npm install <package>` or `yarn add <package>`
3. ✅ **ALWAYS check:** Expo compatibility before adding any package
4. ❌ **NEVER install:** Packages not listed in Expo's compatibility list

### Version Locking Strategy
- All versions are LOCKED to prevent conflicts
- Use `package-lock.json` for exact version control
- Run `scripts/audit-dependencies.bat` weekly to check compatibility

---

## DEFINITIVE TECHNOLOGY STACK

### Core Platform (LOCKED)

| Component | Version | Purpose | Rationale |
|-----------|---------|---------|-----------|
| **Expo SDK** | 51.0.0 | React Native development platform | Latest stable, excellent Supabase compatibility |
| **React Native** | 0.74.5 | Cross-platform mobile UI | Bundled with Expo SDK 51, industry standard |
| **React** | 18.2.0 | UI framework | Bundled with Expo SDK 51, stable version |
| **TypeScript** | 5.3.3 | Type-safe development | Bundled with Expo SDK 51, excellent IDE support |
| **Node.js** | 18.19.0 LTS | Runtime environment | Required for Expo SDK 51, long-term support |

### Supabase Integration (LOCKED)

| Package | Version | Purpose | Rationale |
|---------|---------|---------|-----------|
| **@supabase/supabase-js** | 2.39.3 | Supabase client library | Latest stable, fully compatible with Expo SDK 51 |
| **@react-native-async-storage/async-storage** | 1.21.0 | Auth storage | Required for Supabase auth persistence |
| **@supabase/auth-helpers-react** | 0.4.2 | React auth helpers | Optional but recommended for auth flows |

### UI & Navigation (LOCKED)

| Package | Version | Purpose | Rationale |
|---------|---------|---------|-----------|
| **@react-navigation/native** | 6.1.9 | Navigation core | De facto standard, type-safe |
| **@react-navigation/stack** | 6.3.20 | Stack navigator | For modal and detail screens |
| **@react-navigation/bottom-tabs** | 6.5.11 | Bottom tabs | Main app navigation |
| **react-native-paper** | 5.12.3 | Material Design components | Pre-built accessible components |
| **react-native-vector-icons** | 10.0.3 | Icon library | Comprehensive icon set |

### Form & State Management (LOCKED)

| Package | Version | Purpose | Rationale |
|---------|---------|---------|-----------|
| **react-hook-form** | 7.48.2 | Form management | Performance, validation, error handling |
| **React Context API** | Built-in | Global state | Sufficient for MVP, zero dependencies |

### Image & Media (LOCKED)

| Package | Version | Purpose | Rationale |
|---------|---------|---------|-----------|
| **expo-image-picker** | 15.0.7 | Image selection | Native image picker |
| **expo-image-manipulator** | 12.0.1 | Image processing | Client-side resize/compress |
| **expo-media-library** | 16.0.2 | Media access | Access device photos |

### Swipe & Gestures (LOCKED)

| Package | Version | Purpose | Rationale |
|---------|---------|---------|-----------|
| **react-native-gesture-handler** | 2.14.0 | Gesture recognition | Required for swipe cards |
| **react-native-reanimated** | 3.6.2 | Smooth animations | High-performance animations |
| **react-native-deck-swiper** | 2.0.17 | Tinder-style UI | Gesture-based card stack |

### Utilities (LOCKED)

| Package | Version | Purpose | Rationale |
|---------|---------|---------|-----------|
| **date-fns** | 3.0.6 | Date utilities | Lightweight, tree-shakeable |
| **expo-secure-store** | 12.8.1 | Secure storage | Encrypted storage for tokens |
| **expo-constants** | 15.4.5 | App constants | App configuration and metadata |

---

## INFRASTRUCTURE STACK

### Supabase Services (All-in-One)

| Service | Purpose | Free Tier Limits |
|---------|---------|------------------|
| **PostgreSQL Database** | Data storage | 500MB storage |
| **Authentication** | User auth | Unlimited users |
| **Storage** | File uploads | 1GB storage |
| **Realtime** | Real-time features | Unlimited connections |
| **Edge Functions** | Serverless functions | 500K requests/month |

### Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **Expo CLI** | Latest | Development tool |
| **EAS CLI** | Latest | Build and deployment |
| **Android Studio** | Latest | Android development |
| **Xcode** | 15+ | iOS development (if needed) |

---

## PACKAGE.JSON TEMPLATE

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

---

## INSTALLATION COMMANDS

### Initial Setup
```bash
# Create new Expo project
npx create-expo-app@latest AstroDating_v2 --template expo-template-blank-typescript

# Navigate to project
cd AstroDating_v2

# Install Supabase (CRITICAL: Use expo install)
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage

# Install navigation
npx expo install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs

# Install UI components
npx expo install react-native-paper react-native-vector-icons

# Install forms
npx expo install react-hook-form

# Install image handling
npx expo install expo-image-picker expo-image-manipulator expo-media-library

# Install gestures and animations
npx expo install react-native-gesture-handler react-native-reanimated

# Install swipe components
npx expo install react-native-deck-swiper

# Install utilities
npx expo install date-fns expo-secure-store expo-constants
```

### Post-Installation
```bash
# Install platform-specific dependencies
npx expo install --ios
npx expo install --android

# Run dependency audit
scripts/audit-dependencies.bat
```

---

## COMPATIBILITY MATRIX

### Expo SDK 51 Compatibility

| Package | Compatible | Notes |
|---------|------------|-------|
| @supabase/supabase-js 2.39.3 | ✅ | Fully tested |
| React Navigation 6.1.9 | ✅ | Stable |
| React Native Paper 5.12.3 | ✅ | Material Design |
| React Hook Form 7.48.2 | ✅ | Performance optimized |
| Expo Image Picker 15.0.7 | ✅ | Native integration |
| React Native Gesture Handler 2.14.0 | ✅ | Required for swipe |
| React Native Reanimated 3.6.2 | ✅ | Smooth animations |

### Known Issues & Workarounds

#### Issue 1: WebSocket Transport
**Problem:** Some Supabase real-time features may have WebSocket issues  
**Solution:** Use AsyncStorage for auth storage, avoid Node.js specific WebSocket configs

#### Issue 2: Metro Bundler
**Problem:** `unstable_enablePackageExports` can cause Supabase issues  
**Solution:** Keep Metro config default, don't enable experimental features

#### Issue 3: React Native Reanimated
**Problem:** Gesture conflicts with navigation  
**Solution:** Configure gesture handler properly in App.tsx

---

## UPDATING STRATEGY

### Safe Update Process
1. **Check Expo SDK compatibility** first
2. **Update Expo SDK** if new stable version available
3. **Update Supabase** only if compatible with new Expo SDK
4. **Test thoroughly** after each update
5. **Lock versions** in package.json

### Update Commands
```bash
# Check for Expo updates
npx expo install --check

# Update Expo SDK (when new stable available)
npx expo install expo@latest

# Update Supabase (only if compatible)
npx expo install @supabase/supabase-js@latest

# Verify compatibility
npx expo doctor
```

---

## MONITORING & MAINTENANCE

### Weekly Checks
- [ ] Run `scripts/audit-dependencies.bat`
- [ ] Check Expo SDK updates
- [ ] Check Supabase client updates
- [ ] Run `npx expo doctor`
- [ ] Test core functionality

### Monthly Reviews
- [ ] Review dependency security advisories
- [ ] Update documentation if versions change
- [ ] Test on both Android and iOS (if applicable)

### Emergency Procedures
If version conflicts occur:
1. **Stop development immediately**
2. **Revert to last working package-lock.json**
3. **Check this compatibility matrix**
4. **Update only compatible packages**
5. **Test thoroughly before continuing**

---

## CRITICAL RULES SUMMARY

1. ✅ **ALWAYS use `npx expo install`** for all packages
2. ✅ **NEVER use `npm install` or `yarn add`** directly
3. ✅ **LOCK all versions** in package.json
4. ✅ **COMMIT package-lock.json** to version control
5. ✅ **TEST after every dependency change**
6. ✅ **CHECK compatibility** before adding new packages
7. ✅ **USE this matrix** as single source of truth
8. ✅ **RUN audit script weekly** to prevent conflicts

---

**Document Status:** ✅ Complete  
**Last Updated:** December 2024  
**Owner:** Development Team  
**Next Review:** Weekly
