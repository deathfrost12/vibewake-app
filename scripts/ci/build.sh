#!/bin/bash

# 🚀 Repetito Manual Build Script
# Template pro production builds

set -e

echo "🚀 Starting Repetito Build Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    print_step "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v npx &> /dev/null; then
        print_error "npx is not installed"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Install dependencies
install_dependencies() {
    print_step "Installing dependencies..."
    npm ci
    print_success "Dependencies installed"
}

# Run linting
run_lint() {
    print_step "Running ESLint..."
    if npm run lint; then
        print_success "Linting passed"
    else
        print_error "Linting failed"
        exit 1
    fi
}

# Run TypeScript check
run_typecheck() {
    print_step "Running TypeScript check..."
    if npx tsc --noEmit; then
        print_success "TypeScript check passed"
    else
        print_error "TypeScript check failed"
        exit 1
    fi
}

# Check environment variables
check_env() {
    print_step "Checking environment variables..."
    
    # Check for .env file first (standard), then .env.local (override)
    if [ -f ".env" ]; then
        source .env 2>/dev/null || true
    elif [ -f ".env.local" ]; then
        source .env.local 2>/dev/null || true
    elif [ -f "env.example" ]; then
        print_warning "No .env file found - you may want to copy from env.example"
    fi
    
    if [ -z "$EXPO_PUBLIC_SENTRY_DSN" ]; then
        print_warning "EXPO_PUBLIC_SENTRY_DSN not set"
    fi
    
    if [ -z "$EXPO_PUBLIC_POSTHOG_API_KEY" ]; then
        print_warning "EXPO_PUBLIC_POSTHOG_API_KEY not set"
    fi
    
    print_success "Environment check completed"
}

# Build for production
build_production() {
    local platform=$1
    print_step "Building for $platform..."
    
    case $platform in
        "ios")
            print_step "Building iOS development build..."
            if npx eas build --platform ios --profile development; then
                print_success "iOS build completed"
            else
                print_error "iOS build failed"
                exit 1
            fi
            ;;
        "android")
            print_step "Building Android development build..."
            if npx eas build --platform android --profile development; then
                print_success "Android build completed"
            else
                print_error "Android build failed"
                exit 1
            fi
            ;;
        "both")
            print_step "Building for both platforms..."
            if npx eas build --platform all --profile development; then
                print_success "Multi-platform build completed"
            else
                print_error "Multi-platform build failed"
                exit 1
            fi
            ;;
        *)
            print_error "Invalid platform: $platform. Use 'ios', 'android', or 'both'"
            exit 1
            ;;
    esac
}

# Preview build
build_preview() {
    local platform=$1
    print_step "Building preview for $platform..."
    
    case $platform in
        "ios")
            npx eas build --platform ios --profile preview
            ;;
        "android")
            npx eas build --platform android --profile preview
            ;;
        "both")
            npx eas build --platform all --profile preview
            ;;
    esac
}

# Production build
build_release() {
    local platform=$1
    print_step "Building production release for $platform..."
    
    case $platform in
        "ios")
            npx eas build --platform ios --profile production
            ;;
        "android")
            npx eas build --platform android --profile production
            ;;
        "both")
            npx eas build --platform all --profile production
            ;;
    esac
}

# Main execution
main() {
    local command=$1
    local platform=$2
    
    echo "🎯 Repetito Template Build System"
    echo "=================================="
    
    # Always run basic checks
    check_dependencies
    check_env
    install_dependencies
    
    case $command in
        "check")
            print_step "Running quality checks..."
            run_lint
            run_typecheck
            print_success "All checks passed! ✨"
            ;;
        "development"|"dev")
            if [ -z "$platform" ]; then
                platform="both"
            fi
            build_production $platform
            ;;
        "preview")
            if [ -z "$platform" ]; then
                platform="both"
            fi
            build_preview $platform
            ;;
        "production"|"release")
            if [ -z "$platform" ]; then
                platform="both"
            fi
            build_release $platform
            ;;
        *)
            echo "Usage: $0 {check|development|preview|production} [ios|android|both]"
            echo ""
            echo "Commands:"
            echo "  check       - Run linting and TypeScript checks"
            echo "  development - Build development version"
            echo "  preview     - Build preview version"
            echo "  production  - Build production version"
            echo ""
            echo "Platforms:"
            echo "  ios         - Build for iOS only"
            echo "  android     - Build for Android only"
            echo "  both        - Build for both platforms (default)"
            echo ""
            echo "Examples:"
            echo "  $0 check"
            echo "  $0 development ios"
            echo "  $0 production both"
            exit 1
            ;;
    esac
}

# Execute main function with all arguments
main "$@"
