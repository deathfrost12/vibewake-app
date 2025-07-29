import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { usePostHog } from 'posthog-react-native';
import * as Sentry from '@sentry/react-native';
import { Button } from '../ui/button';

/**
 * Analytics Test Component - PostHog and Sentry
 * Tests PostHog analytics and Sentry error tracking for universal mobile app
 *
 * @returns JSX component for testing analytics integrations
 */
export function AnalyticsTestComponent() {
  const posthog = usePostHog();

  // ✅ PostHog Tests (Production Ready)
  const testPostHogFeatureEvent = () => {
    console.log('🧪 Testing PostHog feature event...');
    posthog?.capture('feature_interaction', {
      // Generic feature properties
      feature_name: 'content_creation',
      action: 'create_new_post',
      category: 'productivity',
      difficulty: 'medium',

      // User context
      user_plan: 'premium',
      session_duration: 15,

      // Test properties
      test_context: 'analytics_test_panel',
      timestamp: new Date().toISOString(),
    });
    console.log('📊 PostHog feature event captured');
  };

  const testPostHogContentEvent = () => {
    console.log('🧪 Testing PostHog content event...');
    posthog?.capture('content_viewed', {
      // Content specific
      content_type: 'article',
      content_id: 'article_123',
      content_title: 'Getting Started Guide',
      category: 'tutorial',
      reading_time_estimate: 5,

      // User context
      user_plan: 'free',
      is_authenticated: true,

      // Test context
      test_context: 'analytics_test_panel',
    });
    console.log('📊 PostHog content event captured');
  };

  const testPostHogUserJourneyEvent = () => {
    console.log('🧪 Testing PostHog user journey event...');
    posthog?.capture('user_journey_milestone', {
      // User progress tracking
      milestone: 'completed_onboarding',
      days_since_signup: 3,
      total_actions: 45,
      engagement_score: 85,

      // User progress
      features_used: ['dashboard', 'profile', 'settings'],
      avg_session_duration: 18.5,
      retention_score: 85,

      // Engagement metrics
      feature_adoption: {
        notifications: true,
        dark_mode: true,
        push_notifications: false,
      },
    });
    console.log('📊 PostHog user journey event captured');
  };

  const testPostHogScreenTracking = () => {
    console.log(
      '🧪 Testing manual screen tracking (since auto-tracking is disabled)...'
    );
    posthog?.screen('Analytics Test Panel', {
      // Manual screen tracking properties
      previous_screen: 'Dev Menu',
      screen_category: 'testing',
      user_action: 'manual_test',

      // App context
      app_section: 'development',
      feature_being_tested: 'screen_tracking',

      // Test context
      test_context: 'analytics_test_panel',
      timestamp: new Date().toISOString(),
    });
    console.log('📊 Manual screen tracking completed');
  };

  // ✅ Sentry Tests (Production Ready)
  const testSentryBasicFunctionality = () => {
    console.log('🧪 Testing Sentry functionality (if initialized)...');

    try {
      // Test breadcrumb
      Sentry.addBreadcrumb({
        message: 'Analytics test panel interaction',
        level: 'info',
        category: 'user_action',
        data: {
          test_type: 'basic_functionality',
          user_intent: 'testing_error_tracking',
        },
      });

      // Test message capture
      Sentry.captureMessage(
        'Sentry basic functionality test from analytics panel',
        'info'
      );
      console.log('✅ SENTRY: Basic functionality test');
    } catch (error) {
      console.error('❌ SENTRY: Basic test failed:', error);
    }
  };

  const testSentryErrorCapture = () => {
    console.log('🧪 Testing Sentry error capture...');

    try {
      // Create test error with generic context
      const testError = new Error(
        'Test error from Analytics Test Panel - Universal Mobile App'
      );

      // Add generic app context
      Sentry.setContext('app_context', {
        app_type: 'universal mobile app',
        feature_being_tested: 'error_tracking',
        user_action: 'manual_error_test',
        expected_behavior: 'error_should_be_captured',
      });

      // Capture the error
      Sentry.captureException(testError);
      console.log('✅ SENTRY TEST: Test error captured');
    } catch (error) {
      console.error('❌ SENTRY: Error capture failed:', error);
    }

    console.log('✅ SENTRY: Error capture test completed');
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold text-gray-900 mb-2">
        🔬 Analytics & Error Tracking Test Panel
      </Text>

      <Text className="text-base text-gray-600 mb-6">
        Comprehensive testing for PostHog Analytics and Sentry Error Tracking
      </Text>

      {/* Debug Information */}
      <View className="bg-gray-50 p-4 rounded-lg mb-6">
        <Text className="text-lg font-semibold text-gray-900 mb-2">
          🔧 Debug Information
        </Text>
        <Text className="text-sm text-gray-700">Environment: Development</Text>
        <Text className="text-sm text-gray-700">JS Engine: Hermes</Text>
        <Text className="text-sm text-gray-700">React Native: 0.79.5</Text>
        <Text className="text-sm text-gray-700">
          PostHog: Active (EU instance)
        </Text>
        <Text className="text-sm text-gray-700">
          Sentry: Active (Production Ready)
        </Text>
        <Text className="text-sm text-gray-700">
          Test Mode: Universal mobile app testing
        </Text>
      </View>

      {/* PostHog Tests */}
      <View className="mb-8">
        <Text className="text-xl font-semibold text-primary mb-4">
          📊 PostHog Analytics Tests
        </Text>

        <Button
          title="Test Feature Event"
          onPress={testPostHogFeatureEvent}
          className="mb-3"
        />

        <Button
          title="Test Content Event"
          onPress={testPostHogContentEvent}
          className="mb-3"
        />

        <Button
          title="Test User Journey Event"
          onPress={testPostHogUserJourneyEvent}
          className="mb-3"
        />

        <Button
          title="Test Manual Screen Tracking"
          onPress={testPostHogScreenTracking}
          className="mb-3"
        />
      </View>

      {/* Sentry Tests */}
      <View className="mb-8">
        <Text className="text-xl font-semibold text-red-600 mb-4">
          🚨 Sentry Error Tracking Tests
        </Text>

        <Button
          title="Test Sentry Functionality"
          onPress={testSentryBasicFunctionality}
          className="mb-3 bg-red-600"
        />

        <Button
          title="Test Error Capture"
          onPress={testSentryErrorCapture}
          className="mb-3 bg-red-600"
        />
      </View>

      {/* Instructions */}
      <View className="bg-blue-50 p-4 rounded-lg">
        <Text className="text-lg font-semibold text-blue-900 mb-2">
          📝 Test Instructions
        </Text>
        <Text className="text-sm text-blue-800 leading-5">
          1. First run PostHog tests (verify they work){'\n'}
          2. Then run Sentry tests{'\n'}
          3. Watch console logs with 🔍 prefix{'\n'}
          4. Check Sentry dashboard for real errors{'\n'}
          5. If everything works, analytics integration is ready{'\n'}
          6. Results help identify potential issues
        </Text>
      </View>
    </ScrollView>
  );
}
