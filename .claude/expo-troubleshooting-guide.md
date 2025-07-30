# Expo Troubleshooting Guide - Repetito Project

## 🎯 Quick Reference

This guide provides comprehensive solutions for common Expo React Native issues encountered in the Repetito educational app project. Updated for 2024/2025 with latest Expo SDK 53 and modern tooling.

---

## 🚨 Build Issues

### EAS Build "No Podfile found" Error

**Problem**: EAS Build fails with "No `Podfile' found in the project directory" even when Podfile exists.

**Root Cause**: EAS Build skips `expo prebuild` when iOS directory exists, but existing structure is incompatible.

**Solutions** (in order of preference):

#### 1. Cache Invalidation (Primary Solution ✅)

```json
// In eas.json - add/update cache key
{
  "build": {
    "development": {
      "ios": {
        "cache": {
          "key": "repetito-ios-cache-2025-01-16"
        }
      }
    }
  }
}
```

Then run:

```bash
eas build --platform ios --profile development --clear-cache
```

#### 2. Continuous Native Generation (Alternative)

If cache invalidation doesn't work, force prebuild regeneration:

```bash
# Add to .gitignore
/ios
/android

# Then build will automatically run prebuild
eas build --platform ios --profile development
```

#### 3. Local Prebuild Clean

```bash
npx expo prebuild --clean
git add . && git commit -m "fix: regenerate iOS project structure"
eas build --platform ios --profile development
```

---

## 🐛 Runtime Errors

### getCurrentRoute Navigation Error

**Problem**: `ERROR getCurrentRoute error [TypeError: navigation.getCurrentRoute is not a function]`

**Root Cause**: **PostHog React Native** automatically tracks navigation using `navigation.getCurrentRoute()` method from React Navigation, but **Expo Router** (file-based routing) doesn't have this method.

**Key Discovery**: The error was **NOT** in our code or Sentry integration - it was PostHog's automatic navigation tracking conflicting with Expo Router.

**Solution**: Disable PostHog automatic screen tracking and implement manual tracking:

#### 1. **Disable PostHog Auto Navigation Tracking**

```typescript
// app/_layout.tsx - Disable problematic auto tracking
<PostHogProvider
  apiKey={PostHogAPIKey}
  options={{
    host: PostHogHost,
    enableSessionReplay: false,
    captureAppLifecycleEvents: true,
    flushAt: __DEV__ ? 5 : 20,
    flushInterval: __DEV__ ? 3000 : 10000,
  }}
  autocapture={{
    captureScreens: false, // ✅ Eliminates getCurrentRoute calls
    captureTouches: true,  // ✅ Keeps touch events enabled
  }}
>
```

#### 2. **Implement Manual Screen Tracking**

```typescript
// lib/analytics.ts - Manual screen tracking for Expo Router
export const trackScreenView = (
  screenName: string,
  properties?: Record<string, any>
) => {
  if (!posthogInstance) return;

  try {
    posthogInstance.screen(screenName, {
      timestamp: new Date().toISOString(),
      locale: 'cs-CZ',
      ...properties,
    });
  } catch (error) {
    console.error('❌ Screen tracking failed:', error);
  }
};
```

#### 3. **Use Manual Tracking in Components**

```typescript
// In your screens/components
import { trackScreenView } from '@/lib/analytics';

useEffect(() => {
  trackScreenView('Dashboard', { user_type: 'student' });
}, []);
```

#### 4. **Why This Works**

- **PostHog auto-capture** was calling `navigation.getCurrentRoute()` from React Navigation
- **Expo Router** uses file-based routing without this method
- **Disabling auto-capture** eliminates the conflicting calls
- **Manual tracking** gives you more control over what gets tracked

### RevenueCat Offerings Error

**Problem**: `Error fetching offerings - None of the products registered in the RevenueCat dashboard could be fetched`

**Root Cause**: Development builds cannot access App Store Connect products.

**Solution**: Enhanced development fallback (already implemented):

```typescript
// stores/revenuecat-store.ts - Development Fallback
const createMockPackages = () => {
  console.log('⚠️ Development mode: Creating mock packages for testing');

  const mockPackages = [
    {
      identifier: 'repetito_premium_monthly_dev',
      packageType: 'MONTHLY',
      product: {
        identifier: 'repetito_premium_monthly',
        title: 'Repetito Premium (Měsíční) - DEV',
        price: 149,
        priceString: '149 Kč',
      },
    },
    {
      identifier: 'repetito_premium_annual_dev',
      packageType: 'ANNUAL',
      product: {
        identifier: 'repetito_premium_annual',
        title: 'Repetito Premium (Roční) - DEV',
        price: 1490,
        priceString: '1490 Kč',
      },
    },
  ];

  set({ packageCount: mockPackages.length });
  console.log('✅ Mock packages created for development testing');
};
```

---

## ⚙️ Configuration Fixes

### JSX Transform Warning

**Problem**: `Your app (or one of its dependencies) is using an outdated JSX transform`

**Current Config Issue**: Using deprecated syntax in babel.config.js

**Solution**: Update babel configuration:

```javascript
// babel.config.js - Correct Modern Setup
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          jsxRuntime: 'automatic', // Use this instead of react.runtime
          jsxImportSource: 'nativewind', // Keep for NativeWind
        },
      ],
      'nativewind/babel',
    ],
    plugins: [],
  };
};
```

