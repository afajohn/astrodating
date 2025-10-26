#!/bin/bash

# AstroDating APK Building Script
# This script helps you build an APK for testing

echo "🚀 AstroDating APK Building Script"
echo "=================================="

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g @expo/eas-cli
fi

# Check if user is logged in
if ! eas whoami &> /dev/null; then
    echo "🔐 Please login to Expo:"
    eas login
fi

echo "📱 Choose build method:"
echo "1. EAS Build (Recommended - Cloud build)"
echo "2. Local Build (Requires Android Studio)"
echo "3. Expo Go (Quick testing)"

read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo "🏗️ Building with EAS..."
        echo "This will create a production-ready APK in the cloud."
        echo "You'll get a download link when complete."
        
        # Configure EAS if not already done
        if [ ! -f "eas.json" ]; then
            echo "⚙️ Configuring EAS build..."
            eas build:configure
        fi
        
        # Build APK
        echo "🚀 Starting build process..."
        eas build --platform android --profile preview
        
        echo "✅ Build started! Check your Expo dashboard for progress."
        echo "📱 You'll receive an email when the APK is ready for download."
        ;;
        
    2)
        echo "🏗️ Building locally..."
        echo "Make sure you have Android Studio installed and device connected."
        
        # Check if Android device is connected
        if ! adb devices | grep -q "device$"; then
            echo "⚠️ No Android device detected."
            echo "Please connect your device via USB and enable USB debugging."
            exit 1
        fi
        
        echo "🚀 Building and installing APK..."
        npx expo run:android
        
        echo "✅ APK built and installed on your device!"
        ;;
        
    3)
        echo "📱 Starting Expo Go development server..."
        echo "1. Install Expo Go from Google Play Store"
        echo "2. Scan the QR code that appears"
        echo "3. Your app will load instantly!"
        
        npm start
        ;;
        
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Done! Check the output above for next steps."
echo ""
echo "📚 For more help, see: docs/APK_BUILDING_GUIDE.md"
