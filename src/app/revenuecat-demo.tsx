import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Button } from '../components/ui/button';
import {
  PremiumGate,
  PremiumBadge,
  InlinePremiumPrompt,
} from '../components/ui/premium-gate';
import { Paywall } from '../components/ui/paywall';
import {
  useRevenueCat,
  useEntitlements,
  useSubscriptionStatus,
} from '../components/common/revenuecat-provider';

interface DemoSectionProps {
  title: string;
  children: React.ReactNode;
}

function DemoSection({ title, children }: DemoSectionProps) {
  return (
    <View className="mb-6">
      <Text className="text-lg font-semibold text-gray-900 mb-3">{title}</Text>
      <View className="bg-white rounded-xl p-4 shadow-sm">{children}</View>
    </View>
  );
}

function StatusIndicator({
  label,
  value,
  isGood,
}: {
  label: string;
  value: string;
  isGood?: boolean;
}) {
  return (
    <View className="flex-row justify-between items-center py-2">
      <Text className="text-gray-600">{label}:</Text>
      <Text
        className={`font-medium ${isGood ? 'text-green-600' : 'text-gray-900'}`}
      >
        {value}
      </Text>
    </View>
  );
}

export default function RevenueCatDemoScreen() {
  const {
    isInitialized,
    isLoading,
    error,
    packages,
    refreshCustomerInfo,
    getOfferings,
    restorePurchases,
  } = useRevenueCat();
  const entitlements = useEntitlements();
  const subscriptionStatus = useSubscriptionStatus();
  const [showPaywall, setShowPaywall] = useState(false);

  const handleRefresh = async () => {
    try {
      await Promise.all([refreshCustomerInfo(), getOfferings()]);
      Alert.alert('Úspěch', 'RevenueCat data byla obnovena');
    } catch (error) {
      Alert.alert('Chyba', 'Nepodařilo se obnovit data');
    }
  };

  const handleRestore = async () => {
    try {
      const success = await restorePurchases();
      if (success) {
        Alert.alert('Úspěch', 'Nákupy byly obnoveny');
      } else {
        Alert.alert('Info', 'Žádné nákupy k obnovení');
      }
    } catch (error) {
      Alert.alert('Chyba', 'Nepodařilo se obnovit nákupy');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-200">
        <Button
          title="◀"
          onPress={() => router.back()}
          className="w-10 h-10 mr-4"
        />
        <Text className="text-xl font-bold text-gray-900 flex-1">
          RevenueCat Demo
        </Text>
        <View className="flex-row">
          {entitlements.isProUser && <PremiumBadge size="medium" />}
        </View>
      </View>

      <ScrollView
        className="flex-1 px-6 py-4"
        showsVerticalScrollIndicator={false}
      >
        {/* SDK Status */}
        <DemoSection title="🔧 SDK Status">
          <StatusIndicator
            label="Initialized"
            value={isInitialized ? 'Yes' : 'No'}
            isGood={isInitialized}
          />
          <StatusIndicator label="Loading" value={isLoading ? 'Yes' : 'No'} />
          <StatusIndicator
            label="Error"
            value={error || 'None'}
            isGood={!error}
          />
          <StatusIndicator
            label="Packages"
            value={packages.length.toString()}
            isGood={packages.length > 0}
          />

          <View className="flex-row gap-2 mt-4">
            <Button
              title="Refresh Data"
              onPress={handleRefresh}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              title="Restore"
              onPress={handleRestore}
              disabled={isLoading}
              className="flex-1"
            />
          </View>
        </DemoSection>

        {/* Entitlements */}
        <DemoSection title="🎯 Entitlements">
          <StatusIndicator
            label="Pro User"
            value={entitlements.isProUser ? 'Yes' : 'No'}
            isGood={entitlements.isProUser}
          />
          <StatusIndicator
            label="Magic Notes"
            value={entitlements.canUseAI ? 'Yes' : 'No'}
            isGood={entitlements.canUseAI}
          />
          <StatusIndicator
            label="Verified Content"
            value={entitlements.canAccessVerifiedSets ? 'Yes' : 'No'}
            isGood={entitlements.canAccessVerifiedSets}
          />
          <StatusIndicator
            label="Pro Features"
            value={entitlements.canAccessPremiumFeatures ? 'Yes' : 'No'}
            isGood={entitlements.canAccessPremiumFeatures}
          />
        </DemoSection>

        {/* Subscription Status */}
        <DemoSection title="💳 Subscription">
          <StatusIndicator
            label="Status"
            value={subscriptionStatus.statusText}
            isGood={subscriptionStatus.isSubscribed}
          />
          <StatusIndicator
            label="Active"
            value={subscriptionStatus.isActive ? 'Yes' : 'No'}
            isGood={subscriptionStatus.isActive}
          />
          {subscriptionStatus.expirationDate && (
            <StatusIndicator
              label="Expires"
              value={new Date(
                subscriptionStatus.expirationDate
              ).toLocaleDateString('cs-CZ')}
            />
          )}
        </DemoSection>

        {/* Available Packages */}
        {packages.length > 0 && (
          <DemoSection title="📦 Available Packages">
            {packages.map((pkg, index) => (
              <View
                key={pkg.identifier}
                className="py-2 border-b border-gray-100 last:border-b-0"
              >
                <Text className="font-medium text-gray-900">
                  {pkg.product.title}
                </Text>
                <Text className="text-sm text-gray-600">
                  {pkg.identifier} - {pkg.product.priceString}
                </Text>
                <Text className="text-xs text-gray-500 mt-1">
                  {pkg.product.description}
                </Text>
              </View>
            ))}
          </DemoSection>
        )}

        {/* Premium Gates Demo */}
        <DemoSection title="🚪 Pro Gates Demo">
          <Text className="text-gray-600 mb-4">
            These components show/hide based on your subscription status:
          </Text>

          <PremiumGate feature="magic_notes" className="mb-4">
            <View className="bg-green-50 border border-green-200 rounded-lg p-4">
              <View className="flex-row items-center">
                <Ionicons name="sparkles" size={20} color="#059669" />
                <Text className="text-green-800 font-medium ml-2">
                  Magic Notes Unlocked!
                </Text>
              </View>
              <Text className="text-green-700 text-sm mt-1">
                You have access to AI-powered note conversion.
              </Text>
            </View>
          </PremiumGate>

          <PremiumGate feature="verified_content" className="mb-4">
            <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <View className="flex-row items-center">
                <Ionicons name="library" size={20} color="#2563eb" />
                <Text className="text-blue-800 font-medium ml-2">
                  Verified Content Unlocked!
                </Text>
              </View>
              <Text className="text-blue-700 text-sm mt-1">
                You have access to expert-curated study sets.
              </Text>
            </View>
          </PremiumGate>

          <InlinePremiumPrompt
            feature="premium_features"
            onUpgrade={() => setShowPaywall(true)}
            className="mb-4"
          />
        </DemoSection>

        {/* Actions */}
        <DemoSection title="🎬 Actions">
          <Button
            title="Show Paywall"
            onPress={() => setShowPaywall(true)}
            className="mb-3"
          />

          <Button
            title="Go to Profile"
            onPress={() => router.push('/(tabs)/profile')}
            className="mb-3"
          />

          <Button
            title="Back to Dev Menu"
            onPress={() => router.push('/dev-menu')}
            className="mb-3"
          />
        </DemoSection>

        {/* Raw Debug Data */}
        {__DEV__ && (
          <DemoSection title="🐛 Debug Data">
            <Text className="text-xs text-gray-600 leading-5">
              {JSON.stringify(
                {
                  isInitialized,
                  isLoading,
                  error,
                  packageCount: packages.length,
                  entitlements: {
                    isProUser: entitlements.isProUser,
                    canUseAI: entitlements.canUseAI,
                    canAccessVerifiedSets: entitlements.canAccessVerifiedSets,
                    canAccessPremiumFeatures:
                      entitlements.canAccessPremiumFeatures,
                  },
                  subscription: {
                    isSubscribed: subscriptionStatus.isSubscribed,
                    isActive: subscriptionStatus.isActive,
                    statusText: subscriptionStatus.statusText,
                  },
                },
                null,
                2
              )}
            </Text>
          </DemoSection>
        )}
      </ScrollView>

      {/* Paywall Modal */}
      <Paywall
        isVisible={showPaywall}
        onClose={() => setShowPaywall(false)}
        source="demo"
        title="Demo Paywall"
        subtitle="Test the subscription flow in this demo environment."
      />
    </SafeAreaView>
  );
}
