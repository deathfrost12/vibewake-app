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

  static getInstance(): AlarmService {
    if (!AlarmService.instance) {
      AlarmService.instance = new AlarmService();
    }
    return AlarmService.instance;
  }

  constructor() {
    this.setupNotificationListeners();
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

      // Ensure audio is configured for background playback
      if (!audioService.isAudioConfigured()) {
        await audioService.configureAudio();
      }

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

      this.currentRingingAlarm = null;

      console.log(`✅ Alarm stopped ringing: ${alarmId}`);
    } catch (error) {
      console.error('❌ Failed to stop ringing alarm:', error);
      throw error;
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
   * Setup notification listeners for alarm events
   */
  private setupNotificationListeners(): void {
    // Listen for notification responses (when user taps notification)
    notificationService.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      const alarmId = data?.alarmId;
      const audioTrack = data?.audioTrack;

      if (alarmId && audioTrack) {
        console.log('🔔 Alarm notification tapped:', alarmId);
        this.handleAlarmTrigger(String(alarmId), audioTrack as any);
      }
    });

    // Listen for notifications received while app is in foreground
    notificationService.addNotificationReceivedListener(notification => {
      const data = notification.request.content.data;
      const alarmId = data?.alarmId;
      const audioTrack = data?.audioTrack;

      if (alarmId && audioTrack) {
        console.log('🔔 Alarm triggered in foreground:', alarmId);
        this.handleAlarmTrigger(String(alarmId), audioTrack as any);
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
      // Start ringing the alarm
      await this.startRingingAlarm(alarmId, audioTrack);

      // Navigate to alarm ringing screen if possible
      this.navigateToRingingScreen(alarmId);
    } catch (error) {
      console.error('❌ Failed to handle alarm trigger:', error);
    }
  }

  /**
   * Navigate to alarm ringing screen
   */
  private navigateToRingingScreen(alarmId: string): void {
    try {
      const { router } = require('expo-router');
      router.push(`/alarms/ringing?alarmId=${alarmId}`);
    } catch (error) {
      console.error('❌ Failed to navigate to ringing screen:', error);
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
