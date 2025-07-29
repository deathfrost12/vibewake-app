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
import { useThemedStyles, useThemedCard, useThemedText } from '../../theme/useThemedStyles';

export default function RevenueCatScreen() {
  const { screen, spacing, colors } = useThemedStyles();
  const headingStyle = useThemedText('heading');
  const sectionHeadingStyle = useThemedText('subheading');
  const cardStyle = useThemedCard('clickable');
  
  return (
    <SafeAreaView style={screen}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <TouchableOpacity 
          style={{ padding: spacing.sm, marginRight: spacing.sm }}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[headingStyle, { fontSize: 20 }]}>
          RevenueCat Testing
        </Text>
      </View>

      <ScrollView style={{ flex: 1, padding: spacing.lg }}>
        <Text style={[sectionHeadingStyle, { marginBottom: spacing.md }]}>
          💳 RevenueCat Testing
        </Text>

        <TouchableOpacity
          style={[
            {
              backgroundColor: colors.interactive.accent,
              borderRadius: 16,
              padding: spacing.md,
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: spacing.md,
            },
            { shadowColor: colors.interactive.accent, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }
          ]}
          onPress={() => router.push('/revenuecat-demo')}
        >
          <Ionicons name="card" size={20} color="white" />
          <View style={{ marginLeft: spacing.sm, flex: 1 }}>
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
              RevenueCat Demo Screen
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
              Test subscriptions and purchases
            </Text>
          </View>
        </TouchableOpacity>

        {/* Další testy mohou být přidány zde v budoucnu */}
        <View style={[cardStyle, { marginTop: spacing.md }]}>
          <Text style={[{ color: colors.text.primary, fontWeight: '500', marginBottom: spacing.sm }]}>
            📝 Plánované testy:
          </Text>
          <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
            • Subscription status monitoring{'\n'}• Purchase flow testing{'\n'}•
            Restore purchases testing{'\n'}• Error handling scenarios
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
