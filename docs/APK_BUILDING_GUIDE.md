# APK Building & Push Notifications Setup Guide

## 🚀 Building APK for Testing

### Method 1: EAS Build (Recommended for Production)

#### Prerequisites
```bash
# Install EAS CLI globally
npm install -g @expo/eas-cli

# Login to Expo account
eas login
```

#### Build Configuration
```bash
# Initialize EAS build configuration
eas build:configure

# This creates eas.json with build profiles
```

#### Build APK
```bash
# Build preview APK (for testing)
eas build --platform android --profile preview

# Build production APK (for release)
eas build --platform android --profile production
```

### Method 2: Expo Go (Quick Testing)

#### Setup
1. Install Expo Go from Google Play Store
2. Run development server:
   ```bash
   npm start
   ```
3. Scan QR code with Expo Go app
4. App loads instantly for testing

### Method 3: Local Development Build

#### Prerequisites
- Android Studio installed
- Android SDK configured
- Android emulator or device connected

#### Build
```bash
# Generate and install APK locally
npx expo run:android

# Or build APK only
npx expo build:android
```

## 🔔 Push Notifications Setup

### Current Status
- ✅ `expo-notifications` package installed
- ✅ `NotificationService` implemented
- ✅ Database schema ready (`user_push_tokens` table)
- ⚠️ Needs Expo project configuration

### Complete Setup Steps

#### 1. Create Expo Project
```bash
# If not already done, create Expo project
npx create-expo-app --template blank-typescript

# Or link existing project
npx expo login
npx expo init --template blank-typescript
```

#### 2. Configure Environment Variables
Create `.env` file:
```env
EXPO_PROJECT_ID=your-actual-expo-project-id
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### 3. Update app.json
```json
{
  "expo": {
    "name": "AstroDating",
    "slug": "astrodating-v2",
    "plugins": [
      "expo-secure-store",
      [
        "expo-notifications",
        {
          "icon": "./assets/images/notification-icon.png",
          "color": "#007AFF"
        }
      ]
    ],
    "notification": {
      "icon": "./assets/images/notification-icon.png",
      "color": "#007AFF"
    }
  }
}
```

#### 4. Test Push Notifications
```typescript
// In your app initialization
import { NotificationService } from './src/services/NotificationService';

// Request permissions and register for push notifications
const token = await NotificationService.registerForPushNotifications();
console.log('Push token:', token);
```

### Push Notification Features

#### Available Features
- ✅ Permission requests
- ✅ Local notifications
- ✅ Push token generation
- ✅ Notification scheduling
- ✅ Badge management

#### Integration Points
- **New Messages**: Notify when receiving messages
- **New Matches**: Notify when compatibility found
- **Profile Updates**: Notify about profile completion
- **Daily Horoscope**: Scheduled astrology notifications

## 📱 Testing on Device

### Using Expo Go (Easiest)
1. Install Expo Go from Play Store
2. Run `npm start`
3. Scan QR code
4. Test all features instantly

### Using Development Build
1. Build APK with EAS: `eas build --platform android --profile preview`
2. Download APK from Expo dashboard
3. Install on device
4. Test with real device features

### Using Local Build
1. Connect Android device via USB
2. Enable USB debugging
3. Run `npx expo run:android`
4. APK installs automatically

## 🔧 Troubleshooting

### Common Issues

#### APK Build Fails
```bash
# Clear cache and rebuild
npx expo install --fix
eas build --platform android --clear-cache
```

#### Push Notifications Not Working
1. Check Expo project ID in environment variables
2. Verify notification permissions granted
3. Test with Expo's push notification tool
4. Check device notification settings

#### App Crashes on Device
1. Check console logs: `npx expo logs`
2. Verify all dependencies installed
3. Test on emulator first
4. Check device compatibility

### Debug Commands
```bash
# View logs
npx expo logs

# Check dependencies
npx expo doctor

# Clear cache
npx expo start --clear

# Test Supabase connection
npm run test:supabase
```

## 📊 Performance Tips

### APK Optimization
- Use `--profile production` for smaller APK
- Enable ProGuard for code obfuscation
- Optimize images and assets
- Remove unused dependencies

### Push Notification Best Practices
- Request permissions at appropriate time
- Provide clear permission explanations
- Handle permission denials gracefully
- Test on multiple devices

## 🎯 Next Steps

1. **Build APK**: Use EAS Build for production-ready APK
2. **Test Push Notifications**: Implement notification triggers
3. **Device Testing**: Test on real Android device
4. **Performance Optimization**: Optimize APK size and performance
5. **Release Preparation**: Prepare for Google Play Store

## 📞 Support

- **Expo Documentation**: https://docs.expo.dev/
- **EAS Build Guide**: https://docs.expo.dev/build/introduction/
- **Push Notifications**: https://docs.expo.dev/push-notifications/overview/
- **Android Setup**: https://docs.expo.dev/workflow/android-studio/
