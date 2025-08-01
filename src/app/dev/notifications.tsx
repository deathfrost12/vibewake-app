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
import ToastTest from '../../components/common/toast-test';
import ToastUsageExample from '../../components/common/toast-usage-example';
import PushNotificationsTest from '../../components/common/push-notifications-test';
import {
  useThemedStyles,
  useThemedCard,
  useThemedText,
} from '../../theme/useThemedStyles';

export default function NotificationsScreen() {
  const { screen, spacing, colors } = useThemedStyles();
  const headingStyle = useThemedText('heading');
  const sectionHeadingStyle = useThemedText('subheading');

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
        <Text style={[headingStyle, { fontSize: 20 }]}>
          Notifications Testing
        </Text>
      </View>

      <ScrollView style={{ flex: 1, padding: spacing.lg }}>
        {/* Toast Notifications Tests */}
        <View
          style={{ marginBottom: spacing['2xl'], marginTop: spacing['2xl'] }}
        >
          <ToastTest />
        </View>

        {/* Toast Usage Examples */}
        <View style={{ marginBottom: spacing['2xl'] }}>
          <ToastUsageExample />
        </View>

        {/* Push Notifications Tests */}
        <View
          style={{ marginBottom: spacing['2xl'], marginTop: spacing['2xl'] }}
        >
          <PushNotificationsTest />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
