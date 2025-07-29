import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemedStyles, useThemedCard, useThemedText } from '../../theme/useThemedStyles';

export default function AnalyticsScreen() {
  const { screen, spacing, colors } = useThemedStyles();
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
            Analytics
          </Text>
          <Text style={subtitleStyle}>
            PostHog events and user behavior tracking
          </Text>
        </View>

        {/* Analytics Overview */}
        <View style={[useThemedCard('elevated'), {
          alignItems: 'center',
          marginHorizontal: spacing.md,
          marginBottom: spacing.xl,
          backgroundColor: colors.interactive.accent,
        }]}>
          <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#FFFFFF', marginBottom: spacing.sm }}>📊</Text>
          <Text style={{ fontSize: 18, color: '#FFFFFF', fontWeight: '600' }}>Analytics Ready</Text>
        </View>

        {/* Stats Grid */}
        <View style={{
          flexDirection: 'row',
          gap: spacing.md,
          marginBottom: spacing['2xl'],
          marginHorizontal: spacing.md,
        }}>
          <View style={[useThemedCard(), {
            flex: 1,
            alignItems: 'center',
            marginBottom: 0,
          }]}>
            <Text style={[useThemedText('subheading'), { fontSize: 20, fontWeight: 'bold', marginBottom: spacing.sm }]}>PostHog</Text>
            <Text style={[useThemedText('secondary'), { textAlign: 'center' }]}>Event{'\n'}Tracking</Text>
          </View>

          <View style={[useThemedCard(), {
            flex: 1,
            alignItems: 'center',
            marginBottom: 0,
          }]}>
            <Text style={[useThemedText('subheading'), { fontSize: 20, fontWeight: 'bold', marginBottom: spacing.sm }]}>Sentry</Text>
            <Text style={[useThemedText('secondary'), { textAlign: 'center' }]}>Error{'\n'}Tracking</Text>
          </View>
        </View>

        {/* Analytics Tools */}
        <View style={{ marginBottom: spacing['2xl'], marginHorizontal: spacing.md }}>
          <Text style={[sectionHeadingStyle, { marginBottom: spacing.md }]}>
            📈 Analytics Tools
          </Text>

          <TouchableOpacity 
            style={[useThemedCard('clickable'), { marginBottom: spacing.sm }]}
            onPress={() => router.push('/dev/analytics')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="analytics" size={24} color={colors.status.info} style={{ marginRight: spacing.sm }} />
              <View style={{ flex: 1 }}>
                <Text style={useThemedText('accent')}>
                  PostHog Events
                </Text>
                <Text style={useThemedText('secondary')}>
                  Track user interactions and behavior
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[useThemedCard('clickable'), { marginBottom: spacing.sm }]}
            onPress={() => router.push('/dev/analytics')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="warning" size={24} color={colors.status.error} style={{ marginRight: spacing.sm }} />
              <View style={{ flex: 1 }}>
                <Text style={[useThemedText('accent'), { color: colors.status.error }]}>
                  Sentry Errors
                </Text>
                <Text style={useThemedText('secondary')}>
                  Monitor and track application errors
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[useThemedCard('clickable'), { marginBottom: spacing.sm }]}
            onPress={() => router.push('/dev/analytics')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="checkmark-circle" size={24} color={colors.status.success} style={{ marginRight: spacing.sm }} />
              <View style={{ flex: 1 }}>
                <Text style={[useThemedText('accent'), { color: colors.status.success }]}>
                  Test Analytics
                </Text>
                <Text style={useThemedText('secondary')}>
                  Test all analytics integrations
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Template Info */}
        <View style={[useThemedCard(), { marginHorizontal: spacing.md, marginBottom: spacing.md }]}>
          <Text style={[useThemedText('subheading'), { marginBottom: spacing.sm }]}>
            📋 Analytics Setup
          </Text>
          <Text style={[useThemedText('secondary'), { marginBottom: spacing.sm }]}>
            • Configure PostHog API key in .env
          </Text>
          <Text style={[useThemedText('secondary'), { marginBottom: spacing.sm }]}>
            • Set up Sentry DSN for error tracking
          </Text>
          <Text style={[useThemedText('secondary'), { marginBottom: spacing.sm }]}>
            • Test events in development menu
          </Text>
          <Text style={useThemedText('secondary')}>
            • Review analytics in PostHog dashboard
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}