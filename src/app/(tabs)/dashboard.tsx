import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SimpleThemeToggle } from '../../components/ui/theme-switcher';
import { useThemedStyles, useThemedCard, useThemedText } from '../../theme/useThemedStyles';

export default function DashboardScreen() {
  const { screen, spacing } = useThemedStyles();
  const headingStyle = useThemedText('heading');
  const subtitleStyle = useThemedText('secondary');

  return (
    <SafeAreaView style={screen}>
      <ScrollView style={{ flex: 1 }}>
        {/* Header with theme toggle */}
        <View 
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: spacing.lg,
            marginBottom: spacing['2xl'],
            marginHorizontal: spacing.md, // Odsazení od krajů
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={headingStyle}>
              Welcome! 👋
            </Text>
            <Text style={subtitleStyle}>
              Universal Mobile App Template
            </Text>
          </View>
          <SimpleThemeToggle />
        </View>

        {/* Dev Menu Card */}
        <TouchableOpacity
          style={[useThemedCard('clickable'), { marginHorizontal: spacing.md }]}
          onPress={() => router.push('/dev-menu')}
        >
          <Text style={useThemedText('accent')}>
            🔧 Development Menu
          </Text>
          <Text style={useThemedText('secondary')}>
            Test all template features: analytics, auth, payments, themes
          </Text>
        </TouchableOpacity>

        {/* Template Features */}
        <TouchableOpacity
          style={[useThemedCard('clickable'), { marginHorizontal: spacing.md }]}
          onPress={() => router.push('/(tabs)/library')}
        >
          <Text style={useThemedText('subheading')}>
            🧪 Testing Screen
          </Text>
          <Text style={useThemedText('secondary')}>
            UI components testing and examples
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[useThemedCard('clickable'), { marginHorizontal: spacing.md }]}
          onPress={() => router.push('/(tabs)/stats')}
        >
          <Text style={useThemedText('subheading')}>
            📊 Analytics
          </Text>
          <Text style={useThemedText('secondary')}>
            PostHog analytics and user behavior tracking
          </Text>
        </TouchableOpacity>

        {/* Template Info */}
        <View style={[useThemedCard(), { marginHorizontal: spacing.md }]}>
          <Text style={useThemedText('subheading')}>
            📱 Template Features
          </Text>
          <Text style={useThemedText('secondary')}>
            This template includes:
          </Text>
          <View style={{ marginTop: spacing.md }}>
            <Text style={useThemedText('muted')}>• React Native 0.79.5 + Expo 53</Text>
            <Text style={useThemedText('muted')}>• TypeScript + Modern Theme System</Text>
            <Text style={useThemedText('muted')}>• Supabase auth + database</Text>
            <Text style={useThemedText('muted')}>• PostHog analytics + Sentry errors</Text>
            <Text style={useThemedText('muted')}>• RevenueCat subscriptions</Text>
            <Text style={useThemedText('muted')}>• Modern Dark/Light mode</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
