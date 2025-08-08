import { Platform } from 'react-native';

// AlarmKit types - fallback definitions when module is not available
export type AlarmKitAuthorizationStatus = {
  granted: boolean;
  status: 'notDetermined' | 'authorized' | 'denied' | 'unavailable';
};

// Dynamic import fallback for AlarmKit module
let ExpoAlarmkit: any = null;
try {
  // This will fail gracefully if module is not available
  ExpoAlarmkit = require('../../../modules/expo-alarmkit');
} catch {
  console.log('💡 AlarmKit module not available - using fallback auth mode');
}

export interface AlarmKitAuthService {
  isAvailable(): Promise<boolean>;
  getAuthorizationStatus(): Promise<AlarmKitAuthorizationStatus>;
  requestAuthorization(): Promise<boolean>;
  checkPermissions(): Promise<boolean>;
}

class AlarmKitAuthorizationService implements AlarmKitAuthService {
  private static instance: AlarmKitAuthorizationService;
  private initialized = false;

  static getInstance(): AlarmKitAuthorizationService {
    if (!AlarmKitAuthorizationService.instance) {
      AlarmKitAuthorizationService.instance =
        new AlarmKitAuthorizationService();
    }
    return AlarmKitAuthorizationService.instance;
  }

  /**
   * Check if AlarmKit is available on this device
   */
  async isAvailable(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return false;
    }

    // Check if ExpoAlarmkit module was loaded successfully
    if (!ExpoAlarmkit) {
      return false;
    }

    try {
      const available = await ExpoAlarmkit.isAvailable();
      return available === true; // Ensure boolean return
    } catch (error) {
      console.warn('⚠️ Failed to check AlarmKit availability:', error);
      return false;
    }
  }

  /**
   * Get current authorization status
   */
  async getAuthorizationStatus(): Promise<AlarmKitAuthorizationStatus> {
    if (!(await this.isAvailable())) {
      return {
        granted: false,
        status: 'unavailable',
      };
    }

    if (!ExpoAlarmkit) {
      return {
        granted: false,
        status: 'unavailable',
      };
    }

    try {
      const status = await ExpoAlarmkit.getAuthorizationStatus();
      return status;
    } catch (error) {
      console.error('❌ Failed to get AlarmKit authorization status:', error);
      return {
        granted: false,
        status: 'denied',
      };
    }
  }

  /**
   * Request AlarmKit authorization from the user
   */
  async requestAuthorization(): Promise<boolean> {
    if (!(await this.isAvailable())) {
      console.log('💡 AlarmKit not available, cannot request authorization');
      return false;
    }

    if (!ExpoAlarmkit) {
      console.log(
        '💡 AlarmKit module not loaded, cannot request authorization'
      );
      return false;
    }

    try {
      console.log('🔐 Requesting AlarmKit authorization...');
      const granted = await ExpoAlarmkit.requestAuthorization();

      if (granted) {
        console.log('✅ AlarmKit authorization granted');
      } else {
        console.log('❌ AlarmKit authorization denied');
      }

      return granted === true; // Ensure boolean return
    } catch (error) {
      console.error('❌ Failed to request AlarmKit authorization:', error);
      return false;
    }
  }

  /**
   * Check if we have the necessary permissions
   * This is a convenience method that combines availability and authorization
   */
  async checkPermissions(): Promise<boolean> {
    if (!(await this.isAvailable())) {
      return false;
    }

    const status = await this.getAuthorizationStatus();
    return status.granted;
  }

  /**
   * Initialize the service (can be called multiple times safely)
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      console.log('🚀 Initializing AlarmKit authorization service...');

      const available = await this.isAvailable();
      if (available) {
        const status = await this.getAuthorizationStatus();
        console.log(
          `📊 AlarmKit initialized - Available: ${available}, Authorized: ${status.granted}`
        );
      } else {
        console.log('📊 AlarmKit not available on this device');
      }

      this.initialized = true;
    } catch (error) {
      console.error(
        '❌ Failed to initialize AlarmKit authorization service:',
        error
      );
      throw error;
    }
  }

  /**
   * Get user-friendly status message
   */
  async getStatusMessage(): Promise<string> {
    if (!(await this.isAvailable())) {
      return 'AlarmKit is not available on this device (requires iOS 26+)';
    }

    const status = await this.getAuthorizationStatus();

    switch (status.status) {
      case 'authorized':
        return 'Native iOS alarms are enabled and ready to use';
      case 'denied':
        return 'Native iOS alarms are disabled. Enable in Settings > Privacy & Security > Alarms';
      case 'notDetermined':
        return 'Native iOS alarms require permission. Tap to enable enhanced reliability';
      default:
        return 'Native iOS alarm status unknown';
    }
  }

  /**
   * Check if we should show onboarding for AlarmKit
   */
  async shouldShowOnboarding(): Promise<boolean> {
    if (!(await this.isAvailable())) {
      return false; // Don't show onboarding if not available
    }

    const status = await this.getAuthorizationStatus();
    return status.status === 'notDetermined';
  }

  /**
   * Check if AlarmKit can be used for scheduling alarms
   */
  async canScheduleAlarms(): Promise<boolean> {
    return await this.checkPermissions();
  }
}

// Export singleton instance
export const alarmKitAuthService = AlarmKitAuthorizationService.getInstance();
