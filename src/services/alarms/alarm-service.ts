import { AudioTrack } from '../audio/types';
import {
  notificationService,
  AlarmNotification,
} from '../notifications/notification-service';
import { audioService } from '../audio/audio-service';
import { Audio } from 'expo-av';

export interface Alarm {
  id: string;
  time: Date;
  isActive: boolean;
  audioTrack: AudioTrack;
  repeatDays?: number[]; // 0 = Sunday, 1 = Monday, etc.
  label?: string;
  notificationIds?: string[]; // Store notification IDs for cancellation
}

export interface AlarmRingingState {
  alarmId: string;
  soundObject: Audio.Sound | null;
  isRinging: boolean;
}

export class AlarmService {
  private static instance: AlarmService;
  private currentRingingAlarm: AlarmRingingState | null = null;
  private isNavigatingToRingingScreen: boolean = false;
  private isOnRingingScreen: boolean = false;

  static getInstance(): AlarmService {
    if (!AlarmService.instance) {
      AlarmService.instance = new AlarmService();
    }
    return AlarmService.instance;
  }

  constructor() {
    this.setupNotificationListeners();
    this.setupAppStateListener();
  }

  /**
   * Initialize alarm service
   */
  async initialize(): Promise<void> {
    try {
      // Initialize notification service first
      await notificationService.initialize();

      // Configure audio for background playback
      await audioService.configureAudio();

      console.log('✅ AlarmService initialized');
    } catch (error) {
      console.error('❌ Failed to initialize AlarmService:', error);
      throw error;
    }
  }

  /**
   * Schedule alarm with both notification and background audio support
   */
  async scheduleAlarm(alarm: Alarm): Promise<void> {
    try {
      // Create notification data
      const alarmNotification: AlarmNotification = {
        id: alarm.id,
        title: alarm.label || 'Alarm',
        time: alarm.time,
        isActive: alarm.isActive,
        audioTrack: alarm.audioTrack,
        repeatDays: alarm.repeatDays,
      };

      // Schedule the notification
      const notificationId =
        await notificationService.scheduleAlarm(alarmNotification);

      // Store notification ID for later cancellation
      alarm.notificationIds = notificationId.split(',');

      console.log(`✅ Alarm scheduled: ${alarm.id}`);
    } catch (error) {
      console.error(`❌ Failed to schedule alarm ${alarm.id}:`, error);
      throw error;
    }
  }

  /**
   * Cancel scheduled alarm
   */
  async cancelAlarm(alarm: Alarm): Promise<void> {
    try {
      if (alarm.notificationIds) {
        // Cancel all related notifications
        for (const notificationId of alarm.notificationIds) {
          await notificationService.cancelAlarm(notificationId);
        }
      }

      // If this alarm is currently ringing, stop it
      if (this.currentRingingAlarm?.alarmId === alarm.id) {
        await this.stopRingingAlarm();
      }

      console.log(`✅ Alarm cancelled: ${alarm.id}`);
    } catch (error) {
      console.error(`❌ Failed to cancel alarm ${alarm.id}:`, error);
      throw error;
    }
  }

  /**
   * Update existing alarm
   */
  async updateAlarm(alarm: Alarm): Promise<void> {
    try {
      // Cancel existing alarm first
      await this.cancelAlarm(alarm);

      // Schedule new alarm if still active
      if (alarm.isActive) {
        await this.scheduleAlarm(alarm);
      }

      console.log(`✅ Alarm updated: ${alarm.id}`);
    } catch (error) {
      console.error(`❌ Failed to update alarm ${alarm.id}:`, error);
      throw error;
    }
  }

