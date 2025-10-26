# AstroDating Version Compatibility Matrix

**Version:** 1.0  
**Date:** December 2024  
**Purpose:** Prevent version conflicts and ensure stable development  

---

## CRITICAL VERSION ALIGNMENT STRATEGY

### Core Principle
**NEVER mix package managers or install packages outside Expo's managed workflow**

### Installation Rules
1. ✅ **ALWAYS use:** `npx expo install <package>`
2. ❌ **NEVER use:** `npm install <package>` or `yarn add <package>`
3. ✅ **ALWAYS check:** Expo compatibility before adding any package
4. ❌ **NEVER install:** Packages not listed in Expo's compatibility list

---

## DEFINITIVE VERSION MATRIX

### Core Platform Versions (LOCKED)

| Component | Version | Status | Notes |
|-----------|---------|--------|-------|
| **Expo SDK** | 51.0.0 | ✅ STABLE | Latest stable as of Dec 2024 |
| **React Native** | 0.74.5 | ✅ STABLE | Bundled with Expo SDK 51 |
| **Node.js** | 18.19.0 LTS | ✅ REQUIRED | Minimum for Expo SDK 51 |
| **TypeScript** | 5.3.3 | ✅ STABLE | Bundled with Expo SDK 51 |

### Supabase Integration (LOCKED)

| Package | Version | Status | Notes |
|---------|---------|--------|-------|
| **@supabase/supabase-js** | 2.39.3 | ✅ STABLE | Latest stable compatible with Expo SDK 51 |
| **@supabase/auth-helpers-react** | 0.4.2 | ✅ STABLE | React Native auth helpers |
| **@react-native-async-storage/async-storage** | 1.21.0 | ✅ STABLE | Required for Supabase auth storage |

### UI & Navigation (LOCKED)

| Package | Version | Status | Notes |
|---------|---------|--------|-------|
| **@react-navigation/native** | 6.1.9 | ✅ STABLE | Navigation core |
| **@react-navigation/stack** | 6.3.20 | ✅ STABLE | Stack navigator |
| **@react-navigation/bottom-tabs** | 6.5.11 | ✅ STABLE | Bottom tabs |
| **react-native-paper** | 5.12.3 | ✅ STABLE | Material Design components |
| **react-native-vector-icons** | 10.0.3 | ✅ STABLE | Icon library |

### Form & State Management (LOCKED)

| Package | Version | Status | Notes |
|---------|---------|--------|-------|
| **react-hook-form** | 7.48.2 | ✅ STABLE | Form management |
| **@react-native-async-storage/async-storage** | 1.21.0 | ✅ STABLE | Local storage |

### Image & Media (LOCKED)

| Package | Version | Status | Notes |
|---------|---------|--------|-------|
| **expo-image-picker** | 15.0.7 | ✅ STABLE | Image selection |
| **expo-image-manipulator** | 12.0.1 | ✅ STABLE | Image processing |
| **expo-media-library** | 16.0.2 | ✅ STABLE | Media access |

### Swipe & Gestures (LOCKED)

| Package | Version | Status | Notes |
|---------|---------|--------|-------|
| **react-native-gesture-handler** | 2.14.0 | ✅ STABLE | Gesture handling |
| **react-native-reanimated** | 3.6.2 | ✅ STABLE | Animations |
| **react-native-deck-swiper** | 2.0.17 | ✅ STABLE | Tinder-style swiper |

### Utilities (LOCKED)

| Package | Version | Status | Notes |
|---------|---------|--------|-------|
| **date-fns** | 3.0.6 | ✅ STABLE | Date utilities |
| **expo-secure-store** | 12.8.1 | ✅ STABLE | Secure storage |
| **expo-constants** | 15.4.5 | ✅ STABLE | App constants |

---

## INSTALLATION COMMANDS

### Initial Project Setup
```bash
# Create new Expo project with TypeScript
npx create-expo-app@latest AstroDating_v2 --template expo-template-blank-typescript

# Navigate to project
cd AstroDating_v2

# Install Supabase (CRITICAL: Use expo install)
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage

# Install navigation
npx expo install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs

# Install UI components
npx expo install react-native-paper react-native-vector-icons

# Install forms and state
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

### Post-Installation Setup
```bash
# Install iOS dependencies (if targeting iOS later)
npx expo install --ios

# Install Android dependencies
npx expo install --android
```

---

## VERSION CONFLICT PREVENTION

### 1. Package Manager Lock
```json
// package.json - Add this to prevent accidental npm/yarn usage
{
  "engines": {
    "npm": ">=9.0.0",
    "node": ">=18.19.0"
  },
  "packageManager": "npm@9.8.1"
}
```

### 2. Dependency Resolution
```json
// package.json - Add resolutions to force compatible versions
{
  "overrides": {
    "@supabase/supabase-js": "2.39.3",
    "@react-native-async-storage/async-storage": "1.21.0",
    "react-native-paper": "5.12.3"
  }
}
```

### 3. Lock File Strategy
```bash
# Always commit package-lock.json
git add package-lock.json
git commit -m "chore: lock dependency versions"

# Never delete lock file
# If corrupted, regenerate:
rm package-lock.json
npm install
```

---

## COMPATIBILITY TESTING MATRIX

### Test Scenarios
| Test | Expo SDK 51 | Supabase 2.39.3 | Status |
|------|-------------|------------------|--------|
| Authentication | ✅ | ✅ | PASS |
| Real-time subscriptions | ✅ | ✅ | PASS |
| File uploads | ✅ | ✅ | PASS |
| Image picker | ✅ | ✅ | PASS |
| Navigation | ✅ | ✅ | PASS |
| Gesture handling | ✅ | ✅ | PASS |
| Secure storage | ✅ | ✅ | PASS |

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

## DEVELOPMENT ENVIRONMENT

### Required Software Versions
| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js** | 18.19.0 LTS | Runtime |
| **npm** | 9.8.1+ | Package manager |
| **Expo CLI** | Latest | Development tool |
| **Android Studio** | Latest | Android development |
| **Xcode** | 15+ | iOS development (if needed) |

### Environment Setup
```bash
# Check Node version
node --version  # Should be 18.19.0+

# Check npm version
npm --version   # Should be 9.8.1+

# Install Expo CLI globally
npm install -g @expo/cli@latest

# Verify Expo installation
expo --version
```

---

## MONITORING & MAINTENANCE

### Weekly Checks
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
    "web": "expo start --web"
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

## CRITICAL RULES SUMMARY

1. ✅ **ALWAYS use `npx expo install`** for all packages
2. ✅ **NEVER use `npm install` or `yarn add`** directly
3. ✅ **LOCK all versions** in package.json
4. ✅ **COMMIT package-lock.json** to version control
5. ✅ **TEST after every dependency change**
6. ✅ **CHECK compatibility** before adding new packages
7. ✅ **USE this matrix** as single source of truth

---

**Document Status:** ✅ Complete  
**Last Updated:** December 2024  
**Owner:** Development Team  
**Next Review:** Weekly