After updating, clear cache:

```bash
npx expo start --clear
```

### Environment Variables Validation

**Checklist for build success**:

```bash
# Required for production builds
EXPO_PUBLIC_SENTRY_DSN=https://...
EXPO_PUBLIC_POSTHOG_API_KEY=phc_...
EXPO_PUBLIC_POSTHOG_HOST=https://eu.posthog.com

# RevenueCat (production only)
EXPO_PUBLIC_REVENUECAT_API_KEY=appl_...

# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://...
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## 🛡️ Preventive Measures

### Build Health Check Script

Create comprehensive pre-build validation:

```bash
#!/bin/bash
# scripts/health-check.sh

echo "🔍 Repetito Build Health Check"
echo "================================"

# Check environment variables
if [ -z "$EXPO_PUBLIC_SENTRY_DSN" ]; then
  echo "⚠️ Missing EXPO_PUBLIC_SENTRY_DSN"
fi

# Check dependencies
npm audit --audit-level=moderate

# TypeScript check
npx tsc --noEmit

# EAS configuration validation
npx eas config --check

echo "✅ Health check completed"
```

### Cache Management Strategy

```bash
# Emergency cache clearing
npm run clear-cache           # Clear all caches
eas build --clear-cache      # Clear EAS build cache
npx expo start --clear       # Clear Metro cache
rm -rf node_modules && npm ci # Nuclear option
```

### Development Workflow

1. **Before each build**:

   ```bash
   ./scripts/ci/build.sh check  # Run quality checks
   ```

2. **Monthly maintenance**:

   ```bash
   # Update cache keys in eas.json
   "cache": { "key": "repetito-ios-cache-YYYY-MM-DD" }
   ```

3. **Environment sync**:
   ```bash
   # Verify all required env vars are set
   npm run debug-env
   ```

---

## 🚑 Emergency Procedures

### Build Completely Broken

1. **Reset native directories**:

   ```bash
   rm -rf ios android
   npx expo prebuild --clean
   ```

2. **Reset dependencies**:

   ```bash
   rm -rf node_modules package-lock.json
   npm ci
   ```

3. **Reset EAS cache**:
   ```bash
   # Update cache key in eas.json to current date
   eas build --platform ios --clear-cache
   ```

### Runtime Crashes

1. **Disable problematic integrations**:

   ```typescript
   // Temporary disable in development
   if (__DEV__) {
     // Skip Sentry, RevenueCat, PostHog initialization
     return;
   }
   ```

2. **Safe mode configuration**:
   ```json
   // eas.json - minimal build profile
   "safe": {
     "developmentClient": true,
     "distribution": "internal",
     "env": {
       "APP_VARIANT": "safe",
       "SENTRY_DISABLE_AUTO_UPLOAD": "true"
     }
   }
   ```

---

## 📋 Reference Commands

### EAS Build Profiles

```bash
# Development builds
eas build --platform ios --profile development
eas build --platform android --profile development

# With cache clearing
eas build --platform ios --profile development --clear-cache

# Preview builds
eas build --platform ios --profile preview
```

### Local Development

```bash
# Start with different modes
npm run dev           # Standard development
npm run dev:clear     # Clear cache
npm run dev:lan       # LAN for device testing

# Platform-specific
npm run ios:dev       # iOS device
npm run ios:sim       # iOS simulator
npm run android:dev   # Android device
```

### Diagnostics

```bash
# Project health
npm run type-check    # TypeScript validation
npm run quality       # Quality checks
npm run diagnose-network  # Network connectivity

# Cache and cleanup
npm run clear-cache   # Clear all caches
npm run clear-ios     # iOS-specific cleanup
npm run clear-android # Android-specific cleanup
```

---

## 🔧 MCP Debugging Tools

### React Native Debugger MCP

```bash
claude mcp add react-native-debugger-mcp "npx -y @twodoorsdev/react-native-debugger-mcp"
```

- **Purpose**: Real-time Metro console log retrieval
- **Usage**: Debug navigation issues, runtime errors
- **Best for**: Identifying third-party library conflicts

### Expo Docs MCP

```bash
claude mcp add expo-docs "npx expo-docs-mcp"
```

- **Purpose**: Comprehensive Expo documentation search
- **Usage**: Find solutions for Expo Router, navigation
- **Best for**: Quick access to up-to-date documentation

### Debugging Methodology

1. **Use MCP tools** to identify error sources
2. **Check third-party libraries** for compatibility issues
3. **Verify navigation system** (Expo Router vs React Navigation)
4. **Test solutions systematically** with proper tooling

---

## 📚 Additional Resources

- [Expo Build Reference](https://docs.expo.dev/build-reference/)
- [PostHog React Native Configuration](https://posthog.com/docs/libraries/react-native)
- [Expo Router Documentation](https://expo.github.io/router/)
- [RevenueCat Development Testing](https://docs.revenuecat.com/docs/testing)
- [NativeWind Babel Configuration](https://www.nativewind.dev/getting-started/babel)

---

**Last Updated**: January 16, 2025  
**Expo SDK**: 53.0.19  
**React Native**: 0.79.5  
**Project**: Repetito Czech Educational App  
**Major Fix**: PostHog getCurrentRoute error resolved ✅
