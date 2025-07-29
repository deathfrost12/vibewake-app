import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useRevenueCatStore } from '../../stores/revenuecat-store';
import type { RevenueCatState } from '../../stores/revenuecat-store';

// Context for accessing RevenueCat state throughout the app
const RevenueCatContext = createContext<RevenueCatState | null>(null);

interface RevenueCatProviderProps {
  children: ReactNode;
}

/**
 * RevenueCat Provider Component
 *
 * Provides RevenueCat functionality throughout the app and handles initialization.
 * Should be placed high in the component tree (usually in _layout.tsx).
 */
export function RevenueCatProvider({ children }: RevenueCatProviderProps) {
  const revenueCatState = useRevenueCatStore();

  // Initialize RevenueCat when the provider mounts
  useEffect(() => {
    if (!revenueCatState.isInitialized && !revenueCatState.isLoading) {
      console.log('🚀 Initializing RevenueCat...');
      revenueCatState.initialize();
    }
  }, [revenueCatState.isInitialized, revenueCatState.isLoading]);

  // Log state changes in development
  useEffect(() => {
    if (__DEV__) {
      console.log('🔄 RevenueCat state updated:', {
        isInitialized: revenueCatState.isInitialized,
        isProUser: revenueCatState.isProUser,
        packageCount: revenueCatState.packages.length,
        error: revenueCatState.error,
      });
    }
  }, [
    revenueCatState.isInitialized,
    revenueCatState.isProUser,
    revenueCatState.packages.length,
    revenueCatState.error,
  ]);

  return (
    <RevenueCatContext.Provider value={revenueCatState}>
      {children}
    </RevenueCatContext.Provider>
  );
}

/**
 * Hook for accessing RevenueCat state and actions
 *
 * @returns RevenueCatState object with all state and actions
 * @throws Error if used outside of RevenueCatProvider
 */
export function useRevenueCat(): RevenueCatState {
  const context = useContext(RevenueCatContext);

  if (!context) {
    throw new Error('useRevenueCat must be used within a RevenueCatProvider');
  }

  return context;
}

/**
 * Hook for checking if user has specific entitlements
 *
 * @returns Object with boolean flags for each entitlement
 */
export function useEntitlements() {
  const { isProUser } = useRevenueCat();

  return {
    isProUser,
    // All features are available with Pro subscription
    canAccessPremiumFeatures: isProUser,
    canUseAI: isProUser,
    canAccessVerifiedSets: isProUser,
    canUseMagicNotes: isProUser,
    canAccessPremiumStats: isProUser,
  };
}

/**
 * Hook for getting user's subscription status and info
 *
 * @returns Subscription status information
 */
export function useSubscriptionStatus() {
  const { customerInfo, isProUser, isLoading } = useRevenueCat();

  // Get active subscription info if available
  const activeSubscription = customerInfo?.activeSubscriptions?.[0];
  const latestPurchaseDate = customerInfo?.latestExpirationDate;

  return {
    isLoading,
    isSubscribed: isProUser,
    subscriptionId: activeSubscription,
    expirationDate: latestPurchaseDate,
    isActive: !!customerInfo?.entitlements.active,
    // Czech localized status
    statusText: isProUser ? 'Repetito Pro aktivní' : 'Repetito Free',
  };
}
