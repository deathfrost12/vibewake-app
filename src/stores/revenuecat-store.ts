import { create } from 'zustand';
import Purchases, {
  CustomerInfo,
  PurchasesPackage,
  PurchasesOfferings,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';

// Czech educational app pricing strategy
const REVENUECAT_API_KEYS = {
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || '',
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || '',
} as const;

// Repetito entitlements
export const ENTITLEMENTS = {
  PRO: 'Pro',
} as const;

export const OFFERING_IDS = {
  DEFAULT: 'default',
  STUDENT_DISCOUNT: 'student_discount',
} as const;

export interface RevenueCatState {
  // Core state
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // Customer data
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOfferings | null;
  packages: PurchasesPackage[];

  // User status
  isProUser: boolean;

  // Actions
  initialize: () => Promise<void>;
  refreshCustomerInfo: () => Promise<void>;
  getOfferings: () => Promise<void>;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useRevenueCatStore = create<RevenueCatState>((set, get) => ({
  // Initial state
  isInitialized: false,
  isLoading: false,
  error: null,
  customerInfo: null,
  offerings: null,
  packages: [],
  isProUser: false,

  // Initialize RevenueCat SDK
  initialize: async () => {
    try {
      set({ isLoading: true, error: null });

      // Configure debug logs for development
      if (__DEV__) {
        // 🔇 Ultra-quiet development mode to eliminate error spam
        Purchases.setLogLevel(LOG_LEVEL.ERROR);
        console.log('🔇 RevenueCat: Development mode - error-only logging');
      } else {
        Purchases.setLogLevel(LOG_LEVEL.INFO);
      }

      // Get platform-specific API key
      const apiKey = Platform.select({
        ios: REVENUECAT_API_KEYS.ios,
        android: REVENUECAT_API_KEYS.android,
        default: REVENUECAT_API_KEYS.ios,
      });

      if (!apiKey) {
        throw new Error('RevenueCat API key not configured for this platform');
      }

      // Configure RevenueCat
      await Purchases.configure({ apiKey });

      // 🚀 DEVELOPMENT IMPROVEMENT - Initialize even if offerings fail
      try {
        // Initial data fetch
        await Promise.all([get().refreshCustomerInfo(), get().getOfferings()]);
      } catch (fetchError) {
        // In development, continue even if data fetch fails
        if (__DEV__) {
          console.log(
            '⚠️ Development: Some RevenueCat data unavailable, continuing...'
          );
          await get().refreshCustomerInfo(); // At least try customer info
        } else {
          throw fetchError; // Re-throw in production
        }
      }

      set({ isInitialized: true, isLoading: false });
      console.log('✅ RevenueCat initialized successfully');
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to initialize RevenueCat';
      console.error('❌ RevenueCat initialization failed:', errorMessage);
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Refresh customer info and update entitlements
  refreshCustomerInfo: async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();

      // Check entitlements
      const isProUser =
        customerInfo.entitlements.active[ENTITLEMENTS.PRO] !== undefined;

      set({
        customerInfo,
        isProUser,
        error: null,
      });

      console.log('✅ Customer info refreshed:', {
        isProUser,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to refresh customer info';
      console.error('❌ Failed to refresh customer info:', errorMessage);
      set({ error: errorMessage });
    }
  },

  // Get available offerings and packages
  getOfferings: async () => {
    try {
      const offerings = await Purchases.getOfferings();

      // Extract all packages from current offering
      const packages = offerings.current?.availablePackages || [];

      set({ offerings, packages, error: null });
      console.log('✅ Offerings loaded:', {
        offeringCount: Object.keys(offerings.all).length,
        packageCount: packages.length,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to get offerings';

      // 🚀 DEVELOPMENT FALLBACK - create mock packages for testing
      if (__DEV__ && errorMessage.includes('configuration')) {
        console.log('⚠️ Development mode: Creating mock packages for testing');
        console.log(
          'ℹ️ These are mock products - real products will work in production'
        );

        // Create mock packages for development testing
        const mockPackages = [
          {
            identifier: 'repetito_pro_monthly_mock',
            product: {
              identifier: 'com.repetito.app.pro.monthly',
              title: 'Repetito Pro Monthly (Mock)',
              description:
                'Development test - Měsíční přístup ke všem premium funkcím',
              priceString: '159 Kč',
              price: 159,
              currencyCode: 'CZK',
            },
          },
          {
            identifier: 'repetito_pro_annual_mock',
            product: {
              identifier: 'com.repetito.app.pro.annual',
              title: 'Repetito Pro Annual (Mock)',
              description:
                'Development test - Roční přístup ke všem premium funkcím',
              priceString: '990 Kč',
              price: 990,
              currencyCode: 'CZK',
            },
          },
        ];

        set({
          offerings: null,
          packages: mockPackages as any, // Mock packages for development
          error: null,
        });

        console.log('✅ Mock packages created for development testing:', {
          packageCount: mockPackages.length,
        });
        return;
      }

      // Tišší error logging v development módu
      if (__DEV__) {
        console.log(
          '⚡ Development: RevenueCat offerings unavailable, mock packages active'
        );
      } else {
        console.error('❌ Failed to get offerings:', errorMessage);
      }
      set({ error: errorMessage });
    }
  },

  // Purchase a package
  purchasePackage: async (pkg: PurchasesPackage): Promise<boolean> => {
    try {
      set({ isLoading: true, error: null });

      console.log('🛒 Initiating purchase:', {
        identifier: pkg.identifier,
        product: pkg.product.identifier,
        price: pkg.product.priceString,
      });

      // 🚀 DEVELOPMENT MOCK PURCHASE - simulate successful purchase
      if (__DEV__ && pkg.identifier?.includes('mock')) {
        console.log('⚡ Development mode: Simulating purchase...');

        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock successful purchase - simulate premium user
        set({
          isLoading: false,
          isProUser: true, // Grant premium access in development
          error: null,
        });

        console.log('✅ Mock purchase successful - Pro access granted!');
        console.log(
          'ℹ️ In production, this will use real Apple/Google payments'
        );
        return true;
      }

      const purchaseResult = await Purchases.purchasePackage(pkg);

      // Update customer info with new purchase
      set({
        customerInfo: purchaseResult.customerInfo,
        isLoading: false,
      });

      // Refresh entitlements
      await get().refreshCustomerInfo();

      console.log('✅ Purchase successful:', pkg.identifier);
      return true;
    } catch (error: any) {
      let errorMessage = 'Purchase failed';

      if (error.userCancelled) {
        errorMessage = 'Nákup byl zrušen';
        console.log('ℹ️ Purchase cancelled by user');
      } else {
        errorMessage = error.message || 'Nákup se nezdařil';
        console.error('❌ Purchase failed:', error);
      }

      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  // Restore purchases
  restorePurchases: async (): Promise<boolean> => {
    try {
      set({ isLoading: true, error: null });

      const customerInfo = await Purchases.restorePurchases();

      // Update state
      set({ customerInfo, isLoading: false });

      // Refresh entitlements
      await get().refreshCustomerInfo();

      console.log('✅ Purchases restored successfully');
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to restore purchases';
      console.error('❌ Failed to restore purchases:', errorMessage);
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  // Set error message
  setError: (error: string | null) => {
    set({ error });
  },

  // Reset store to initial state
  reset: () => {
    set({
      isInitialized: false,
      isLoading: false,
      error: null,
      customerInfo: null,
      offerings: null,
      packages: [],
      isProUser: false,
    });
  },
}));
