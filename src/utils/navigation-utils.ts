import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface NavigationState {
  isNavigating: boolean;
  lastNavigationTime: number;
  cooldownDuration: number;
}

class NavigationManager {
  private static instance: NavigationManager;
  private state: NavigationState;
  private pendingTimeout: ReturnType<typeof setTimeout> | null = null;

  private constructor() {
    this.state = {
      isNavigating: false,
      lastNavigationTime: 0,
      cooldownDuration: 300, // 300ms default cooldown
    };
  }

  static getInstance(): NavigationManager {
    if (!NavigationManager.instance) {
      NavigationManager.instance = new NavigationManager();
    }
    return NavigationManager.instance;
  }

  /**
   * Set custom cooldown duration for navigation debouncing
   */
  setCooldownDuration(duration: number): void {
    this.state.cooldownDuration = duration;
  }

  /**
   * Check if navigation is currently allowed
   */
  private canNavigate(): boolean {
    const now = Date.now();
    const timeSinceLastNav = now - this.state.lastNavigationTime;

    if (this.state.isNavigating) {
      console.log('🚫 Navigation blocked: Currently navigating');
      return false;
    }

    if (timeSinceLastNav < this.state.cooldownDuration) {
      console.log(
        `🚫 Navigation blocked: Cooldown active (${this.state.cooldownDuration - timeSinceLastNav}ms remaining)`
      );
      return false;
    }

    return true;
  }

  /**
   * Set navigation state and cooldown
   */
  private setNavigationState(isNavigating: boolean): void {
    this.state.isNavigating = isNavigating;
    this.state.lastNavigationTime = Date.now();

    // Clear any pending timeout
    if (this.pendingTimeout) {
      clearTimeout(this.pendingTimeout);
    }

    // Auto-reset navigation state after cooldown
    if (isNavigating) {
      this.pendingTimeout = setTimeout(() => {
        this.state.isNavigating = false;
        console.log('✅ Navigation state auto-reset');
      }, this.state.cooldownDuration);
    }
  }

  /**
   * Safe navigation with debouncing - replaces router.push()
   */
  async safeNavigate(
    href: string,
    options?: {
      hapticFeedback?: boolean;
      customCooldown?: number;
      bypassCooldown?: boolean;
    }
  ): Promise<boolean> {
    const {
      hapticFeedback = true,
      customCooldown,
      bypassCooldown = false,
    } = options || {};

    // Set custom cooldown if provided
    if (customCooldown) {
      const originalCooldown = this.state.cooldownDuration;
      this.setCooldownDuration(customCooldown);

      // Reset to original after this navigation
      setTimeout(() => {
        this.setCooldownDuration(originalCooldown);
      }, customCooldown + 100);
    }

    // Check if navigation is allowed (unless bypassed)
    if (!bypassCooldown && !this.canNavigate()) {
      return false;
    }

    try {
      // Provide haptic feedback to user
      if (hapticFeedback) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Set navigation state
      this.setNavigationState(true);

      console.log(`🚀 Safe navigation to: ${href}`);

      // Perform navigation
      router.push(href as any);

      return true;
    } catch (error) {
      console.error('❌ Safe navigation failed:', error);
      this.setNavigationState(false);
      return false;
    }
  }

  /**
   * Safe replace navigation with debouncing - replaces router.replace()
   */
  async safeReplace(
    href: string,
    options?: {
      hapticFeedback?: boolean;
      customCooldown?: number;
      bypassCooldown?: boolean;
    }
  ): Promise<boolean> {
    const {
      hapticFeedback = true,
      customCooldown,
      bypassCooldown = false,
    } = options || {};

    // Set custom cooldown if provided
    if (customCooldown) {
      const originalCooldown = this.state.cooldownDuration;
      this.setCooldownDuration(customCooldown);

      // Reset to original after this navigation
      setTimeout(() => {
        this.setCooldownDuration(originalCooldown);
      }, customCooldown + 100);
    }

    // Check if navigation is allowed (unless bypassed)
    if (!bypassCooldown && !this.canNavigate()) {
      return false;
    }

    try {
      // Provide haptic feedback to user
      if (hapticFeedback) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Set navigation state
      this.setNavigationState(true);

      console.log(`🔄 Safe replace navigation to: ${href}`);

      // Perform navigation
      router.replace(href as any);

      return true;
    } catch (error) {
      console.error('❌ Safe replace navigation failed:', error);
      this.setNavigationState(false);
      return false;
    }
  }

  /**
   * Safe back navigation with debouncing - replaces router.back()
   */
  async safeGoBack(options?: {
    hapticFeedback?: boolean;
    customCooldown?: number;
    bypassCooldown?: boolean;
  }): Promise<boolean> {
    const {
      hapticFeedback = true,
      customCooldown,
      bypassCooldown = false,
    } = options || {};

    // Set custom cooldown if provided
    if (customCooldown) {
      const originalCooldown = this.state.cooldownDuration;
      this.setCooldownDuration(customCooldown);

      // Reset to original after this navigation
      setTimeout(() => {
        this.setCooldownDuration(originalCooldown);
      }, customCooldown + 100);
    }

    // Check if navigation is allowed (unless bypassed)
    if (!bypassCooldown && !this.canNavigate()) {
      return false;
    }

    try {
      // Provide haptic feedback to user
      if (hapticFeedback) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Set navigation state
      this.setNavigationState(true);

      console.log('⬅️ Safe back navigation');

      // Perform navigation
      router.back();

      return true;
    } catch (error) {
      console.error('❌ Safe back navigation failed:', error);
      this.setNavigationState(false);
      return false;
    }
  }

  /**
   * Get current navigation state (useful for UI feedback)
   */
  getNavigationState(): Readonly<NavigationState> {
    return { ...this.state };
  }

  /**
   * Force reset navigation state (emergency use only)
   */
  forceReset(): void {
    console.log('🛑 Force resetting navigation state');
    this.state.isNavigating = false;
    this.state.lastNavigationTime = 0;

    if (this.pendingTimeout) {
      clearTimeout(this.pendingTimeout);
      this.pendingTimeout = null;
    }
  }
}

// Export singleton instance and utility functions
export const navigationManager = NavigationManager.getInstance();

// Convenience functions for easy usage
export const safeNavigate = (
  href: string,
  options?: Parameters<typeof navigationManager.safeNavigate>[1]
) => navigationManager.safeNavigate(href, options);

export const safeReplace = (
  href: string,
  options?: Parameters<typeof navigationManager.safeReplace>[1]
) => navigationManager.safeReplace(href, options);

export const safeGoBack = (
  options?: Parameters<typeof navigationManager.safeGoBack>[0]
) => navigationManager.safeGoBack(options);

// Export types for external usage
export type { NavigationState };
