import PostHog from 'posthog-react-native';
import Constants from 'expo-constants';

let posthogInstance: PostHog | null = null;

export const initAnalytics = () => {
  try {
    // Disable analytics in development (but keep in staging for testing)
    if (__DEV__ && process.env.EXPO_PUBLIC_APP_ENV !== 'staging') {
      console.log('🚫 Analytics disabled in development');
      return null;
    }

    posthogInstance = new PostHog(
      process.env.EXPO_PUBLIC_POSTHOG_API_KEY || '',
      {
        // EU instance for GDPR compliance
        host:
          process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',

        // Optimal settings for mobile apps
        flushAt: 10, // Smaller batches for faster reporting
        flushInterval: 15000, // 15 second flush interval

        // User privacy settings
        disabled: false,
        defaultOptIn: true, // Users can opt-out later

        // App lifecycle events for usage patterns
        captureAppLifecycleEvents: true,

        // Feature flags for A/B testing
        preloadFeatureFlags: true,
        sendFeatureFlagEvent: true,

        // Session management for user sessions
        sessionExpirationTimeSeconds: 1800, // 30 minutes = typical session

        // Debugging only in staging
        // debug: process.env.EXPO_PUBLIC_APP_ENV === 'staging', // Deprecated option
      }
    );

    // Set app context
    posthogInstance.register({
      app_version: Constants.expoConfig?.version || '1.0.0',
      app_environment: process.env.EXPO_PUBLIC_APP_ENV || 'development',
      expo_channel: Constants.executionEnvironment || 'development',
      device_platform: Constants.platform?.ios ? 'ios' : 'android',
      app_locale: 'en-US', // Default locale - can be configured per app
    });

    console.log('✅ PostHog Analytics initialized');
    return posthogInstance;
  } catch (error) {
    console.error('❌ PostHog initialization failed:', error);
    return null;
  }
};

export const getAnalytics = (): PostHog | null => {
  return posthogInstance;
};

// Generic event tracking for any app feature
export const trackFeatureEvent = (
  feature: string,
  action: string,
  properties?: Record<string, any>
) => {
  if (!posthogInstance) return;

  try {
    posthogInstance.capture(`${feature}_${action}`, {
      timestamp: new Date().toISOString(),
      feature: feature,
      action: action,
      ...properties,
    });
  } catch (error) {
    console.error('❌ Feature event tracking failed:', error);
  }
};

// User journey tracking for onboarding and retention
export const trackUserJourney = (
  milestone: string,
  properties?: Record<string, any>
) => {
  if (!posthogInstance) return;

  try {
    posthogInstance.capture(`user_journey_${milestone}`, {
      timestamp: new Date().toISOString(),
      journey_stage: milestone,
      ...properties,
    });
  } catch (error) {
    console.error('❌ User journey tracking failed:', error);
  }
};

// Content interaction tracking (posts, articles, etc.)
export const trackContentEvent = (
  action: string,
  properties?: Record<string, any>
) => {
  if (!posthogInstance) return;

  try {
    posthogInstance.capture(`content_${action}`, {
      timestamp: new Date().toISOString(),
      feature: 'content',
      ...properties,
    });
  } catch (error) {
    console.error('❌ Content tracking failed:', error);
  }
};

// Subscription/monetization tracking
export const trackSubscriptionEvent = (
  action: string,
  properties?: Record<string, any>
) => {
  if (!posthogInstance) return;

  try {
    posthogInstance.capture(`subscription_${action}`, {
      timestamp: new Date().toISOString(),
      feature: 'subscription',
      ...properties,
    });
  } catch (error) {
    console.error('❌ Subscription tracking failed:', error);
  }
};

// Performance tracking for app metrics
export const trackPerformanceEvent = (
  metric: string,
  value: number,
  properties?: Record<string, any>
) => {
  if (!posthogInstance) return;

  try {
    posthogInstance.capture(`performance_${metric}`, {
      timestamp: new Date().toISOString(),
      metric_name: metric,
      metric_value: value,
      ...properties,
    });
  } catch (error) {
    console.error('❌ Performance tracking failed:', error);
  }
};

// User identification for authenticated users
export const identifyUser = (
  userId: string,
  properties?: Record<string, any>
) => {
  if (!posthogInstance) return;

  try {
    posthogInstance.identify(userId, {
      signup_date: new Date().toISOString(),
      ...properties,
    });
  } catch (error) {
    console.error('❌ User identification failed:', error);
  }
};

// Manual screen tracking for Expo Router (since auto tracking is disabled)
export const trackScreenView = (
  screenName: string,
  properties?: Record<string, any>
) => {
  if (!posthogInstance) return;

  try {
    posthogInstance.screen(screenName, {
      timestamp: new Date().toISOString(),
      ...properties,
    });
  } catch (error) {
    console.error('❌ Screen tracking failed:', error);
  }
};

// Reset analytics on logout
export const resetAnalytics = () => {
  if (!posthogInstance) return;

  try {
    posthogInstance.reset();
    console.log('✅ Analytics reset (user logged out)');
  } catch (error) {
    console.error('❌ Analytics reset failed:', error);
  }
};