  /**
   * Start ringing alarm with background audio support
   */
  async startRingingAlarm(
    alarmId: string,
    audioTrack: AudioTrack
  ): Promise<void> {
    try {
      // Stop any currently ringing alarm
      if (this.currentRingingAlarm) {
        await this.stopRingingAlarm();
      }

      // Force audio configuration for background playback (always re-configure for alarms)
      console.log('🎵 Force-configuring audio for alarm playback');
      await audioService.configureAudio();

      // Load and play the alarm sound
      let soundObject: Audio.Sound;

      if (audioTrack.uri) {
        soundObject = await audioService.loadAudio(audioTrack.uri);
      } else {
        // Fallback to system default sound
        const { sound } = await Audio.Sound.createAsync(
          { uri: 'default' }, // Use system default notification sound
          {
            shouldPlay: false,
            isLooping: true,
            volume: 1.0,
          }
        );
        soundObject = sound;
      }

      // Start playing
      await audioService.playAlarmSound(soundObject);

      // Store current ringing state
      this.currentRingingAlarm = {
        alarmId,
        soundObject,
        isRinging: true,
      };

      console.log(`✅ Alarm started ringing: ${alarmId}`);
    } catch (error) {
      console.error(`❌ Failed to start ringing alarm ${alarmId}:`, error);
      throw error;
    }
  }

  /**
   * Stop currently ringing alarm
   */
  async stopRingingAlarm(): Promise<void> {
    try {
      if (!this.currentRingingAlarm) {
        console.log('⚠️ No alarm currently ringing');
        return;
      }

      const { soundObject, alarmId } = this.currentRingingAlarm;

      if (soundObject) {
        await audioService.stopAlarmSound(soundObject);
      }

      // Clear state
      this.currentRingingAlarm = null;
      this.isNavigatingToRingingScreen = false; // Reset navigation flag
      this.isOnRingingScreen = false; // Reset screen state flag

      console.log(`✅ Alarm stopped ringing: ${alarmId}`);
    } catch (error) {
      console.error('❌ Failed to stop ringing alarm:', error);

      // Force clear state even if stopping failed
      this.currentRingingAlarm = null;
      this.isNavigatingToRingingScreen = false; // Reset navigation flag
      this.isOnRingingScreen = false; // Reset screen state flag
      throw error;
    }
  }

  /**
   * Force stop all audio and clear alarm state (emergency cleanup)
   */
  async forceStopAllAlarms(): Promise<void> {
    try {
      console.log('🛑 Force stopping all alarms');

      // Stop any current audio
      if (this.currentRingingAlarm?.soundObject) {
        try {
          await audioService.stopAlarmSound(
            this.currentRingingAlarm.soundObject
          );
        } catch (error) {
          console.warn(
            '⚠️ Failed to stop alarm sound during force cleanup:',
            error
          );
        }
      }

      // Clear state
      this.currentRingingAlarm = null;
      this.isNavigatingToRingingScreen = false; // Reset navigation flag
      this.isOnRingingScreen = false; // Reset screen state flag

      // Also try to stop any orphaned audio
      try {
        await audioService.stopAllAudio();
      } catch (error) {
        console.warn(
          '⚠️ Failed to stop all audio during force cleanup:',
          error
        );
      }

      console.log('✅ Force cleanup completed');
    } catch (error) {
      console.error('❌ Force cleanup failed:', error);
      // Always clear state regardless
      this.currentRingingAlarm = null;
      this.isNavigatingToRingingScreen = false; // Reset navigation flag
      this.isOnRingingScreen = false; // Reset screen state flag
    }
  }

  /**
   * Snooze currently ringing alarm
   */
  async snoozeAlarm(snoozeMinutes: number = 5): Promise<void> {
    try {
      if (!this.currentRingingAlarm) {
        throw new Error('No alarm currently ringing to snooze');
      }

      const { alarmId } = this.currentRingingAlarm;

      // Stop current ringing
      await this.stopRingingAlarm();

      // Calculate snooze time
      const snoozeTime = new Date();
      snoozeTime.setMinutes(snoozeTime.getMinutes() + snoozeMinutes);

      // Create temporary snooze alarm
      const snoozeAlarmNotification: AlarmNotification = {
        id: `${alarmId}_snooze_${Date.now()}`,
        title: 'Snoozed Alarm',
        time: snoozeTime,
        isActive: true,
        audioTrack: {
          id: 'default',
          name: 'Default',
          uri: '',
          type: 'predefined',
        }, // Will use default sound
      };

      // Schedule snooze notification
      await notificationService.scheduleAlarm(snoozeAlarmNotification);

      console.log(`✅ Alarm snoozed for ${snoozeMinutes} minutes: ${alarmId}`);
    } catch (error) {
      console.error('❌ Failed to snooze alarm:', error);
      throw error;
    }
  }

