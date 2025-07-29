#!/bin/bash

# 🚀 Repetito Manual Deployment Script
# Template pro OTA updates a store deployment

set -e

echo "🚀 Starting Repetito Deployment Process..."

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

# Check if EAS CLI is installed and authenticated
check_eas() {
    print_step "Checking EAS CLI..."
    
    if ! command -v eas &> /dev/null; then
        print_error "EAS CLI is not installed. Install with: npm install -g @expo/eas-cli"
        exit 1
    fi
    
    if ! eas whoami &> /dev/null; then
        print_error "Not logged in to EAS. Run: eas login"
        exit 1
    fi
    
    print_success "EAS CLI is ready"
}

# Publish OTA update
publish_update() {
    local branch=$1
    local message=$2
    
    if [ -z "$branch" ]; then
        branch="main"
    fi
    
    if [ -z "$message" ]; then
        message="Manual OTA update $(date '+%Y-%m-%d %H:%M')"
    fi
    
    print_step "Publishing OTA update to branch: $branch"
    print_step "Message: $message"
    
    if npx eas update --branch "$branch" --message "$message"; then
        print_success "OTA update published successfully"
    else
        print_error "OTA update failed"
        exit 1
    fi
}

# Submit to app stores
submit_to_stores() {
    local platform=$1
    
    print_step "Submitting to app stores for $platform..."
    
    case $platform in
        "ios")
            print_step "Submitting to App Store..."
            if npx eas submit --platform ios; then
                print_success "iOS submission completed"
            else
                print_error "iOS submission failed"
                exit 1
            fi
            ;;
        "android")
            print_step "Submitting to Google Play..."
            if npx eas submit --platform android; then
                print_success "Android submission completed"
            else
                print_error "Android submission failed"
                exit 1
            fi
            ;;
        "both")
            print_step "Submitting to both stores..."
            if npx eas submit --platform all; then
                print_success "Multi-platform submission completed"
            else
                print_error "Multi-platform submission failed"
                exit 1
            fi
            ;;
        *)
            print_error "Invalid platform: $platform. Use 'ios', 'android', or 'both'"
            exit 1
            ;;
    esac
}

# Create git tag for release
create_release_tag() {
    local version=$1
    
    if [ -z "$version" ]; then
        # Get version from package.json
        version=$(node -p "require('./package.json').version")
    fi
    
    local tag="v$version"
    print_step "Creating release tag: $tag"
    
    if git tag -a "$tag" -m "Release $version"; then
        print_success "Tag created: $tag"
        
        if git push origin "$tag"; then
            print_success "Tag pushed to remote"
        else
            print_warning "Failed to push tag to remote"
        fi
    else
        print_error "Failed to create tag"
        exit 1
    fi
}

# Check git status
check_git_status() {
    print_step "Checking git status..."
    
    if ! git diff-index --quiet HEAD --; then
        print_error "Working directory is not clean. Commit your changes first."
        exit 1
    fi
    
    print_success "Working directory is clean"
}

# Bump version
bump_version() {
    local type=$1
    
    if [ -z "$type" ]; then
        type="patch"
    fi
    
    print_step "Bumping version ($type)..."
    
    if npm version "$type" --no-git-tag-version; then
        local new_version=$(node -p "require('./package.json').version")
        print_success "Version bumped to $new_version"
        
        # Update app.json version
        if command -v jq &> /dev/null; then
            jq --arg version "$new_version" '.expo.version = $version' app.json > tmp.json && mv tmp.json app.json
            print_success "Updated app.json version"
        else
            print_warning "jq not found. Please update app.json version manually to $new_version"
        fi
        
        return 0
    else
        print_error "Version bump failed"
        exit 1
    fi
}

# Complete release process
complete_release() {
    local version_type=$1
    local platform=$2
    
    if [ -z "$version_type" ]; then
        version_type="patch"
    fi
    
    if [ -z "$platform" ]; then
        platform="both"
    fi
    
    print_step "Starting complete release process..."
    
    # Check prerequisites
    check_git_status
    check_eas
    
    # Bump version
    bump_version "$version_type"
    
    # Commit version bump
    local new_version=$(node -p "require('./package.json').version")
    git add package.json app.json
    git commit -m "chore: bump version to $new_version"
    
    # Create tag
    create_release_tag "$new_version"
    
    # Push changes
    git push origin main
    
    print_success "Release $new_version completed!"
    print_step "Next steps:"
    echo "  1. Build with: npm run build:production $platform"
    echo "  2. Submit with: npm run deploy:submit $platform"
}

# Main execution
main() {
    local command=$1
    shift
    
    echo "🚀 Repetito Template Deployment System"
    echo "======================================"
    
    check_eas
    
    case $command in
        "update"|"ota")
            local branch=$1
            local message=$2
            publish_update "$branch" "$message"
            ;;
        "submit")
            local platform=$1
            submit_to_stores "$platform"
            ;;
        "release")
            local version_type=$1
            local platform=$2
            complete_release "$version_type" "$platform"
            ;;
        "tag")
            local version=$1
            create_release_tag "$version"
            ;;
        "bump")
            local type=$1
            bump_version "$type"
            ;;
        *)
            echo "Usage: $0 {update|submit|release|tag|bump} [options]"
            echo ""
            echo "Commands:"
            echo "  update [branch] [message]    - Publish OTA update"
            echo "  submit [ios|android|both]    - Submit to app stores"
            echo "  release [patch|minor|major] [ios|android|both] - Complete release"
            echo "  tag [version]                - Create git tag"
            echo "  bump [patch|minor|major]     - Bump version"
            echo ""
            echo "Examples:"
            echo "  $0 update main 'Bug fixes'"
            echo "  $0 submit ios"
            echo "  $0 release minor both"
            exit 1
            ;;
    esac
}

# Execute main function with all arguments
main "$@"
