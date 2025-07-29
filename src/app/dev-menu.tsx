import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../components/ui/button';
import { SimpleThemeToggle, ThemeIndicator } from '../components/ui/theme-switcher';
import { AnalyticsTestComponent } from '../components/common/analytics-test';
import PushNotificationsTest from '../components/common/push-notifications-test';
import ToastTest from '../components/common/toast-test';
import ToastUsageExample from '../components/common/toast-usage-example';
import LoadingTest from '../components/common/loading-test';
import LoadingUsageExample from '../components/common/loading-usage-example';
import { useDevTesting } from '../hooks/use-dev-testing';
import { useThemedStyles, useThemedCard, useThemedText } from '../theme/useThemedStyles';

export default function DevMenu() {
  const { screen, spacing, colors } = useThemedStyles();
  const headingStyle = useThemedText('heading');
  const subtitleStyle = useThemedText('secondary');
  const sectionHeadingStyle = useThemedText('subheading');
  
  const [message, setMessage] = useState('Ready to test!');
  const {
    mockMode,
    setMockMode,
    loadingState,
    mockData,
    simulateLoading,
    testScenarios,
    showAlert,
    showSuccess,
    showError,
    showInfo,
    screenHelpers,
    getDevInfo,
    mockApi,
  } = useDevTesting();

  // Placeholder functions for missing functionality
  const testAnalytics = () => showInfo('Analytics test - TODO: implement');
  const testSentry = () => showInfo('Sentry test - TODO: implement');
  const testPostHog = () => showInfo('PostHog test - TODO: implement');
  const testGoogleAuth = () => showInfo('Google Auth test - TODO: implement');
  const testAppleAuth = () => showInfo('Apple Auth test - TODO: implement');
  const resetAllStores = () => showInfo('Reset stores - TODO: implement');

  const testAction = (actionName: string) => {
    setMessage(`${actionName} tested at ${new Date().toLocaleTimeString()}`);
    Alert.alert('Test Action', `${actionName} executed!`);
  };

  const devMenuItems = [
    // Core Testing
    {
      title: '�� Testing Screen 1',
      subtitle: 'General component testing',
      icon: 'flask' as const,
      action: () => router.push('/testing-screen-1'),
    },
    {
      title: '🎵 Songmaker Demo',
      subtitle: 'Audio/video prototype',
      icon: 'musical-notes' as const,
      action: () => router.push('/songmaker-demo'),
    },
    {
      title: '💳 RevenueCat Demo',
      subtitle: 'Test subscription system',
      icon: 'card' as const,
      action: () => router.push('/revenuecat-demo'),
    },

    // Authentication Testing
    {
      title: '🔐 Test Google Auth',
      subtitle: 'Google Sign-In flow',
      icon: 'logo-google' as const,
      action: testGoogleAuth,
    },
    {
      title: '🍎 Test Apple Auth',
      subtitle: 'Apple Sign-In flow',
      icon: 'logo-apple' as const,
      action: testAppleAuth,
    },

    // Analytics & Error Testing
    {
      title: '📊 Test Analytics',
      subtitle: 'PostHog event tracking',
      icon: 'analytics' as const,
      action: testAnalytics,
    },
    {
      title: '🚨 Test Sentry',
      subtitle: 'Error tracking system',
      icon: 'warning' as const,
      action: testSentry,
    },
    {
      title: '📈 Test PostHog',
      subtitle: 'User behavior analytics',
      icon: 'trending-up' as const,
      action: testPostHog,
    },

    // System Actions
    {
      title: '🧹 Reset All Stores',
      subtitle: 'Clear all Zustand state',
      icon: 'refresh-circle' as const,
      action: () => {
        Alert.alert(
          'Reset All Stores',
          'This will clear all application state. Continue?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Reset',
              style: 'destructive',
              onPress: () => {
                resetAllStores();
                Alert.alert('Success', 'All stores have been reset');
              },
            },
          ]
        );
      },
    },
  ];

  const sections = [
    {
      route: 'dev/ui-testing' as const,
      title: 'UI Testing',
      icon: 'color-palette' as const,
    },
    {
      route: 'dev/revenuecat' as const,
      title: 'RevenueCat',
      icon: 'card' as const,
    },
    { route: 'dev/auth' as const, title: 'Auth', icon: 'lock-closed' as const },
    {
      route: 'dev/analytics' as const,
      title: 'Analytics',
      icon: 'analytics' as const,
    },
    {
      route: 'dev/notifications' as const,
      title: 'Notifications',
      icon: 'notifications' as const,
    },
    {
      route: 'dev/loading' as const,
      title: 'Loading',
      icon: 'hourglass' as const,
    },
    {
      route: 'dev/system' as const,
      title: 'System',
      icon: 'settings' as const,
    },
  ];

  return (
    <SafeAreaView style={screen}>
      <ThemeIndicator />
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            style={{ padding: spacing.sm, marginRight: spacing.sm }}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={[headingStyle, { fontSize: 20 }]}>Dev Menu</Text>
        </View>
        <SimpleThemeToggle />
      </View>

      <ScrollView style={{ flex: 1, padding: spacing.lg }}>
        {/* Status */}
        <View style={{ marginBottom: spacing['2xl'] }}>
          <Text style={[sectionHeadingStyle, { marginBottom: spacing.md }]}>
            🔧 Development Status
          </Text>
          <Text style={[useThemedText('accent'), { textAlign: 'center', marginBottom: spacing.sm }]}>
            {message}
          </Text>
        </View>

        {/* Cards Grid */}
        <View style={{ 
          flexDirection: 'row', 
          flexWrap: 'wrap', 
          justifyContent: 'space-between',
        }}>
          {sections.map(section => (
            <TouchableOpacity
              key={section.route}
              onPress={() => router.push(`/${section.route}`)}
              style={[
                useThemedCard('clickable'),
                {
                  width: '48%',
                  marginBottom: spacing.md,
                  alignItems: 'center',
                }
              ]}
            >
              <Ionicons
                name={section.icon}
                size={32}
                color={colors.text.secondary}
                style={{ marginBottom: spacing.sm }}
              />
              <Text style={[useThemedText('subheading'), { textAlign: 'center' }]}>
                {section.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
