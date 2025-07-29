import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Share,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/auth-store';
import { Button } from '../../components/ui/button';
import { PremiumBadge } from '../../components/ui/premium-gate';
import { Paywall } from '../../components/ui/paywall';
import {
  useRevenueCat,
  useEntitlements,
  useSubscriptionStatus,
} from '../../components/common/revenuecat-provider';
import { useThemedStyles, useThemedCard, useThemedText } from '../../theme/useThemedStyles';

interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
}

function ProfileSection({ title, children }: ProfileSectionProps) {
  const { spacing } = useThemedStyles();
  const sectionHeadingStyle = useThemedText('subheading');
  
  return (
    <View style={{ marginBottom: spacing.xl, marginHorizontal: spacing.md }}>
      <Text style={[sectionHeadingStyle, { marginBottom: spacing.sm }]}>{title}</Text>
      <View style={useThemedCard()}>{children}</View>
    </View>
  );
}

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
  isPro?: boolean;
}

function SettingsItem({
  icon,
  title,
  subtitle,
  onPress,
  rightElement,
  showChevron = true,
  isPro = false,
}: SettingsItemProps) {
  const { spacing, colors, borderRadius } = useThemedStyles();
  const titleStyle = useThemedText('subheading');
  const subtitleStyle = useThemedText('secondary');
  
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.separator,
      }}
    >
      <View style={{
        width: 40,
        height: 40,
        backgroundColor: colors.interactive.background,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
      }}>
        <Ionicons name={icon} size={20} color={colors.text.secondary} />
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={titleStyle}>{title}</Text>
          {isPro && (
            <View style={{ marginLeft: spacing.sm }}>
              <PremiumBadge size="small" />
            </View>
          )}
        </View>
        {subtitle && (
          <Text style={[subtitleStyle, { marginTop: spacing.xs }]}>{subtitle}</Text>
        )}
      </View>

      {rightElement}
      {showChevron && !rightElement && (
        <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
      )}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, loading, error, signOut, clearError } = useAuthStore();
  const { restorePurchases, isLoading } = useRevenueCat();
  const entitlements = useEntitlements();
  const subscriptionStatus = useSubscriptionStatus();
  const [showPaywall, setShowPaywall] = useState(false);

  React.useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSignOut = async () => {
    Alert.alert('Odhlášení', 'Opravdu se chcete odhlásit?', [
      {
        text: 'Zrušit',
        style: 'cancel',
      },
      {
        text: 'Odhlásit',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            // Navigation will be handled by auth state listener
          } catch (error) {
            console.error('Sign out error:', error);
          }
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleChangePassword = () => {
    router.push('/profile/change-password');
  };

  const handlePrivacyPolicy = () => {
    router.push('/profile/privacy-policy');
  };

  const handleTermsOfService = () => {
    router.push('/profile/terms-of-service');
  };

  const handleShareApp = async () => {
    try {
      const message =
        'Podívej se na Repetito - skvělou aplikaci pro efektivní učení! 🚀';

      if (Platform.OS === 'ios') {
        await Share.share({
          message,
          url: 'https://repetito.app', // TODO: Update with actual app store URL
        });
      } else {
        await Share.share({
          message: `${message} https://repetito.app`,
        });
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Kontakt podpory',
      'Napište nám na support@repetito.cz nebo nás najděte na sociálních sítích.',
      [
        {
          text: 'OK',
          style: 'default',
        },
      ]
    );
  };

  const handleRestorePurchases = async () => {
    try {
      const success = await restorePurchases();
      if (success) {
        Alert.alert('Úspěch', 'Vaše nákupy byly obnoveny');
      } else {
        Alert.alert('Info', 'Nebyly nalezeny žádné nákupy k obnovení');
      }
    } catch (error) {
      Alert.alert('Chyba', 'Nepodařilo se obnovit nákupy');
    }
  };

  const handleManageSubscription = () => {
    Alert.alert(
      'Správa předplatného',
      'Pro správu předplatného přejděte do nastavení App Store nebo Google Play.',
      [{ text: 'OK' }]
    );
  };

  const getDisplayName = (userObj = user) => {
    if (userObj?.full_name) {
      return userObj.full_name;
    }
    return userObj?.email?.split('@')[0] || 'Demo User';
  };

  const getAuthMethod = (userObj = user) => {
    if (!userObj) return 'Demo';
    // Basic detection based on email domain and user metadata
    if (
      userObj?.email?.includes('gmail.com') ||
      userObj?.email?.includes('googlemail.com')
    ) {
      return 'Google';
    }
    if (
      userObj?.email?.includes('icloud.com') ||
      userObj?.email?.includes('me.com') ||
      userObj?.email?.includes('mac.com')
    ) {
      return 'Apple';
    }
    return 'Email';
  };

  const { screen, spacing, colors, borderRadius } = useThemedStyles();
  const headingStyle = useThemedText('heading');
  const subtitleStyle = useThemedText('secondary');
  
  // Mock user data for template demonstration
  const mockUser = user || {
    id: 'demo-user-123',
    email: 'demo@example.com',
    full_name: 'Demo User',
    plan: 'free' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Mock entitlements for template demonstration
  const mockEntitlements = {
    isProUser: false,
    canUseAI: false,
    canAccessVerifiedSets: false,
    canAccessPremiumFeatures: false,
  };

  // Mock subscription status for template demonstration
  const mockSubscriptionStatus = {
    statusText: user ? subscriptionStatus.statusText : 'Free Plan',
    expirationDate: null,
  };

  const displayUser = user || mockUser;
  const displayEntitlements = user ? entitlements : mockEntitlements;
  const displaySubscriptionStatus = user ? subscriptionStatus : mockSubscriptionStatus;

  return (
    <SafeAreaView style={screen}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{
          alignItems: 'center',
          marginBottom: spacing['2xl'],
          marginTop: spacing.lg,
          marginHorizontal: spacing.md,
        }}>
          <View style={{
            width: 80,
            height: 80,
            backgroundColor: colors.interactive.accent,
            borderRadius: borderRadius.full,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.md,
          }}>
            <Text style={{
              fontSize: 40,
              fontWeight: 'bold',
              color: 'white',
            }}>
              {getDisplayName(displayUser).charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text style={[headingStyle, { marginBottom: spacing.sm }]}>
            Your Profile
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[subtitleStyle, { marginRight: spacing.sm }]}>
              {displaySubscriptionStatus.statusText}
            </Text>
            {displayEntitlements.isProUser && <PremiumBadge size="medium" />}
          </View>
        </View>

        {/* Subscription Status */}
        <ProfileSection title="Subscription">
          {displayEntitlements.isProUser ? (
            <>
              <SettingsItem
                icon="star"
                title="Premium Active"
                subtitle={
                  displaySubscriptionStatus.expirationDate
                    ? `Renews ${new Date(displaySubscriptionStatus.expirationDate).toLocaleDateString('en-US')}`
                    : 'Active subscription'
                }
                showChevron={false}
                rightElement={
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[useThemedText('accent'), { fontWeight: '500' }]}>Active</Text>
                  </View>
                }
              />

              <SettingsItem
                icon="settings"
                title="Manage Subscription"
                subtitle="Change or cancel subscription"
                onPress={user ? handleManageSubscription : () => Alert.alert('Demo', 'This is a demo. Sign in to access real subscription management.')}
              />
            </>
          ) : (
            <SettingsItem
              icon="star-outline"
              title="Upgrade to Pro"
              subtitle="Unlock all premium features"
              onPress={user ? () => setShowPaywall(true) : () => Alert.alert('Demo', 'This is a demo. Sign in to access real subscription features.')}
              rightElement={
                <View style={{
                  backgroundColor: colors.interactive.accent,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs,
                  borderRadius: borderRadius.full,
                }}>
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: '500' }}>
                    7 days free
                  </Text>
                </View>
              }
            />
          )}

          <SettingsItem
            icon="refresh"
            title="Restore Purchases"
            subtitle="Restore previous purchases"
            onPress={user ? handleRestorePurchases : () => Alert.alert('Demo', 'This is a demo. Sign in to access real purchase restoration.')}
            showChevron={false}
          />
        </ProfileSection>

        {/* Pro Features */}
        <ProfileSection title="Pro Features">
          <SettingsItem
            icon="sparkles"
            title="AI Features"
            subtitle={
              displayEntitlements.canUseAI ? 'Available' : 'Requires Pro'
            }
            isPro={true}
            rightElement={
              <Text style={{
                fontSize: 14,
                fontWeight: '500',
                color: displayEntitlements.canUseAI ? colors.status.success : colors.text.muted,
              }}>
                {displayEntitlements.canUseAI ? 'Active' : 'Unavailable'}
              </Text>
            }
            showChevron={false}
          />

          <SettingsItem
            icon="library"
            title="Premium Content"
            subtitle={
              displayEntitlements.canAccessVerifiedSets
                ? 'Full access'
                : 'Requires Pro'
            }
            isPro={true}
            rightElement={
              <Text style={{
                fontSize: 14,
                fontWeight: '500',
                color: displayEntitlements.canAccessVerifiedSets ? colors.status.success : colors.text.muted,
              }}>
                {displayEntitlements.canAccessVerifiedSets ? 'Active' : 'Unavailable'}
              </Text>
            }
            showChevron={false}
          />

          <SettingsItem
            icon="analytics"
            title="Advanced Analytics"
            subtitle={
              displayEntitlements.canAccessPremiumFeatures
                ? 'Available'
                : 'Requires Pro'
            }
            isPro={true}
            rightElement={
              <Text style={{
                fontSize: 14,
                fontWeight: '500',
                color: displayEntitlements.canAccessPremiumFeatures ? colors.status.success : colors.text.muted,
              }}>
                {displayEntitlements.canAccessPremiumFeatures
                  ? 'Active'
                  : 'Unavailable'}
              </Text>
            }
            showChevron={false}
          />
        </ProfileSection>

        {/* General Settings */}
        <ProfileSection title="Settings">
          <SettingsItem
            icon="notifications"
            title="Notifications"
            subtitle="Manage reminders and alerts"
            onPress={() => {
              Alert.alert(
                'Info',
                'Notification settings will be implemented in the next phase'
              );
            }}
          />

          <SettingsItem
            icon="shield-checkmark"
            title="Privacy & Security"
            subtitle="GDPR and data protection"
            onPress={() => {
              Alert.alert(
                'Info',
                'Privacy settings will be implemented in the next phase'
              );
            }}
          />

          <SettingsItem
            icon="help-circle"
            title="Help & Support"
            subtitle="FAQ and contact"
            onPress={() => {
              Alert.alert('Info', 'Help will be implemented in the next phase');
            }}
          />
        </ProfileSection>

        {/* Debug Info (Development Only) */}
        {__DEV__ && (
          <ProfileSection title="Debug Info (Development)">
            <View style={{ padding: spacing.md }}>
              <Text style={[useThemedText('muted'), { lineHeight: 20 }]}>
                User Status: {user ? 'Signed In' : 'Demo Mode'}{'\n'}
                RevenueCat Status:{'\n'}• Is Pro:{' '}
                {displayEntitlements.isProUser ? 'Yes' : 'No'}
                {'\n'}• Can Use AI: {displayEntitlements.canUseAI ? 'Yes' : 'No'}
                {'\n'}• Can Access Verified:{' '}
                {displayEntitlements.canAccessVerifiedSets ? 'Yes' : 'No'}
                {'\n'}• Loading: {user ? (isLoading ? 'Yes' : 'No') : 'N/A (Demo)'}
                {'\n'}• Subscription Status: {displaySubscriptionStatus.statusText}
              </Text>
            </View>
          </ProfileSection>
        )}
      </ScrollView>

      {/* Paywall Modal */}
      <Paywall
        isVisible={showPaywall}
        onClose={() => setShowPaywall(false)}
        source="profile"
      />
    </SafeAreaView>
  );
}
