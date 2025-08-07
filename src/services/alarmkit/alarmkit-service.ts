import { Platform } from 'react-native';
import { alarmKitAuthService } from './alarmkit-auth-service';
import type { Alarm } from '../../types/alarm';
import type { AudioTrack } from '../audio/types';

// AlarmKit types - fallback definitions when module is not available
export type NativeAlarm = {
  id: string;
  title: string;
  date: number; // Timestamp in milliseconds
  soundName?: string;
  repeatDays?: number[];
  isActive: boolean;
};

export type AlarmKitEventListener = (event: {
  type: string;
  alarmId: string;
  timestamp: number;
}) => void;

// Dynamic import fallback for AlarmKit module
let ExpoAlarmkit: any = null;
try {
  // This will fail gracefully if module is not available
  ExpoAlarmkit = require('../../../modules/expo-alarmkit');
} catch {
  console.log('💡 AlarmKit module not available - using fallback mode');
}

export interface AlarmKitService {
  initialize(): Promise<void>;
  scheduleNativeAlarm(alarm: Alarm): Promise<string>;
  cancelNativeAlarm(alarmId: string): Promise<void>;
  cancelAllNativeAlarms(): Promise<void>;
  getScheduledNativeAlarms(): Promise<NativeAlarm[]>;
  isAlarmKitAvailable(): Promise<boolean>;
  canUseAlarmKit(): Promise<boolean>;
}

class AlarmKitManagementService implements AlarmKitService {
  private static instance: AlarmKitManagementService;
  private initialized = false;
  private eventListeners: Array<{
    listener: AlarmKitEventListener;
    subscription: any;
  }> = [];

  static getInstance(): AlarmKitManagementService {
    if (!AlarmKitManagementService.instance) {
      AlarmKitManagementService.instance = new AlarmKitManagementService();
    }
    return AlarmKitManagementService.instance;
  }

  /**
   * Initialize AlarmKit service
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      console.log('🚀 Initializing AlarmKit service...');

      // Initialize auth service first
      await alarmKitAuthService.initialize();

      // Setup event listeners if available
      if (await this.isAlarmKitAvailable()) {
        await this.setupEventListeners();
        console.log('✅ AlarmKit service initialized successfully');
      } else {
        console.log(
          '💡 AlarmKit not available - service initialized in fallback mode'
        );
      }

      this.initialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize AlarmKit service:', error);
      throw error;
    }
  }

  /**
   * Check if AlarmKit is available
   */
  async isAlarmKitAvailable(): Promise<boolean> {
    return await alarmKitAuthService.isAvailable();
  }

  /**
   * Check if we can use AlarmKit (available + authorized)
   */
  async canUseAlarmKit(): Promise<boolean> {
    return await alarmKitAuthService.canScheduleAlarms();
  }

  /**
   * Convert our Alarm type to AlarmKit NativeAlarm format
   */
  private convertToNativeAlarm(alarm: Alarm): NativeAlarm {
    const alarmData = {
      id: alarm.id,
      title: alarm.title || 'Alarm',
      date: alarm.time.getTime(), // Convert Date to timestamp (milliseconds)
      soundName: this.getSoundNameFromAudioTrack(alarm.audioTrack),
      repeatDays: alarm.repeatDays,
      isActive: alarm.isActive,
    };
    
    console.log(`📱 Converting alarm to native format:`, {
      id: alarmData.id,
      title: alarmData.title,
      timestamp: alarmData.date,
      scheduledDate: alarm.time.toISOString(),
      soundName: alarmData.soundName,
      isActive: alarmData.isActive
    });
    
    return alarmData;
  }

  /**
   * Extract sound name from AudioTrack for AlarmKit
   */
  private getSoundNameFromAudioTrack(
    audioTrack: AudioTrack
  ): string | undefined {
    if (audioTrack.type === 'predefined') {
      return audioTrack.id; // Use predefined sound ID
    }
    // For uploaded or Spotify tracks, AlarmKit will use default sound
    // Custom sounds require different handling in AlarmKit
    return undefined;
  }

  /**
   * Schedule a native alarm using AlarmKit
   */
  async scheduleNativeAlarm(alarm: Alarm): Promise<string> {
    if (!ExpoAlarmkit || !(await this.canUseAlarmKit())) {
      throw new Error('AlarmKit is not available or not authorized');
    }

    try {
      console.log(`📅 Scheduling native alarm with AlarmKit: ${alarm.id}`);

      const nativeAlarm = this.convertToNativeAlarm(alarm);
      const alarmId = await ExpoAlarmkit.scheduleAlarm(nativeAlarm);

      console.log(`✅ Native alarm scheduled successfully: ${alarmId}`);
      return alarmId;
    } catch (error) {
      console.error(`❌ Failed to schedule native alarm ${alarm.id}:`, error);
      throw new Error(`Failed to schedule native alarm: ${error}`);
    }
  }

