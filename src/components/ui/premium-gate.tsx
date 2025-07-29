import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEntitlements } from '../common/revenuecat-provider';
import { Paywall } from './paywall';

interface PremiumGateProps {
  children: React.ReactNode;
  feature: 'magic_notes' | 'verified_content' | 'premium_features';
  fallbackTitle?: string;
  fallbackDescription?: string;
  className?: string;
}

const FEATURE_CONFIG = {
  magic_notes: {
    icon: 'sparkles' as const,
    title: 'Magic Notes (AI + OCR)',
    description:
      'Převeďte své poznámky na kartičky pomocí umělé inteligence. Pouze pro Repetito Pro.',
    entitlementCheck: (entitlements: ReturnType<typeof useEntitlements>) =>
      entitlements.canUseAI,
  },
  verified_content: {
    icon: 'library' as const,
    title: 'Ověřený maturitní obsah',
    description:
      'Přístup k rozsáhlé knihovně ověřených study setů připravených odborníky.',
    entitlementCheck: (entitlements: ReturnType<typeof useEntitlements>) =>
      entitlements.canAccessVerifiedSets,
  },
  premium_features: {
    icon: 'star' as const,
    title: 'Pro funkce',
    description: 'Odemkněte všechny pokročilé funkce aplikace Repetito.',
    entitlementCheck: (entitlements: ReturnType<typeof useEntitlements>) =>
      entitlements.canAccessPremiumFeatures,
  },
} as const;

/**
 * Premium Gate Component
 *
 * Conditionally renders children based on user's entitlements.
 * If user doesn't have access, shows a premium upgrade prompt.
 */
export function PremiumGate({
  children,
  feature,
  fallbackTitle,
  fallbackDescription,
  className = '',
}: PremiumGateProps) {
  const entitlements = useEntitlements();
  const [showPaywall, setShowPaywall] = useState(false);

  const config = FEATURE_CONFIG[feature];
  const hasAccess = config.entitlementCheck(entitlements);

  // If user has access, render children normally
  if (hasAccess) {
    return <>{children}</>;
  }

  // If no access, show premium gate
  return (
    <>
      <View
        className={`bg-gray-50 border border-gray-200 rounded-xl p-6 items-center ${className}`}
      >
        {/* Premium Icon */}
        <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-4">
          <Ionicons name={config.icon} size={28} color="#14C46D" />
        </View>

        {/* Title */}
        <Text className="text-lg font-semibold text-gray-900 text-center mb-2">
          {fallbackTitle || config.title}
        </Text>

        {/* Description */}
        <Text className="text-gray-600 text-center text-sm leading-5 mb-6">
          {fallbackDescription || config.description}
        </Text>

        {/* Upgrade Button */}
        <Pressable
          onPress={() => setShowPaywall(true)}
          className="bg-primary px-6 py-3 rounded-xl flex-row items-center"
        >
          <Ionicons name="star" size={16} color="white" />
          <Text className="text-white font-semibold ml-2">
            Upgradovat na Pro
          </Text>
        </Pressable>

        {/* Additional Info */}
        <Text className="text-gray-500 text-xs text-center mt-3">
          7denní zkušební období zdarma
        </Text>
      </View>

      {/* Paywall Modal */}
      <Paywall
        isVisible={showPaywall}
        onClose={() => setShowPaywall(false)}
        source={feature === 'premium_features' ? 'profile' : feature}
        title={fallbackTitle || config.title}
        subtitle={fallbackDescription || config.description}
      />
    </>
  );
}

/**
 * Premium Badge Component
 *
 * Small badge to indicate premium features
 */
interface PremiumBadgeProps {
  size?: 'small' | 'medium';
  className?: string;
}

export function PremiumBadge({
  size = 'small',
  className = '',
}: PremiumBadgeProps) {
  const iconSize = size === 'small' ? 12 : 16;
  const textSize = size === 'small' ? 'text-xs' : 'text-sm';
  const padding = size === 'small' ? 'px-2 py-1' : 'px-3 py-1.5';

  return (
    <View
      className={`bg-primary/10 rounded-full flex-row items-center ${padding} ${className}`}
    >
      <Ionicons name="star" size={iconSize} color="#14C46D" />
      <Text className={`text-primary font-medium ml-1 ${textSize}`}>Pro</Text>
    </View>
  );
}

/**
 * Inline Premium Prompt Component
 *
 * Small prompt that can be embedded within existing UI
 */
interface InlinePremiumPromptProps {
  feature: keyof typeof FEATURE_CONFIG;
  onUpgrade: () => void;
  className?: string;
}

export function InlinePremiumPrompt({
  feature,
  onUpgrade,
  className = '',
}: InlinePremiumPromptProps) {
  const config = FEATURE_CONFIG[feature];

  return (
    <Pressable
      onPress={onUpgrade}
      className={`bg-primary/5 border border-primary/20 rounded-lg p-3 flex-row items-center ${className}`}
    >
      <View className="w-8 h-8 bg-primary/10 rounded-full items-center justify-center mr-3">
        <Ionicons name={config.icon} size={16} color="#14C46D" />
      </View>

      <View className="flex-1">
        <Text className="text-gray-900 font-medium text-sm">
          {config.title}
        </Text>
        <Text className="text-gray-600 text-xs">Pouze pro Repetito Pro</Text>
      </View>

      <Ionicons name="chevron-forward" size={16} color="#14C46D" />
    </Pressable>
  );
}
