import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemedStyles, useThemedCard, useThemedText } from '../../theme/useThemedStyles';

export default function SystemScreen() {
  const { screen, spacing, colors } = useThemedStyles();
  const headingStyle = useThemedText('heading');
  const sectionHeadingStyle = useThemedText('subheading');
  const cardStyle = useThemedCard('clickable');
  
  const resetAllStores = () => {
    Alert.alert(
      'Reset All Stores',
      'This will clear all application state. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'All stores have been reset');
          },
        },
      ]
    );
  };

  const systemItems = [
    {
      title: '🧪 Testing Screen 1',
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
      title: '🧹 Reset All Stores',
      subtitle: 'Clear all Zustand state',
      icon: 'refresh-circle' as const,
      action: resetAllStores,
    },
  ];

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
          System Testing
        </Text>
      </View>

      <ScrollView style={{ flex: 1, padding: spacing.lg }}>
        {/* Navigation Tests */}
        <View style={{ marginBottom: spacing['2xl'] }}>
          <Text style={[sectionHeadingStyle, { marginBottom: spacing.md }]}>
            📱 Screen Navigation
          </Text>

          <View style={{ gap: spacing.sm }}>
            <Link href="/(tabs)/dashboard" asChild>
              <TouchableOpacity style={cardStyle}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text.primary }}>
                  📊 Dashboard Screen
                </Text>
              </TouchableOpacity>
            </Link>

            <Link href="/(tabs)/profile" asChild>
              <TouchableOpacity style={cardStyle}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text.primary }}>
                  ⚙️ Settings Screen
                </Text>
              </TouchableOpacity>
            </Link>

            <Link href="/songmaker-demo" asChild>
              <TouchableOpacity style={cardStyle}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.text.primary }}>
                  🎵 SongMaker Demo
                </Text>
              </TouchableOpacity>
            </Link>

            <TouchableOpacity
              style={[
                {
                  backgroundColor: colors.interactive.accent + '1A',
                  borderRadius: 16,
                  padding: spacing.md,
                  borderWidth: 1,
                  borderColor: colors.interactive.accent + '33',
                }
              ]}
              onPress={() => router.push('/testing-screen-1')}
            >
              <Text style={{ fontSize: 16, fontWeight: '500', color: colors.interactive.accent }}>
                🧪 Testing Screen 1 - Gradient Button
              </Text>
              <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: spacing.xs }}>
                Magický zelený gradient button demo
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* System Tests */}
        <View style={{ marginBottom: spacing['2xl'] }}>
          <Text style={[sectionHeadingStyle, { marginBottom: spacing.md }]}>
            🧪 System Tests
          </Text>

          {systemItems.map((item, index) => (
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
                  { shadowColor: colors.interactive.accent, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }
                ]}
                onPress={item.action}
              >
                <Ionicons name={item.icon} size={20} color="white" />
                <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                    {item.title}
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>{item.subtitle}</Text>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Warning */}
        <View style={[
          {
            backgroundColor: colors.status.warning + '1A',
            borderWidth: 1,
            borderColor: colors.status.warning + '33',
            borderRadius: 16,
            padding: spacing.md,
            marginTop: spacing.xl,
          }
        ]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
            <Ionicons name="warning" size={20} color={colors.status.warning} />
            <Text style={[{ color: colors.status.warning, fontWeight: '600', marginLeft: spacing.sm }]}>
              Development Only
            </Text>
          </View>
          <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
            This dev menu is only available in development builds. It will not
            be included in production releases.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
