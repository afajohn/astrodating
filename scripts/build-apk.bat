@echo off
REM AstroDating APK Building Script for Windows
REM This script helps you build an APK for testing

echo 🚀 AstroDating APK Building Script
echo ==================================

REM Check if EAS CLI is installed
where eas >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ EAS CLI not found. Installing...
    npm install -g @expo/eas-cli
)

REM Check if user is logged in
eas whoami >nul 2>nul
if %errorlevel% neq 0 (
    echo 🔐 Please login to Expo:
    eas login
)

echo 📱 Choose build method:
echo 1. EAS Build (Recommended - Cloud build)
echo 2. Local Build (Requires Android Studio)
echo 3. Expo Go (Quick testing)

set /p choice="Enter choice (1-3): "

if "%choice%"=="1" (
    echo 🏗️ Building with EAS...
    echo This will create a production-ready APK in the cloud.
    echo You'll get a download link when complete.
    
    REM Configure EAS if not already done
    if not exist "eas.json" (
        echo ⚙️ Configuring EAS build...
        eas build:configure
    )
    
    REM Build APK
    echo 🚀 Starting build process...
    eas build --platform android --profile preview
    
    echo ✅ Build started! Check your Expo dashboard for progress.
    echo 📱 You'll receive an email when the APK is ready for download.
    
) else if "%choice%"=="2" (
    echo 🏗️ Building locally...
    echo Make sure you have Android Studio installed and device connected.
    
    REM Check if Android device is connected
    adb devices | findstr "device" >nul
    if %errorlevel% neq 0 (
        echo ⚠️ No Android device detected.
        echo Please connect your device via USB and enable USB debugging.
        pause
        exit /b 1
    )
    
    echo 🚀 Building and installing APK...
    npx expo run:android
    
    echo ✅ APK built and installed on your device!
    
) else if "%choice%"=="3" (
    echo 📱 Starting Expo Go development server...
    echo 1. Install Expo Go from Google Play Store
    echo 2. Scan the QR code that appears
    echo 3. Your app will load instantly!
    
    npm start
    
) else (
    echo ❌ Invalid choice. Please run the script again.
    pause
    exit /b 1
)

echo.
echo 🎉 Done! Check the output above for next steps.
echo.
echo 📚 For more help, see: docs/APK_BUILDING_GUIDE.md
pause
