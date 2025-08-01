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
import LoadingTest from '../../components/common/loading-test';
import LoadingUsageExample from '../../components/common/loading-usage-example';
import {
  useThemedStyles,
  useThemedCard,
  useThemedText,
} from '../../theme/useThemedStyles';

export default function LoadingScreen() {
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
        <Text style={[headingStyle, { fontSize: 20 }]}>Loading Testing</Text>
      </View>

      <ScrollView style={{ flex: 1, padding: spacing.lg }}>
        {/* Loading Skeletons & States Tests */}
        <View style={{ marginBottom: spacing['2xl'] }}>
          <LoadingTest />
        </View>

        {/* Loading Hooks Usage Examples */}
        <View style={{ marginBottom: spacing['2xl'] }}>
          <LoadingUsageExample />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