  /**
   * Get current ringing alarm state
   */
  getCurrentRingingAlarm(): AlarmRingingState | null {
    return this.currentRingingAlarm;
  }

  /**
   * Check if any alarm is currently ringing
   */
  isAlarmRinging(): boolean {
    return this.currentRingingAlarm?.isRinging || false;
  }

  /**
   * Setup AppState listener to handle app becoming active during alarms
   */
  private setupAppStateListener(): void {
    const { AppState } = require('react-native');

    AppState.addEventListener('change', (nextAppState: string) => {
      console.log(`📱 AppState changed to: ${nextAppState}`);

      // When app becomes active, check if alarm is ringing
      if (nextAppState === 'active' && this.currentRingingAlarm) {
        console.log(
          `🔔 App became active during alarm: ${this.currentRingingAlarm.alarmId}`
        );
        console.log(
          `📍 Currently on ringing screen: ${this.isOnRingingScreen}`
        );
        console.log(
          `📍 Currently navigating: ${this.isNavigatingToRingingScreen}`
        );

        // Only navigate if we're not already on the ringing screen
        if (!this.isOnRingingScreen && !this.isNavigatingToRingingScreen) {
          console.log('🚀 Navigating to ringing screen...');

          // Small delay to ensure app is fully active before navigation
          setTimeout(() => {
            if (this.currentRingingAlarm && !this.isOnRingingScreen) {
              this.navigateToRingingScreen(this.currentRingingAlarm.alarmId);
            }
          }, 100);
        } else {
          console.log(
            '⚠️ Skipping navigation - already on ringing screen or navigating'
          );
        }
      }
    });
  }

