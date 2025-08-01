import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AnalyticsTestComponent } from '../../components/common/analytics-test';
import {
  useThemedStyles,
  useThemedCard,
  useThemedText,
} from '../../theme/useThemedStyles';

export default function AnalyticsScreen() {
  const { screen, spacing, colors } = useThemedStyles();
  const headingStyle = useThemedText('heading');
  const sectionHeadingStyle = useThemedText('subheading');

  const testAnalytics = () =>
    Alert.alert('Info', 'Analytics test - TODO: implement');
  const testSentry = () => Alert.alert('Info', 'Sentry test - TODO: implement');
  const testPostHog = () =>
    Alert.alert('Info', 'PostHog test - TODO: implement');

  const analyticsTests = [
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
  ];

  return (
    <SafeAreaView style={screen}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity
          style={{ padding: spacing.sm, marginRight: spacing.sm }}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[headingStyle, { fontSize: 20 }]}>Analytics Testing</Text>
      </View>

      <ScrollView style={{ flex: 1, padding: spacing.lg }}>
        {/* Analytics & Error Tracking Tests */}
        <AnalyticsTestComponent />

        {/* Analytics Tests */}
        <View style={{ marginBottom: spacing['2xl'] }}>
          <Text style={[sectionHeadingStyle, { marginBottom: spacing.md }]}>
            🧪 Analytics Tests
          </Text>

          {analyticsTests.map((item, index) => (
            <View key={index} style={{ marginBottom: spacing.sm }}>
              <TouchableOpacity
                style={[
                  {
                    backgroundColor: colors.interactive.accent,
                    borderRadius: 16,
                    padding: spacing.md,
                    flexDirection: 'row',
                    alignItems: 'center',
                  },
                  {
                    shadowColor: colors.interactive.accent,
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  },
                ]}
                onPress={item.action}
              >
                <Ionicons name={item.icon} size={20} color="white" />
                <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                  <Text
                    style={{ color: 'white', fontWeight: '600', fontSize: 16 }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}
                  >
                    {item.subtitle}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
