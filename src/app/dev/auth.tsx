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
import {
  useThemedStyles,
  useThemedCard,
  useThemedText,
} from '../../theme/useThemedStyles';
import { useAuthStore } from '../../stores/auth-store';

export default function AuthScreen() {
  const { screen, spacing, colors } = useThemedStyles();
  const headingStyle = useThemedText('heading');
  const sectionHeadingStyle = useThemedText('subheading');
  const { signInWithGoogle, signInWithApple, loading, user, signOut } =
    useAuthStore();

  const testGoogleAuth = async () => {
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        Alert.alert('Success', 'Google sign-in successful!');
      } else {
        Alert.alert('Error', result.error || 'Google sign-in failed');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Google sign-in failed: ' + (error as Error).message
      );
    }
  };

  const testAppleAuth = async () => {
    try {
      const result = await signInWithApple();
      if (result.success) {
        Alert.alert('Success', 'Apple sign-in successful!');
      } else {
        Alert.alert('Error', result.error || 'Apple sign-in failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Apple sign-in failed: ' + (error as Error).message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      Alert.alert('Success', 'Signed out successfully');
    } catch (error) {
      Alert.alert('Error', 'Sign out failed: ' + (error as Error).message);
    }
  };

  const authTests = [
    {
      title: '🔐 Test Google Auth',
      subtitle: 'Google Sign-In flow',
      icon: 'logo-google' as const,
      action: testGoogleAuth,
    },
    {
      title: '🍎 Test Apple Auth',
      subtitle: 'Apple Sign-In flow',
      icon: 'logo-apple' as const,
      action: testAppleAuth,
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
        <Text style={[headingStyle, { fontSize: 20 }]}>Auth Testing</Text>
      </View>

      <ScrollView style={{ flex: 1, padding: spacing.lg }}>
        {/* Current Auth Status */}
        <View style={[useThemedCard(), { marginBottom: spacing['2xl'] }]}>
          <Text style={[sectionHeadingStyle, { marginBottom: spacing.md }]}>
            🔐 Authentication Status
          </Text>
          <Text style={useThemedText('secondary')}>
            {user ? `Signed in as: ${user.email}` : 'Not signed in'}
          </Text>
          {user && (
            <TouchableOpacity
              style={[
                {
                  backgroundColor: colors.status.error,
                  borderRadius: 8,
                  padding: spacing.sm,
                  marginTop: spacing.md,
                  alignItems: 'center',
                },
              ]}
              onPress={handleSignOut}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>
                Sign Out
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Auth Screens */}
        <View style={{ marginBottom: spacing['2xl'] }}>
          <Text style={[sectionHeadingStyle, { marginBottom: spacing.md }]}>
            🔐 Auth Screens
          </Text>

          <View style={{ gap: spacing.sm }}>
            <Link href="/auth/login" asChild>
              <TouchableOpacity
                style={[
                  useThemedCard('clickable'),
                  { marginBottom: spacing.sm },
                ]}
              >
                <Text style={useThemedText('subheading')}>🔑 Login Screen</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/auth/register" asChild>
              <TouchableOpacity
                style={[
                  useThemedCard('clickable'),
                  { marginBottom: spacing.sm },
                ]}
              >
                <Text style={useThemedText('subheading')}>
                  📝 Register Screen
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Auth Tests */}
        <View style={{ marginBottom: spacing['2xl'] }}>
          <Text style={[sectionHeadingStyle, { marginBottom: spacing.md }]}>
            🧪 Authentication Tests
          </Text>

          {authTests.map((item, index) => (
            <View key={index} style={{ marginBottom: spacing.sm }}>
              <TouchableOpacity
                style={[
                  {
                    backgroundColor: colors.interactive.accent,
                    borderRadius: 16,
                    padding: spacing.md,
                    flexDirection: 'row',
                    alignItems: 'center',
                    opacity: loading ? 0.6 : 1,
                  },
                  {
                    shadowColor: colors.interactive.accent,
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  },
                ]}
                onPress={item.action}
                disabled={loading}
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