  /**
   * Cancel a native alarm
   */
  async cancelNativeAlarm(alarmId: string): Promise<void> {
    if (!ExpoAlarmkit || !(await this.isAlarmKitAvailable())) {
      console.log(
        '💡 AlarmKit not available, skipping native alarm cancellation'
      );
      return;
    }

    try {
      console.log(`🗑️ Cancelling native alarm: ${alarmId}`);
      await ExpoAlarmkit.cancelAlarm(alarmId);
      console.log(`✅ Native alarm cancelled successfully: ${alarmId}`);
    } catch (error) {
      console.error(`❌ Failed to cancel native alarm ${alarmId}:`, error);
      throw new Error(`Failed to cancel native alarm: ${error}`);
    }
  }

  /**
   * Cancel all native alarms
   */
  async cancelAllNativeAlarms(): Promise<void> {
    if (!ExpoAlarmkit || !(await this.isAlarmKitAvailable())) {
      console.log(
        '💡 AlarmKit not available, skipping native alarm cancellation'
      );
      return;
    }

    try {
      console.log('🗑️ Cancelling all native alarms...');
      await ExpoAlarmkit.cancelAllAlarms();
      console.log('✅ All native alarms cancelled successfully');
    } catch (error) {
      console.error('❌ Failed to cancel all native alarms:', error);
      throw new Error(`Failed to cancel all native alarms: ${error}`);
    }
  }

  /**
   * Get all scheduled native alarms
   */
  async getScheduledNativeAlarms(): Promise<NativeAlarm[]> {
    if (!ExpoAlarmkit || !(await this.isAlarmKitAvailable())) {
      return [];
    }

    try {
      const alarms = await ExpoAlarmkit.getScheduledAlarms();
      console.log(`📋 Retrieved ${alarms.length} scheduled native alarms`);
      return alarms;
    } catch (error) {
      console.error('❌ Failed to get scheduled native alarms:', error);
      return [];
    }
  }

  /**
   * Setup AlarmKit event listeners
   */
  private async setupEventListeners(): Promise<void> {
    try {
      console.log('🔧 Setting up AlarmKit event listeners...');

      const alarmEventListener: AlarmKitEventListener = event => {
        console.log('🔔 AlarmKit event received:', event);

        // Handle different event types
        switch (event.type) {
          case 'triggered':
            this.handleAlarmTriggered(event.alarmId);
            break;
          case 'stopped':
            this.handleAlarmStopped(event.alarmId);
            break;
          case 'snoozed':
            this.handleAlarmSnoozed(event.alarmId);
            break;
          default:
            console.log('📊 Unknown AlarmKit event type:', event.type);
        }
      };

      const subscription =
        ExpoAlarmkit?.addAlarmEventListener?.(alarmEventListener);
      this.eventListeners.push({ listener: alarmEventListener, subscription });

      console.log('✅ AlarmKit event listeners setup completed');
    } catch (error) {
      console.error('❌ Failed to setup AlarmKit event listeners:', error);
    }
  }

  /**
   * Handle alarm triggered event
   */
  private handleAlarmTriggered(alarmId: string): void {
    console.log(`🔔 Native alarm triggered: ${alarmId}`);

    // Emit custom event that our app can listen to
    // This integrates with our existing alarm handling system
    this.emitAlarmEvent('alarm_triggered', alarmId);
  }

  /**
   * Handle alarm stopped event
   */
  private handleAlarmStopped(alarmId: string): void {
    console.log(`⏹️ Native alarm stopped: ${alarmId}`);
    this.emitAlarmEvent('alarm_stopped', alarmId);
  }

  /**
   * Handle alarm snoozed event
   */
  private handleAlarmSnoozed(alarmId: string): void {
    console.log(`😴 Native alarm snoozed: ${alarmId}`);
    this.emitAlarmEvent('alarm_snoozed', alarmId);
  }

  /**
   * Emit custom alarm events for our app to handle
   */
  private emitAlarmEvent(eventType: string, alarmId: string): void {
    // This could be integrated with our existing event system
    // For now, just log the event
    console.log(`📡 Emitting alarm event: ${eventType} for alarm ${alarmId}`);

    // In a full implementation, this would dispatch to our alarm service
    // or use React Native's EventEmitter to notify the app
  }

  /**
   * Clean up event listeners
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up AlarmKit service...');

    for (const { subscription } of this.eventListeners) {
      try {
        ExpoAlarmkit?.removeAlarmEventListener?.(subscription);
      } catch (error) {
        console.warn('⚠️ Failed to remove AlarmKit event listener:', error);
      }
    }

    this.eventListeners = [];
    this.initialized = false;
    console.log('✅ AlarmKit service cleanup completed');
  }

  /**
   * Get diagnostic information about AlarmKit
   */
  async getDiagnosticInfo(): Promise<{
    available: boolean;
    authorized: boolean;
    version: string;
    scheduledAlarmsCount: number;
  }> {
    const available = await this.isAlarmKitAvailable();
    const authorized = await this.canUseAlarmKit();
    let version = 'N/A';
    let scheduledAlarmsCount = 0;

    if (available && ExpoAlarmkit) {
      try {
        version = await ExpoAlarmkit.getVersion();
        const alarms = await this.getScheduledNativeAlarms();
        scheduledAlarmsCount = alarms.length;
      } catch (error) {
        console.warn('⚠️ Failed to get AlarmKit diagnostic info:', error);
      }
    }

    return {
      available,
      authorized,
      version,
      scheduledAlarmsCount,
    };
  }
}

// Export singleton instance
export const alarmKitService = AlarmKitManagementService.getInstance();
