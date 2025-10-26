#!/bin/bash

# AstroDating Dependency Management Script
# Purpose: Ensure version compatibility and prevent conflicts

set -e  # Exit on any error

echo "🔍 AstroDating Dependency Audit & Management"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check Node.js version
print_status "Checking Node.js version..."
NODE_VERSION=$(node --version)
REQUIRED_NODE="v18.19.0"
if [[ "$NODE_VERSION" < "$REQUIRED_NODE" ]]; then
    print_error "Node.js version $NODE_VERSION is too old. Required: $REQUIRED_NODE or higher"
    exit 1
fi
print_success "Node.js version: $NODE_VERSION ✓"

# Check npm version
print_status "Checking npm version..."
NPM_VERSION=$(npm --version)
REQUIRED_NPM="9.0.0"
if [[ "$NPM_VERSION" < "$REQUIRED_NPM" ]]; then
    print_error "npm version $NPM_VERSION is too old. Required: $REQUIRED_NPM or higher"
    exit 1
fi
print_success "npm version: $NPM_VERSION ✓"

# Check if Expo CLI is installed
print_status "Checking Expo CLI..."
if ! command -v expo &> /dev/null; then
    print_warning "Expo CLI not found. Installing..."
    npm install -g @expo/cli@latest
fi
EXPO_VERSION=$(expo --version)
print_success "Expo CLI version: $EXPO_VERSION ✓"

# Check if this is an Expo project
if [ ! -f "app.json" ] && [ ! -f "app.config.js" ]; then
    print_error "This doesn't appear to be an Expo project. Missing app.json or app.config.js"
    exit 1
fi

# Read current Expo SDK version
if [ -f "app.json" ]; then
    EXPO_SDK=$(grep -o '"sdkVersion": "[^"]*"' app.json | cut -d'"' -f4)
elif [ -f "app.config.js" ]; then
    EXPO_SDK=$(grep -o "sdkVersion: '[^']*'" app.config.js | cut -d"'" -f2)
fi

print_status "Current Expo SDK: $EXPO_SDK"

# Define required versions based on Expo SDK
case $EXPO_SDK in
    "51.0.0")
        REQUIRED_SUPABASE="2.39.3"
        REQUIRED_RN="0.74.5"
        REQUIRED_REACT="18.2.0"
        ;;
    "50.0.0")
        REQUIRED_SUPABASE="2.38.5"
        REQUIRED_RN="0.73.6"
        REQUIRED_REACT="18.2.0"
        ;;
    *)
        print_warning "Expo SDK $EXPO_SDK not in compatibility matrix. Using latest stable versions."
        REQUIRED_SUPABASE="2.39.3"
        REQUIRED_RN="0.74.5"
        REQUIRED_REACT="18.2.0"
        ;;
esac

print_status "Required versions for Expo SDK $EXPO_SDK:"
echo "  - Supabase: $REQUIRED_SUPABASE"
echo "  - React Native: $REQUIRED_RN"
echo "  - React: $REQUIRED_REACT"

# Check current package versions
print_status "Checking current package versions..."

# Function to check package version
check_package_version() {
    local package_name=$1
    local required_version=$2
    
    if [ -f "package.json" ]; then
        local current_version=$(grep -o "\"$package_name\": \"[^\"]*\"" package.json | cut -d'"' -f4)
        if [ -n "$current_version" ]; then
            if [ "$current_version" = "$required_version" ]; then
                print_success "$package_name: $current_version ✓"
                return 0
            else
                print_warning "$package_name: $current_version (required: $required_version)"
                return 1
            fi
        else
            print_warning "$package_name: Not found in package.json"
            return 1
        fi
    fi
}

# Check critical packages
PACKAGES_TO_CHECK=(
    "@supabase/supabase-js:$REQUIRED_SUPABASE"
    "react-native:$REQUIRED_RN"
    "react:$REQUIRED_REACT"
    "@react-native-async-storage/async-storage:1.21.0"
    "@react-navigation/native:6.1.9"
    "react-native-paper:5.12.3"
    "expo-image-picker:15.0.7"
    "react-native-gesture-handler:2.14.0"
    "react-native-reanimated:3.6.2"
)

MISMATCHES=0
for package_info in "${PACKAGES_TO_CHECK[@]}"; do
    package_name=$(echo $package_info | cut -d':' -f1)
    required_version=$(echo $package_info | cut -d':' -f2)
    
    if ! check_package_version "$package_name" "$required_version"; then
        ((MISMATCHES++))
    fi
done

# Check for package-lock.json
if [ ! -f "package-lock.json" ]; then
    print_warning "package-lock.json not found. This is required for version locking."
    print_status "Generating package-lock.json..."
    npm install
fi

# Check for security vulnerabilities
print_status "Checking for security vulnerabilities..."
if npm audit --audit-level=high 2>/dev/null | grep -q "found [1-9][0-9]* vulnerabilities"; then
    print_warning "Security vulnerabilities found. Run 'npm audit' for details."
else
    print_success "No high-severity security vulnerabilities found ✓"
fi

# Check for outdated packages
print_status "Checking for outdated packages..."
OUTDATED=$(npm outdated 2>/dev/null | wc -l)
if [ "$OUTDATED" -gt 1 ]; then
    print_warning "Found $((OUTDATED-1)) outdated packages. Run 'npm outdated' for details."
else
    print_success "All packages are up to date ✓"
fi

# Summary
echo ""
echo "📊 AUDIT SUMMARY"
echo "================="

if [ $MISMATCHES -eq 0 ]; then
    print_success "All critical packages are at correct versions!"
else
    print_warning "Found $MISMATCHES package version mismatches."
    echo ""
    echo "🔧 RECOMMENDED ACTIONS:"
    echo "1. Update package.json with correct versions"
    echo "2. Run: npm install"
    echo "3. Commit package-lock.json to version control"
    echo ""
    echo "📋 CORRECT PACKAGE.JSON DEPENDENCIES:"
    echo "{"
    echo "  \"dependencies\": {"
    echo "    \"expo\": \"~$EXPO_SDK\","
    echo "    \"react\": \"$REQUIRED_REACT\","
    echo "    \"react-native\": \"$REQUIRED_RN\","
    echo "    \"@supabase/supabase-js\": \"$REQUIRED_SUPABASE\","
    echo "    \"@react-native-async-storage/async-storage\": \"1.21.0\","
    echo "    \"@react-navigation/native\": \"6.1.9\","
    echo "    \"react-native-paper\": \"5.12.3\","
    echo "    \"expo-image-picker\": \"15.0.7\","
    echo "    \"react-native-gesture-handler\": \"2.14.0\","
    echo "    \"react-native-reanimated\": \"3.6.2\""
    echo "  }"
    echo "}"
fi

# Check Expo doctor
print_status "Running Expo doctor..."
if expo doctor 2>/dev/null | grep -q "No issues found"; then
    print_success "Expo doctor: No issues found ✓"
else
    print_warning "Expo doctor found issues. Run 'expo doctor' for details."
fi

echo ""
print_status "Audit complete! Check the summary above for any required actions."
