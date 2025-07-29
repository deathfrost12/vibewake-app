import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useThemedStyles, useThemedCard, useThemedText } from '../../theme/useThemedStyles';

export default function TestingScreen() {
  const { screen, spacing } = useThemedStyles();
  const headingStyle = useThemedText('heading');
  const subtitleStyle = useThemedText('secondary');
  const sectionHeadingStyle = useThemedText('subheading');

  return (
    <SafeAreaView style={screen}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{
          marginTop: spacing.lg,
          marginBottom: spacing['2xl'],
          marginHorizontal: spacing.md,
        }}>
          <Text style={headingStyle}>
            Testing
          </Text>
          <Text style={subtitleStyle}>
            UI components and functionality tests
          </Text>
        </View>

        <View style={{ marginBottom: spacing['2xl'], marginHorizontal: spacing.md }}>
          <Text style={[sectionHeadingStyle, { marginBottom: spacing.md }]}>
            🎨 UI Components
          </Text>

          <TouchableOpacity 
            style={[useThemedCard('clickable'), { marginBottom: spacing.sm }]}
            onPress={() => router.push('/dev/ui-testing')}
          >
            <Text style={useThemedText('subheading')}>
              Button Components
            </Text>
            <Text style={useThemedText('secondary')}>
              Primary, secondary, outline button styles
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[useThemedCard('clickable'), { marginBottom: spacing.sm }]}
            onPress={() => router.push('/dev/loading')}
          >
            <Text style={useThemedText('subheading')}>
              Loading States
            </Text>
            <Text style={useThemedText('secondary')}>
              Spinners, skeletons, and loading indicators
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[useThemedCard('clickable'), { marginBottom: spacing.sm }]}
            onPress={() => router.push('/dev/notifications')}
          >
            <Text style={useThemedText('subheading')}>
              Toast Notifications
            </Text>
            <Text style={useThemedText('secondary')}>
              Success, error, info, and warning toasts
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginBottom: spacing['2xl'], marginHorizontal: spacing.md }}>
          <Text style={[sectionHeadingStyle, { marginBottom: spacing.md }]}>
            🔧 Template Features
          </Text>

          <TouchableOpacity 
            style={[useThemedCard('clickable'), { marginBottom: spacing.sm }]}
            onPress={() => router.push('/dev/auth')}
          >
            <Text style={useThemedText('subheading')}>
              Authentication
            </Text>
            <Text style={useThemedText('secondary')}>
              Google & Apple OAuth, Supabase auth
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[useThemedCard('clickable'), { marginBottom: spacing.sm }]}
            onPress={() => router.push('/dev/analytics')}
          >
            <Text style={useThemedText('subheading')}>
              Analytics & Tracking
            </Text>
            <Text style={useThemedText('secondary')}>
              PostHog events, Sentry error tracking
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[useThemedCard('clickable'), { marginBottom: spacing.sm }]}
            onPress={() => router.push('/dev/revenuecat')}
          >
            <Text style={useThemedText('subheading')}>
              Subscriptions
            </Text>
            <Text style={useThemedText('secondary')}>
              RevenueCat subscription management
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginBottom: spacing['2xl'], marginHorizontal: spacing.md }}>
          <Text style={[sectionHeadingStyle, { marginBottom: spacing.md }]}>
            🚀 Quick Actions
          </Text>

          <TouchableOpacity 
            style={[useThemedCard('clickable'), { marginBottom: spacing.sm }]}
            onPress={() => router.push('/testing-screen-1')}
          >
            <Text style={useThemedText('accent')}>
              Screen Testing 1
            </Text>
            <Text style={useThemedText('secondary')}>
              Basic component testing screen
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[useThemedCard('clickable'), { marginBottom: spacing.sm }]}
            onPress={() => router.push('/revenuecat-demo')}
          >
            <Text style={useThemedText('accent')}>
              RevenueCat Demo
            </Text>
            <Text style={useThemedText('secondary')}>
              Subscription flow demonstration
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}