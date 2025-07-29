// Ultra-minimální Sentry test s maximum debugging
// Podle Enhanced Mandatory Implementation Protocol

console.log('🔍 SENTRY TEST: Starting minimal Sentry initialization test');
console.log(
  '🔍 SENTRY TEST: React Native version:',
  require('react-native/package.json').version
);
console.log(
  '🔍 SENTRY TEST: Hermes detection:',
  typeof HermesInternal !== 'undefined'
);

// Step 1: Test základní import
try {
  console.log('🔍 SENTRY TEST: Step 1 - Testing basic import');
  const Sentry = require('@sentry/react-native');
  console.log('✅ SENTRY TEST: Basic import successful', typeof Sentry);
  console.log('🔍 SENTRY TEST: Available methods:', Object.keys(Sentry));
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  console.error('❌ SENTRY TEST: Basic import failed:', errorMessage);
  console.error('❌ SENTRY TEST: Error stack:', errorStack);
  throw error;
}

// Step 2: Test Sentry init s minimum config
try {
  console.log('🔍 SENTRY TEST: Step 2 - Testing minimal init');
  const Sentry = require('@sentry/react-native');

  // Ultra-minimal config - pouze DSN
  const config = {
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    debug: true, // Maximum debug output

    // Disable EVERYTHING that could cause issues
    enableAutoSessionTracking: false,
    enableOutOfMemoryTracking: false,
    enableNativeCrashHandling: false,
    enableAutoPerformanceTracing: false,
    enableWatchdogTerminationTracking: false,

    // Empty integrations - žádné extra features
    integrations: [],

    // Basic rates
    tracesSampleRate: 0.0, // Disable performance tracking
    profilesSampleRate: 0.0, // Disable profiling

    // Environment detection
    environment: __DEV__ ? 'development' : 'production',

    // Release info
    release: '1.0.0-test',
  };

  console.log('🔍 SENTRY TEST: Using config:', JSON.stringify(config, null, 2));

  Sentry.init(config);

  console.log('✅ SENTRY TEST: Minimal init successful');

  // Step 3: Test basic functionality
  console.log('🔍 SENTRY TEST: Step 3 - Testing basic capture');

  Sentry.addBreadcrumb({
    message: 'Sentry test breadcrumb',
    level: 'info',
  });

  console.log('✅ SENTRY TEST: Breadcrumb added');

  Sentry.captureMessage('Sentry minimal test message', 'info');

  console.log('✅ SENTRY TEST: Message captured');

  // Export for use
  module.exports = {
    Sentry,
    isWorking: true,
    testError: () => {
      try {
        throw new Error('Sentry test error');
      } catch (error) {
        Sentry.captureException(error);
        console.log('✅ SENTRY TEST: Test error captured');
      }
    },
  };
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  console.error('❌ SENTRY TEST: Init failed:', errorMessage);
  console.error('❌ SENTRY TEST: Error stack:', errorStack);
  console.error('❌ SENTRY TEST: Error details:', error);

  // Detailed error analysis
  if (errorMessage.includes('prototype')) {
    console.error('🚨 SENTRY TEST: PROTOTYPE ERROR DETECTED');
    console.error('🚨 SENTRY TEST: This is the known Hermes/RN 0.79 issue');
  }

  if (errorMessage.includes('undefined')) {
    console.error('🚨 SENTRY TEST: UNDEFINED ERROR DETECTED');
    console.error('🚨 SENTRY TEST: Likely module resolution issue');
  }

  // Export broken state
  module.exports = {
    Sentry: null,
    isWorking: false,
    error: errorMessage,
    fullError: error,
  };
}

console.log('🔍 SENTRY TEST: Test file completed');
