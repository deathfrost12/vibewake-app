import { Stack, SplashScreen } from 'expo-router';
import { PostHogProvider } from 'posthog-react-native';
import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import pushNotificationService from '../services/notifications/push-notifications';
import { ToastProvider } from '../components/ui/toast';
import { RevenueCatProvider } from '../components/common/revenuecat-provider';
import { ThemeProvider } from '../contexts/theme-context';
import { initSentry, useSentryRouteTracking } from '../lib/sentry';
import '../../global.css';
import { useRouter } from 'expo-router';
import { AudioManager } from '../services/audio/AudioManager';

// Initialize Sentry using centralized configuration
console.log('🚀 Initializing Sentry...');
initSentry();

// POSTHOG INITIALIZATION - Production Ready
const PostHogAPIKey =
  Constants.expoConfig?.extra?.postHogApiKey ||
  process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
const PostHogHost =
  Constants.expoConfig?.extra?.postHogHost ||
  process.env.EXPO_PUBLIC_POSTHOG_HOST;

console.log('🚀 Application initializing...');

// Prevent splash screen from auto-hiding only if not in Expo Go
if (Constants.appOwnership !== 'expo') {
  // Prevent auto-hide for dev client
  SplashScreen.preventAutoHideAsync();
}

function RootLayoutNav() {
  const router = useRouter();

  // Initialize Sentry route tracking (production only)
  useSentryRouteTracking();

  // 🔔 Initialize app and hide splash screen
  useEffect(() => {
    const initApp = async () => {
      try {
        console.log('📱 SKIP: Push notifications - waiting for new dev client');
        // await pushNotificationService.initialize();
        console.log('⏸️ Push notifications temporarily disabled');

        // Initialize AudioManager globally  
        console.log('🎵 Initializing AudioManager...');
        await AudioManager.initialize();
        console.log('✅ AudioManager initialized');

        // Hide splash screen after app is ready
        if (Constants.appOwnership !== 'expo') {
          // Fixed condition for dev client
          await SplashScreen.hideAsync();
          console.log('✅ Splash screen hidden - app ready');
        } else {
          console.log('🔧 Skipping SplashScreen in Expo Go');
        }
      } catch (error) {
        console.warn('⚠️ App initialization failed:', error);
        // Safe failure without hideAsync
      }
    };

    initApp();
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen
          name="create"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen name="dev-menu" options={{ headerShown: false }} />
        <Stack.Screen name="dev" options={{ headerShown: false }} />
        <Stack.Screen
          name="testing-screen-1"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="songmaker-demo" options={{ headerShown: false }} />
        <Stack.Screen name="revenuecat-demo" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

function RootLayout() {
  if (!PostHogAPIKey || !PostHogHost) {
    console.warn('⚠️ PostHog not configured');
    return (
      <ThemeProvider>
        <RevenueCatProvider>
          <ToastProvider>
            <RootLayoutNav />
          </ToastProvider>
        </RevenueCatProvider>
      </ThemeProvider>
    );
  }

  return (
    <PostHogProvider
      apiKey={PostHogAPIKey}
      options={{
        host: PostHogHost,
        enableSessionReplay: false, // Privacy + performance
        captureAppLifecycleEvents: true,
        // captureDeepLinks: true, // Deprecated in newer PostHog versions

        // Logging settings - quiet in production
        // debug: __DEV__ ? false : false, // Always false for cleaner logs (deprecated option)
        flushAt: __DEV__ ? 5 : 20, // Smaller batches in dev
        flushInterval: __DEV__ ? 3000 : 10000, // More frequent in dev
      }}
      autocapture={{
        captureScreens: false, // Disable auto screen tracking - prevents getCurrentRoute errors with Expo Router
        captureTouches: true, // Keep touch events enabled
      }}
    >
      <ThemeProvider>
        <RevenueCatProvider>
          <ToastProvider>
            <RootLayoutNav />
          </ToastProvider>
        </RevenueCatProvider>
      </ThemeProvider>
    </PostHogProvider>
  );
}

export default Sentry.wrap(RootLayout);
