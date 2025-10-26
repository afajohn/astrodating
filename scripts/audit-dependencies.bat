@echo off
REM AstroDating Dependency Management Script (Windows)
REM Purpose: Ensure version compatibility and prevent conflicts

echo 🔍 AstroDating Dependency Audit ^& Management
echo =============================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] package.json not found. Please run this script from the project root.
    exit /b 1
)

REM Check Node.js version
echo [INFO] Checking Node.js version...
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [SUCCESS] Node.js version: %NODE_VERSION% ✓

REM Check npm version
echo [INFO] Checking npm version...
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [SUCCESS] npm version: %NPM_VERSION% ✓

REM Check if Expo CLI is installed
echo [INFO] Checking Expo CLI...
expo --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Expo CLI not found. Installing...
    npm install -g @expo/cli@latest
)
for /f "tokens=*" %%i in ('expo --version') do set EXPO_VERSION=%%i
echo [SUCCESS] Expo CLI version: %EXPO_VERSION% ✓

REM Check if this is an Expo project
if not exist "app.json" if not exist "app.config.js" (
    echo [ERROR] This doesn't appear to be an Expo project. Missing app.json or app.config.js
    exit /b 1
)

REM Check for package-lock.json
if not exist "package-lock.json" (
    echo [WARNING] package-lock.json not found. This is required for version locking.
    echo [INFO] Generating package-lock.json...
    npm install
)

REM Check for security vulnerabilities
echo [INFO] Checking for security vulnerabilities...
npm audit --audit-level=high >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Security vulnerabilities found. Run 'npm audit' for details.
) else (
    echo [SUCCESS] No high-severity security vulnerabilities found ✓
)

REM Check for outdated packages
echo [INFO] Checking for outdated packages...
npm outdated >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Found outdated packages. Run 'npm outdated' for details.
) else (
    echo [SUCCESS] All packages are up to date ✓
)

REM Check Expo doctor
echo [INFO] Running Expo doctor...
expo doctor >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Expo doctor found issues. Run 'expo doctor' for details.
) else (
    echo [SUCCESS] Expo doctor: No issues found ✓
)

echo.
echo 📊 AUDIT SUMMARY
echo =================
echo [SUCCESS] Audit complete! Check the summary above for any required actions.
echo.
echo 🔧 RECOMMENDED ACTIONS:
echo 1. Always use: npx expo install ^<package^>
echo 2. Never use: npm install ^<package^> directly
echo 3. Commit package-lock.json to version control
echo 4. Run this script weekly to check compatibility

pause
