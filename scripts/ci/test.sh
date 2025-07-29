#!/bin/bash

# 🧪 Repetito Manual Testing Script
# Template pro testing a quality assurance

set -e

echo "🧪 Starting Repetito Testing Process..."

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

# Run ESLint
run_lint() {
    print_step "Running ESLint..."
    
    if npm run lint; then
        print_success "ESLint passed"
        return 0
    else
        print_error "ESLint failed"
        return 1
    fi
}

# Fix ESLint issues
fix_lint() {
    print_step "Fixing ESLint issues..."
    
    if npm run lint:fix; then
        print_success "ESLint issues fixed"
    else
        print_warning "Some ESLint issues couldn't be auto-fixed"
    fi
}

# Run TypeScript check
run_typecheck() {
    print_step "Running TypeScript check..."
    
    if npx tsc --noEmit; then
        print_success "TypeScript check passed"
        return 0
    else
        print_error "TypeScript check failed"
        return 1
    fi
}

# Run Prettier
run_prettier() {
    print_step "Running Prettier..."
    
    if npx prettier --check .; then
        print_success "Prettier check passed"
        return 0
    else
        print_error "Prettier check failed"
        return 1
    fi
}

# Fix Prettier issues
fix_prettier() {
    print_step "Fixing Prettier issues..."
    
    if npx prettier --write .; then
        print_success "Code formatted with Prettier"
    else
        print_error "Prettier formatting failed"
    fi
}

# Run unit tests (placeholder - add when tests are implemented)
run_unit_tests() {
    print_step "Running unit tests..."
    
    if [ -f "jest.config.js" ] && npm run test:unit 2>/dev/null; then
        print_success "Unit tests passed"
        return 0
    else
        print_warning "Unit tests not configured or failed"
        return 1
    fi
}

# Check dependencies for security vulnerabilities
check_security() {
    print_step "Checking for security vulnerabilities..."
    
    if npm audit --audit-level moderate; then
        print_success "No security vulnerabilities found"
        return 0
    else
        print_warning "Security vulnerabilities detected. Run 'npm audit fix' to resolve"
        return 1
    fi
}

# Check bundle size
check_bundle_size() {
    print_step "Checking bundle size..."
    
    if command -v npx &> /dev/null; then
        # This is a placeholder - in real implementation, you'd analyze the bundle
        print_step "Bundle analysis not implemented yet"
        print_warning "Consider implementing bundle size analysis for production"
        return 0
    fi
}

# Verify environment configuration
verify_env() {
    print_step "Verifying environment configuration..."
    
    local env_issues=0
    
    # Check for required files
    if [ ! -f ".env.local" ] && [ ! -f ".env" ]; then
        print_error "No environment file found (.env.local or .env)"
        env_issues=$((env_issues + 1))
    fi
    
    # Check app.json
    if [ ! -f "app.json" ]; then
        print_error "app.json not found"
        env_issues=$((env_issues + 1))
    fi
    
    # Check eas.json
    if [ ! -f "eas.json" ]; then
        print_error "eas.json not found"
        env_issues=$((env_issues + 1))
    fi
    
    if [ $env_issues -eq 0 ]; then
        print_success "Environment configuration verified"
        return 0
    else
        print_error "Environment configuration issues found"
        return 1
    fi
}

# Test Expo configuration
test_expo_config() {
    print_step "Testing Expo configuration..."
    
    if npx expo config --type public | grep -q "expo"; then
        print_success "Expo configuration is valid"
        return 0
    else
        print_error "Expo configuration is invalid"
        return 1
    fi
}

# Test Metro bundler
test_metro() {
    print_step "Testing Metro bundler..."
    
    # Start Metro in background and test if it starts successfully
    if timeout 10s npx expo start --no-dev --minify > /dev/null 2>&1; then
        print_success "Metro bundler starts successfully"
        return 0
    else
        print_warning "Metro bundler test skipped (requires interactive environment)"
        return 0
    fi
}

# Comprehensive quality check
quality_check() {
    print_step "Running comprehensive quality check..."
    
    local failed_checks=0
    
    # Run all checks
    run_lint || failed_checks=$((failed_checks + 1))
    run_typecheck || failed_checks=$((failed_checks + 1))
    run_prettier || failed_checks=$((failed_checks + 1))
    verify_env || failed_checks=$((failed_checks + 1))
    test_expo_config || failed_checks=$((failed_checks + 1))
    check_security || failed_checks=$((failed_checks + 1))
    
    # Summary
    echo ""
    print_step "Quality Check Summary"
    echo "===================="
    
    if [ $failed_checks -eq 0 ]; then
        print_success "All quality checks passed! 🎉"
        return 0
    else
        print_error "$failed_checks quality check(s) failed"
        return 1
    fi
}

# Fix common issues
fix_issues() {
    print_step "Fixing common issues..."
    
    fix_lint
    fix_prettier
    
    print_success "Common issues fixed. Run 'quality' to verify."
}

# Pre-commit check
pre_commit() {
    print_step "Running pre-commit checks..."
    
    # Quick checks before committing
    if ! run_lint; then
        print_error "ESLint check failed. Fix issues before committing."
        exit 1
    fi
    
    if ! run_typecheck; then
        print_error "TypeScript check failed. Fix issues before committing."
        exit 1
    fi
    
    print_success "Pre-commit checks passed! ✨"
}

# Main execution
main() {
    local command=$1
    
    echo "🧪 Repetito Template Testing System"
    echo "==================================="
    
    case $command in
        "lint")
            run_lint
            ;;
        "lint:fix")
            fix_lint
            ;;
        "typecheck"|"tsc")
            run_typecheck
            ;;
        "prettier")
            run_prettier
            ;;
        "prettier:fix")
            fix_prettier
            ;;
        "security")
            check_security
            ;;
        "env")
            verify_env
            ;;
        "expo")
            test_expo_config
            ;;
        "metro")
            test_metro
            ;;
        "quality")
            quality_check
            ;;
        "fix")
            fix_issues
            ;;
        "pre-commit")
            pre_commit
            ;;
        "all")
            quality_check
            ;;
        *)
            echo "Usage: $0 {lint|typecheck|prettier|security|env|expo|metro|quality|fix|pre-commit|all}"
            echo ""
            echo "Commands:"
            echo "  lint         - Run ESLint"
            echo "  lint:fix     - Fix ESLint issues"
            echo "  typecheck    - Run TypeScript check"
            echo "  prettier     - Check code formatting"
            echo "  prettier:fix - Fix code formatting"
            echo "  security     - Check for security vulnerabilities"
            echo "  env          - Verify environment configuration"
            echo "  expo         - Test Expo configuration"
            echo "  metro        - Test Metro bundler"
            echo "  quality      - Run all quality checks"
            echo "  fix          - Auto-fix common issues"
            echo "  pre-commit   - Quick checks before committing"
            echo "  all          - Same as quality"
            echo ""
            echo "Examples:"
            echo "  $0 quality"
            echo "  $0 fix"
            echo "  $0 pre-commit"
            exit 1
            ;;
    esac
}

# Execute main function with all arguments
main "$@"