  /**
   * Setup notification listeners for alarm events
   */
  private setupNotificationListeners(): void {
    // Listen for notification responses (when user taps notification)
    // This handles: user taps notification when app is backgrounded/killed
    notificationService.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      const alarmId = data?.alarmId;
      const audioTrack = data?.audioTrack;

      if (alarmId && audioTrack) {
        console.log('🔔 Alarm notification tapped (user action):', alarmId);
        this.handleAlarmTrigger(String(alarmId), audioTrack as any);
      }
    });

    // Listen for notifications received while app is in foreground
    // This handles: notification arrives when app is in foreground
    notificationService.addNotificationReceivedListener(notification => {
      const data = notification.request.content.data;
      const alarmId = data?.alarmId;
      const audioTrack = data?.audioTrack;

      if (alarmId && audioTrack) {
        // Check if app is in foreground state
        const { AppState } = require('react-native');
        if (AppState.currentState === 'active') {
          console.log('🔔 Alarm triggered in foreground:', alarmId);
          this.handleAlarmTrigger(String(alarmId), audioTrack as any);
        } else {
          // App is backgrounded - start background audio immediately
          console.log(
            '🔔 Alarm notification received in background - starting background audio:',
            alarmId
          );
          this.handleBackgroundAlarmTrigger(String(alarmId), audioTrack as any);
        }
      }
    });
  }

  /**
   * Handle alarm trigger (from notification or foreground)
   */
  private async handleAlarmTrigger(
    alarmId: string,
    audioTrack: AudioTrack
  ): Promise<void> {
    try {
      // Check if this alarm is already ringing - prevent duplicates
      if (this.currentRingingAlarm?.alarmId === alarmId) {
        console.log(
          '⚠️ Alarm already ringing, ignoring duplicate trigger:',
          alarmId
        );
        return;
      }

      // Check if any alarm is currently ringing - stop it first
      if (this.currentRingingAlarm) {
        console.log('🔄 Stopping current alarm before starting new one');
        await this.stopRingingAlarm();
      }

      // Start ringing the alarm
      await this.startRingingAlarm(alarmId, audioTrack);

      // Navigate to alarm ringing screen if possible
      this.navigateToRingingScreen(alarmId);
    } catch (error) {
      console.error('❌ Failed to handle alarm trigger:', error);
    }
  }

  /**
   * Handle background alarm trigger - focus on audio only
   */
  private async handleBackgroundAlarmTrigger(
    alarmId: string,
    audioTrack: AudioTrack
  ): Promise<void> {
    try {
      console.log('🔔 Starting background alarm audio:', alarmId);

      // Check if this alarm is already ringing - prevent duplicates
      if (this.currentRingingAlarm?.alarmId === alarmId) {
        console.log(
          '⚠️ Alarm already ringing in background, ignoring duplicate trigger:',
          alarmId
        );
        return;
      }

      // Ensure audio service is configured for background
      if (!audioService.isAudioConfigured()) {
        console.log('🎵 Configuring audio for background playback');
        await audioService.configureAudio();
      }

      // Start ringing ONLY - no navigation in background
      await this.startRingingAlarm(alarmId, audioTrack);

      console.log('✅ Background alarm audio started successfully:', alarmId);
    } catch (error) {
      console.error('❌ Failed to handle background alarm trigger:', error);

      // Fallback: try system default sound
      try {
        console.log('🔄 Attempting fallback with system default sound');
        const { Audio } = await import('expo-av');
        const { sound } = await Audio.Sound.createAsync(
          { uri: 'default' },
          { shouldPlay: true, isLooping: true, volume: 1.0 }
        );
        console.log('✅ Fallback alarm sound started');
      } catch (fallbackError) {
        console.error('❌ Even fallback alarm failed:', fallbackError);
      }
    }
  }

  /**
   * Navigate to alarm ringing screen with duplicate prevention
   */
  private navigateToRingingScreen(alarmId: string): void {
    try {
      // Prevent duplicate navigation
      if (this.isNavigatingToRingingScreen) {
        console.log(
          '⚠️ Already navigating to ringing screen, ignoring duplicate request'
        );
        return;
      }

      const { router } = require('expo-router');

      // More robust route checking
      try {
        const currentRoute = router?.state?.routes?.[router.state.index];
        const routeName = currentRoute?.name;
        console.log(`📍 Current route: ${routeName}`);

        if (routeName === 'alarms/ringing') {
          console.log(
            '⚠️ Already on ringing screen, updating state and skipping navigation'
          );
          this.isOnRingingScreen = true;
          return;
        }
      } catch (routerError) {
        console.log(
          '⚠️ Could not check current route, proceeding with navigation'
        );
      }

      this.isNavigatingToRingingScreen = true;

      // Use replace to prevent stacking multiple alarm screens
      router.replace(`/alarms/ringing?alarmId=${alarmId}`);
      console.log(`📱 Navigating to alarm screen: ${alarmId}`);

      // Set that we're now on the ringing screen
      this.isOnRingingScreen = true;

      // Reset navigation flag after navigation completes
      setTimeout(() => {
        this.isNavigatingToRingingScreen = false;
      }, 1000);
    } catch (error) {
      console.error('❌ Failed to navigate to ringing screen:', error);
      this.isNavigatingToRingingScreen = false;
      // Navigation failed, but alarm should still ring via background audio
    }
  }

  /**
   * Get all scheduled alarm notifications
   */
  async getScheduledAlarms(): Promise<any[]> {
    try {
      return await notificationService.getAllScheduledAlarms();
    } catch (error) {
      console.error('❌ Failed to get scheduled alarms:', error);
      return [];
    }
  }

  /**
   * Cancel all alarms
   */
  async cancelAllAlarms(): Promise<void> {
    try {
      await notificationService.cancelAllAlarms();

      // Stop any currently ringing alarm
      if (this.currentRingingAlarm) {
        await this.stopRingingAlarm();
      }

      console.log('✅ All alarms cancelled');
    } catch (error) {
      console.error('❌ Failed to cancel all alarms:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const alarmService = AlarmService.getInstance();
