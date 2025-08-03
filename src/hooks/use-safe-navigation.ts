import { useState, useEffect, useCallback } from 'react';
import {
  navigationManager,
  safeNavigate,
  safeReplace,
  safeGoBack,
  NavigationState,
} from '../utils/navigation-utils';

interface UseSafeNavigationOptions {
  defaultCooldown?: number;
  enableHaptics?: boolean;
  trackNavigationState?: boolean;
}

interface UseSafeNavigationReturn {
  navigate: (href: string, options?: NavigationOptions) => Promise<boolean>;
  replace: (href: string, options?: NavigationOptions) => Promise<boolean>;
  goBack: (options?: BackNavigationOptions) => Promise<boolean>;
  isNavigating: boolean;
  canNavigate: boolean;
  setCooldown: (duration: number) => void;
  forceReset: () => void;
}

interface NavigationOptions {
  hapticFeedback?: boolean;
  customCooldown?: number;
  bypassCooldown?: boolean;
}

interface BackNavigationOptions {
  hapticFeedback?: boolean;
  customCooldown?: number;
  bypassCooldown?: boolean;
}

/**
 * Custom hook for safe navigation with debouncing and state tracking
 *
 * @param options Configuration options for the hook
 * @returns Navigation functions and state
 *
 * @example
 * ```tsx
 * const { navigate, isNavigating, canNavigate } = useSafeNavigation();
 *
 * const handleEditAlarm = async () => {
 *   const success = await navigate(`/alarms/create?editId=${alarmId}`);
 *   if (!success) {
 *     console.log('Navigation was blocked due to cooldown');
 *   }
 * };
 *
 * return (
 *   <TouchableOpacity
 *     onPress={handleEditAlarm}
 *     disabled={!canNavigate}
 *     style={{ opacity: canNavigate ? 1 : 0.5 }}
 *   >
 *     <Text>Edit Alarm</Text>
 *   </TouchableOpacity>
 * );
 * ```
 */
export function useSafeNavigation(
  options: UseSafeNavigationOptions = {}
): UseSafeNavigationReturn {
  const {
    defaultCooldown = 300,
    enableHaptics = true,
    trackNavigationState = true,
  } = options;

  const [navigationState, setNavigationState] = useState<NavigationState>(() =>
    navigationManager.getNavigationState()
  );

  // Update navigation state when it changes
  useEffect(() => {
    if (!trackNavigationState) return;

    const interval = setInterval(() => {
      const currentState = navigationManager.getNavigationState();
      setNavigationState(currentState);
    }, 50); // Check every 50ms for responsive UI updates

    return () => clearInterval(interval);
  }, [trackNavigationState]);

  // Set default cooldown on mount
  useEffect(() => {
    navigationManager.setCooldownDuration(defaultCooldown);
  }, [defaultCooldown]);

  const navigate = useCallback(
    async (
      href: string,
      navOptions: NavigationOptions = {}
    ): Promise<boolean> => {
      const mergedOptions = {
        hapticFeedback: enableHaptics,
        ...navOptions,
      };

      return await safeNavigate(href, mergedOptions);
    },
    [enableHaptics]
  );

  const replace = useCallback(
    async (
      href: string,
      navOptions: NavigationOptions = {}
    ): Promise<boolean> => {
      const mergedOptions = {
        hapticFeedback: enableHaptics,
        ...navOptions,
      };

      return await safeReplace(href, mergedOptions);
    },
    [enableHaptics]
  );

  const goBack = useCallback(
    async (navOptions: BackNavigationOptions = {}): Promise<boolean> => {
      const mergedOptions = {
        hapticFeedback: enableHaptics,
        ...navOptions,
      };

      return await safeGoBack(mergedOptions);
    },
    [enableHaptics]
  );

  const setCooldown = useCallback((duration: number) => {
    navigationManager.setCooldownDuration(duration);
  }, []);

  const forceReset = useCallback(() => {
    navigationManager.forceReset();
  }, []);

  // Derived state for easy UI integration
  const isNavigating = navigationState.isNavigating;
  const canNavigate =
    !isNavigating &&
    Date.now() - navigationState.lastNavigationTime >=
      navigationState.cooldownDuration;

  return {
    navigate,
    replace,
    goBack,
    isNavigating,
    canNavigate,
    setCooldown,
    forceReset,
  };
}

/**
 * Lightweight hook for basic navigation without state tracking
 * Use this when you don't need UI feedback and want minimal overhead
 */
export function useSafeNavigationBasic() {
  const navigate = useCallback(
    async (href: string, options?: NavigationOptions) => {
      return await safeNavigate(href, options);
    },
    []
  );

  const replace = useCallback(
    async (href: string, options?: NavigationOptions) => {
      return await safeReplace(href, options);
    },
    []
  );

  const goBack = useCallback(async (options?: BackNavigationOptions) => {
    return await safeGoBack(options);
  }, []);

  return { navigate, replace, goBack };
}

/**
 * Hook specifically for alarm-related navigation with alarm-optimized settings
 */
export function useAlarmNavigation() {
  return useSafeNavigation({
    defaultCooldown: 400, // Slightly longer for alarm interactions
    enableHaptics: true,
    trackNavigationState: true,
  });
}

/**
 * Hook for emergency/critical navigation with minimal cooldown
 * Use sparingly and only for time-sensitive navigation
 */
export function useEmergencyNavigation() {
  return useSafeNavigation({
    defaultCooldown: 100, // Minimal cooldown for emergencies
    enableHaptics: false, // No haptics for speed
    trackNavigationState: false, // No state tracking for performance
  });
}
