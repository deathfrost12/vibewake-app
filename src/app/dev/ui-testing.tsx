import React, { useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../components/ui/button';
import {
  useThemedStyles,
  useThemedCard,
  useThemedText,
} from '../../theme/useThemedStyles';

export default function UiTestingScreen() {
  const { screen, spacing, colors } = useThemedStyles();
  const headingStyle = useThemedText('heading');
  const sectionHeadingStyle = useThemedText('subheading');
  const cardStyle = useThemedCard('clickable');

  const testAction = (actionName: string) => {
    Alert.alert('Test Action', `${actionName} byl spuštěn!`);
  };

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
        <Text style={[headingStyle, { fontSize: 20 }]}>UI Testing</Text>
      </View>

      <ScrollView style={{ flex: 1, padding: spacing.lg }}>
        {/* Button Tests */}
        <View style={{ marginBottom: spacing['2xl'] }}>
          <Text style={[sectionHeadingStyle, { marginBottom: spacing.md }]}>
            ✨ Button Tests
          </Text>

          <View style={{ gap: spacing.sm }}>
            <Button
              title="Primary Large"
              variant="primary"
              size="lg"
              onPress={() => testAction('Primary Large')}
            />

            <Button
              title="Secondary Medium"
              variant="secondary"
              size="md"
              onPress={() => testAction('Secondary Medium')}
            />

            <Button
              title="Outline Small"
              variant="outline"
              size="sm"
              onPress={() => testAction('Outline Small')}
            />
          </View>
        </View>

        {/* NativeWind Demo */}
        <View style={{ marginBottom: spacing['2xl'] }}>
          <Text style={[sectionHeadingStyle, { marginBottom: spacing.md }]}>
            🎨 NativeWind Theme Demo
          </Text>

          <View style={{ gap: spacing.md }}>
            {/* Primary Colors */}
            <View
              style={[
                {
                  backgroundColor: colors.interactive.accent,
                  borderRadius: 16,
                  padding: spacing.md,
                },
              ]}
            >
              <Text
                style={{
                  color: 'white',
                  fontWeight: '600',
                  marginBottom: spacing.xs,
                }}
              >
                Primary Color
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                #14C46D - Magical Green
              </Text>
            </View>

            {/* Secondary Colors */}
            <View
              style={[
                {
                  backgroundColor: colors.secondary,
                  borderRadius: 16,
                  padding: spacing.md,
                },
              ]}
            >
              <Text
                style={{
                  color: colors.text.primary,
                  fontWeight: '600',
                  marginBottom: spacing.xs,
                }}
              >
                Secondary Background
              </Text>
              <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
                #F8F9FA - Light Gray
              </Text>
            </View>

            <View
              style={[
                {
                  backgroundColor: colors.text.secondary,
                  borderRadius: 16,
                  padding: spacing.md,
                },
              ]}
            >
              <Text
                style={{
                  color: 'white',
                  fontWeight: '600',
                  marginBottom: spacing.xs,
                }}
              >
                Secondary Medium
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
                #718096 - Gray
              </Text>
            </View>

            {/* Educational Colors */}
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <View
                style={[
                  {
                    flex: 1,
                    backgroundColor: colors.status.success,
                    borderRadius: 12,
                    padding: spacing.sm,
                  },
                ]}
              >
                <Text
                  style={{ color: 'white', fontSize: 14, fontWeight: '500' }}
                >
                  Success
                </Text>
              </View>
              <View
                style={[
                  {
                    flex: 1,
                    backgroundColor: colors.status.warning,
                    borderRadius: 12,
                    padding: spacing.sm,
                  },
                ]}
              >
                <Text
                  style={{ color: 'white', fontSize: 14, fontWeight: '500' }}
                >
                  Warning
                </Text>
              </View>
              <View
                style={[
                  {
                    flex: 1,
                    backgroundColor: colors.status.error,
                    borderRadius: 12,
                    padding: spacing.sm,
                  },
                ]}
              >
                <Text
                  style={{ color: 'white', fontSize: 14, fontWeight: '500' }}
                >
                  Error
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Magical Green CTA */}
        <View style={{ marginBottom: spacing['2xl'] }}>
          <Text style={[sectionHeadingStyle, { marginBottom: spacing.md }]}>
            ✨ Magical Green CTA
          </Text>

          <TouchableOpacity
            onPress={() => testAction('Magical CTA')}
            style={{
              shadowColor: '#14C46D',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <LinearGradient
              colors={['#55D9C6', '#B5D982']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                {
                  borderRadius: 24,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing['2xl'],
                },
              ]}
            >
              <Text
                style={[
                  {
                    textAlign: 'center',
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: 'black',
                  },
                ]}
              >
                Try for free
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
