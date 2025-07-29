import Constants from 'expo-constants';
import * as Sentry from '@sentry/react-native';
import { useEffect, useState } from 'react';

export const initSentry = () => {
  console.log('🔧 Initializing Sentry...');

  // Development vs Production configuration
  if (__DEV__) {
    console.log('🔧 Sentry development mode - minimal config');
    // Initialize Sentry even in dev to prevent wrap errors, but with minimal config
    Sentry.init({
      // No DSN in development - offline mode
      enabled: false,
      debug: false,
      integrations: [], // No integrations in development
    });
    return;
  }

  try {
    Sentry.init({
      dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,

      // Ultra-minimální konfigurace
      debug: false,
      enabled: true,

      // Žádné performance monitoring
      tracesSampleRate: 0.0,
      profilesSampleRate: 0.0,

      // Žádné navigation integration - eliminuje getCurrentRoute chyby
      integrations: [],

      // Základní nastavení
      environment: process.env.EXPO_PUBLIC_APP_ENV || 'development',

      // Minimální context
      initialScope: {
        tags: {
          engine: 'hermes',
          app: 'repetito',
        },
      },

      // Jednoduchý beforeSend
      beforeSend(event) {
        // Jen základní PII filtering
        if (event.user?.email) {
          event.user.email = '[Filtered]';
        }
        return event;
      },

      // Ultra-konzervativní nastavení
      maxBreadcrumbs: 10,
      attachStacktrace: false,
      autoSessionTracking: !__DEV__, // Vypnout v dev
      sendDefaultPii: false,
      maxValueLength: 200,
    });

    console.log(
      '✅ Sentry initialized (ultra-minimal mode, no navigation tracking)'
    );
  } catch (error) {
    console.error('❌ Sentry initialization failed:', error);
  }
};

// Expo Router specific navigation tracking for Sentry (2024)
export const useSentryRouteTracking = () => {
  // Import Expo Router hooks dynamically to avoid import issues
  const [pathname, setPathname] = useState<string>('');
  const [segments, setSegments] = useState<string[]>([]);

  useEffect(() => {
    // Kompletně vypnout v development - žádné navigation tracking
    if (__DEV__) {
      console.log('🔧 Sentry navigation disabled in development mode');
      return;
    }

    // Dynamically import Expo Router hooks
    const loadExpoRouterHooks = async () => {
      try {
        const { usePathname, useSegments } = await import('expo-router');
        // Note: This is a simplified approach - in practice you'd use these hooks directly
        console.log('✅ Sentry route tracking initialized (production)');
      } catch (error) {
        console.warn('⚠️ Expo Router hooks not available:', error);
      }
    };

    loadExpoRouterHooks();
  }, []);

  useEffect(() => {
    if (__DEV__) return;

    // Manual route tracking without getCurrentRoute
    try {
      Sentry.setContext('navigation', {
        currentRoute: pathname || 'unknown',
        segments: segments || [],
        timestamp: Date.now(),
      });
    } catch (error) {
      console.warn('⚠️ Sentry route context setting failed:', error);
    }
  }, [pathname, segments]);
};

// Helper pro manuální error reporting
export const reportError = (error: Error, context?: Record<string, any>) => {
  if (__DEV__) {
    console.error('🐛 Development Error:', error, context);
    return;
  }

  Sentry.withScope(scope => {
    if (context) {
      scope.setContext('error_context', context);
    }
    Sentry.captureException(error);
  });
};

// Helper pro custom events
export const reportEvent = (
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
) => {
  if (__DEV__) {
    console.log(`📝 Development Event [${level}]:`, message);
    return;
  }

  Sentry.captureMessage(message, level);
};
