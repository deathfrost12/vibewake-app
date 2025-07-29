import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemedStyles, useThemedText } from '../../theme/useThemedStyles';

export default function CreateTab() {
  const { screen, spacing, colors, shadows } = useThemedStyles();
  const headingStyle = useThemedText('heading');
  const subtitleStyle = useThemedText('secondary');

  return (
    <SafeAreaView style={screen}>
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
      }}>
        <View style={{ marginBottom: spacing.xl }}>
          <Ionicons name="add-circle" size={80} color={colors.interactive.accent} />
        </View>

        <Text style={[headingStyle, { textAlign: 'center', marginBottom: spacing.sm }]}>
          Create New Content
        </Text>

        <Text style={[subtitleStyle, {
          textAlign: 'center',
          lineHeight: 24,
          marginBottom: spacing['2xl'],
        }]}>
          Start building your own content{'\n'}
          for efficient learning
        </Text>

        <TouchableOpacity
          style={[
            {
              backgroundColor: colors.interactive.accent,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: spacing.xl,
              paddingVertical: spacing.md,
              borderRadius: 16,
            },
            shadows.md,
          ]}
          onPress={() => router.push('/create')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#FFFFFF',
            marginLeft: spacing.sm,
          }}>
            Start Creating
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
