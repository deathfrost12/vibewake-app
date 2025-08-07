import { Platform, AppState } from 'react-native';
import { AudioTrack } from '../audio/types';
import { Alarm, AlarmNotification } from '../../types/alarm';
import { notificationService } from '../notifications/notification-service';
import { AudioManager } from '../audio/AudioManager';
import { audioService } from '../audio/audio-service';
import { backgroundAlarmService } from '../background/background-alarm-service';
import { Audio } from 'expo-av';
import { safeReplace } from '../../utils/navigation-utils';
import { alarmKitService } from '../alarmkit/alarmkit-service';
import { alarmKitAuthService } from '../alarmkit/alarmkit-auth-service';

// Alarm interface is now imported from types/alarm.ts

export interface AlarmRingingState {
  alarmId: string;
  soundObject: Audio.Sound | null;
  isRinging: boolean;
}

export interface AlarmDetectionResult {
  isRinging: boolean;
  alarmId?: string;
  audioTrack?: AudioTrack;
  source: 'internal_state' | 'scheduled_notifications' | 'not_found';
}

export class AlarmService {
  private static instance: AlarmService;
  private currentRingingAlarm: AlarmRingingState | null = null;
  private isNavigatingToRingingScreen: boolean = false;
  private isOnRingingScreen: boolean = false;
  private alarmKitAvailable: boolean = false;
  private backgroundAlarmEnabled: boolean = true; // Enable silent loop background alarms
  private useHybridMode: boolean = true; // Use both background audio and notifications

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
   * Check if we should use AlarmKit for native iOS alarms
   */
  private async shouldUseAlarmKit(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return false;
    }

    // Check if AlarmKit is available and authorized
    const canUse = await alarmKitService.canUseAlarmKit();
    console.log(`🔍 DEBUG: shouldUseAlarmKit = ${canUse}`);
    return canUse;
  }

  /**
   * Check if AlarmKit is available (but may not be authorized)
   */
  private async isAlarmKitAvailable(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return false;
    }

    return await alarmKitService.isAlarmKitAvailable();
  }

  /**
   * Initialize alarm service with new background alarm support
   */
  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing AlarmService with background alarm support...');

      // Initialize notification service first
      await notificationService.initialize();

      // Configure audio service
      await audioService.configureAudio();

      // Initialize background alarm service for silent loop support
      if (this.backgroundAlarmEnabled) {
        try {
          await backgroundAlarmService.initialize({
            enableSilentLoop: true,
            batteryOptimized: false, // Full power for alarm reliability
            fallbackToNotifications: true,
          });
          console.log('✅ Background alarm service initialized');
        } catch (backgroundError) {
          console.warn('⚠️ Failed to initialize background alarms, using notifications only:', backgroundError);
          this.backgroundAlarmEnabled = false;
        }
      }

      // Initialize AlarmKit as additional fallback (if available)
      try {
        await alarmKitService.initialize();
        this.alarmKitAvailable = await this.isAlarmKitAvailable();

        if (this.alarmKitAvailable) {
          const canUse = await this.shouldUseAlarmKit();
          console.log(
            `✅ AlarmKit initialized - Available: ${this.alarmKitAvailable}, Can use: ${canUse}`
          );
        } else {
          console.log(
            '💡 AlarmKit not available - using background audio + notifications'
          );
        }
      } catch (alarmKitError) {
        console.warn(
          '⚠️ Failed to initialize AlarmKit, using background audio + notifications:',
          alarmKitError
        );
        this.alarmKitAvailable = false;
      }

      console.log('✅ AlarmService initialized with hybrid background alarm system');
    } catch (error) {
      console.error('❌ Failed to initialize AlarmService:', error);
      throw error;
    }
  }

  /**
   * Schedule alarm with hybrid background audio + notification approach
   */
  async scheduleAlarm(alarm: Alarm): Promise<void> {
    try {
      console.log(`🔔 Scheduling alarm with hybrid approach: ${alarm.id}`);

      // Strategy selection based on availability and configuration
      let primaryStrategy: 'background-audio' | 'alarmkit' | 'notifications' = 'notifications';
      
      if (this.backgroundAlarmEnabled && Platform.OS === 'ios') {
        primaryStrategy = 'background-audio';
      } else if (await this.shouldUseAlarmKit()) {
        primaryStrategy = 'alarmkit';
      }

      console.log(`📋 Using primary strategy: ${primaryStrategy} for alarm ${alarm.id}`);

      // Primary strategy: Background Audio with Silent Loop (iOS only)
      if (primaryStrategy === 'background-audio') {
        try {
          console.log(`🔇 Scheduling background audio alarm: ${alarm.id}`);
          
          // For background audio, we still need notifications as triggers
          // But we'll use silent loop to keep audio session alive
          await this.scheduleWithBackgroundAudio(alarm);
          
          alarm.isNativeAlarm = false;
          alarm.backgroundAudioEnabled = true;
          
          console.log(`✅ Background audio alarm scheduled: ${alarm.id}`);
          return;
        } catch (backgroundError) {
          console.warn(
            `⚠️ Background audio scheduling failed for ${alarm.id}, trying AlarmKit:`,
            backgroundError
          );
          // Fall through to AlarmKit
        }
      }

      // Fallback 1: Try AlarmKit if available and authorized
      if (primaryStrategy === 'alarmkit' || (primaryStrategy === 'background-audio' && await this.shouldUseAlarmKit())) {
        try {
          console.log(`🚀 Scheduling alarm with AlarmKit: ${alarm.id}`);
          const nativeAlarmId = await alarmKitService.scheduleNativeAlarm(alarm);

          // Store AlarmKit ID for tracking
          alarm.nativeAlarmId = nativeAlarmId;
          alarm.isNativeAlarm = true;
          alarm.backgroundAudioEnabled = false;

          console.log(`✅ Native alarm scheduled: ${alarm.id} -> ${nativeAlarmId}`);
          return;
        } catch (alarmKitError) {
          console.warn(
            `⚠️ AlarmKit scheduling failed for ${alarm.id}, falling back to notifications:`,
            alarmKitError
          );
          // Fall through to notification scheduling
        }
      }

      // Fallback 2: Standard expo-notifications
      console.log(`📱 Scheduling alarm with notifications: ${alarm.id}`);
      await this.scheduleWithNotifications(alarm);
      
      alarm.isNativeAlarm = false;
      alarm.backgroundAudioEnabled = false;

      console.log(`✅ Notification alarm scheduled: ${alarm.id}`);
    } catch (error) {
      console.error(`❌ Failed to schedule alarm ${alarm.id}:`, error);
      throw error;
    }
  }

  /**
   * Schedule alarm with background audio support (silent loop method)
   */
  private async scheduleWithBackgroundAudio(alarm: Alarm): Promise<void> {
    // Create notification data with background audio flag
    const alarmNotification: AlarmNotification = {
      id: alarm.id,
      title: alarm.title || 'Alarm',
      time: alarm.time,
      isActive: alarm.isActive,
      audioTrack: alarm.audioTrack,
      repeatDays: alarm.repeatDays,
      useBackgroundAudio: true, // Flag for background audio handling
    };

    // Schedule the notification (this will trigger the background audio system)
    const notificationId = await notificationService.scheduleAlarm(alarmNotification);
    alarm.notificationIds = notificationId.split(',');

    // Pre-start silent loop if app is in foreground and alarm is soon
    if (AppState.currentState === 'active') {
      const timeUntilAlarm = alarm.time.getTime() - Date.now();
      const preStartWindow = 10 * 60 * 1000; // 10 minutes before

      if (timeUntilAlarm <= preStartWindow && timeUntilAlarm > 0) {
        console.log(`🔇 Pre-starting silent loop for imminent alarm: ${alarm.id}`);
        try {
          await backgroundAlarmService.startSilentLoop();
          console.log('✅ Silent loop pre-started for alarm reliability');
        } catch (error) {
          console.warn('⚠️ Failed to pre-start silent loop:', error);
          // Continue without pre-start - alarm will still work
        }
      }
    }
  }

  /**
   * Schedule alarm with standard notifications
   */
  private async scheduleWithNotifications(alarm: Alarm): Promise<void> {
    const alarmNotification: AlarmNotification = {
      id: alarm.id,
      title: alarm.title || 'Alarm',
      time: alarm.time,
      isActive: alarm.isActive,
      audioTrack: alarm.audioTrack,
      repeatDays: alarm.repeatDays,
      useBackgroundAudio: false,
    };

    const notificationId = await notificationService.scheduleAlarm(alarmNotification);
    alarm.notificationIds = notificationId.split(',');
  }

  /**
   * Cancel scheduled alarm
   */
  async cancelAlarm(alarm: Alarm): Promise<void> {
    try {
      // Cancel native alarm if it exists
      if (alarm.isNativeAlarm && alarm.nativeAlarmId) {
        try {
          console.log(
            `🗑️ Cancelling native alarm: ${alarm.id} -> ${alarm.nativeAlarmId}`
          );
          await alarmKitService.cancelNativeAlarm(alarm.nativeAlarmId);
          console.log(`✅ Native alarm cancelled: ${alarm.id}`);
        } catch (alarmKitError) {
          console.warn(
            `⚠️ Failed to cancel native alarm ${alarm.id}:`,
            alarmKitError
          );
        }
      }

      // Cancel notification alarms
      if (alarm.notificationIds) {
        // Cancel all related notifications
        for (const notificationId of alarm.notificationIds) {
          await notificationService.cancelAlarm(notificationId);
        }
        console.log(`✅ Notification alarm cancelled: ${alarm.id}`);
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
   * Start ringing alarm with enhanced background audio support
   */
  async startRingingAlarm(
    alarmId: string,
    audioTrack: AudioTrack,
    useBackgroundAudio: boolean = false
  ): Promise<void> {
    try {
      // Stop any currently ringing alarm
      if (this.currentRingingAlarm) {
        await this.stopRingingAlarm();
      }

      console.log(`🎵 Starting alarm: ${alarmId} (background: ${useBackgroundAudio})`);

      // If using background audio system and silent loop is available
      if (useBackgroundAudio && this.backgroundAlarmEnabled && Platform.OS === 'ios') {
        await this.startRingingAlarmWithBackgroundAudio(alarmId, audioTrack);
        return;
      }

      // Standard approach with AudioManager
      console.log(`🎵 Starting alarm with AudioManager: ${alarmId}`);
      const result = await AudioManager.playAlarmAudio({
        preferredTrack: audioTrack,
        fallbackSoundId: 'alarm-classic',
        onSpotifyPlayerNeeded: track => {
          console.log('🎵 Spotify player needed for:', track.name);
        },
        onPlaybackFailed: (error, fallbackUsed) => {
          console.warn(
            '⚠️ Audio playback issue:',
            error.message,
            'Used fallback:',
            fallbackUsed
          );
        },
      });

      if (result.success) {
        await AudioManager.setIsLoopingAsync(true);
        this.currentRingingAlarm = {
          alarmId,
          soundObject: null, // AudioManager handles internally
          isRinging: true,
        };
        console.log(`✅ Alarm started ringing: ${alarmId} (fallback: ${result.usedFallback})`);
      } else {
        throw new Error('Failed to start alarm audio');
      }
    } catch (error) {
      console.error(`❌ Failed to start ringing alarm ${alarmId}:`, error);
      await this.startRingingAlarmFallback(alarmId, audioTrack);
    }
  }

  /**
   * Start ringing alarm with background audio (silent loop method)
   */
  private async startRingingAlarmWithBackgroundAudio(
    alarmId: string,
    audioTrack: AudioTrack
  ): Promise<void> {
    try {
      console.log(`🔇 Starting background audio alarm: ${alarmId}`);

      // Load alarm audio with enhanced options
      let alarmSound: Audio.Sound;
      if (audioTrack.uri) {
        alarmSound = await audioService.loadAlarmAudio(audioTrack.uri, {
          volume: 1.0,
          shouldLoop: true,
        });
      } else {
        const { sound } = await Audio.Sound.createAsync(
          { uri: 'default' },
          { shouldPlay: false, isLooping: true, volume: 1.0 }
        );
        alarmSound = sound;
      }

      // If silent loop is active, switch to alarm sound
      if (backgroundAlarmService.isSilentLoopActive()) {
        console.log('🔄 Switching from silent loop to alarm sound');
        await backgroundAlarmService.switchToAlarmSound(alarmSound);
      } else {
        // Start silent loop first, then switch to alarm
        console.log('🔇 Starting silent loop then alarm sound');
        await backgroundAlarmService.startSilentLoop();
        // Small delay to ensure silent loop is established
        await new Promise(resolve => setTimeout(resolve, 500));
        await backgroundAlarmService.switchToAlarmSound(alarmSound);
      }

      this.currentRingingAlarm = {
        alarmId,
        soundObject: alarmSound,
        isRinging: true,
      };

      console.log(`✅ Background audio alarm started: ${alarmId}`);
    } catch (error) {
      console.error(`❌ Failed to start background audio alarm:`, error);
      // Fallback to standard approach
      await this.startRingingAlarmFallback(alarmId, audioTrack);
    }
  }

  /**
   * Fallback method for starting alarm with legacy audio system
   */
  private async startRingingAlarmFallback(
    alarmId: string,
    audioTrack: AudioTrack
  ): Promise<void> {
    try {
      console.log('🔄 Attempting fallback to legacy audio system');
      await audioService.configureAudio();

      let soundObject: Audio.Sound;
      if (audioTrack.uri) {
        soundObject = await audioService.loadAudio(audioTrack.uri);
      } else {
        const { sound } = await Audio.Sound.createAsync(
          { uri: 'default' },
          { shouldPlay: false, isLooping: true, volume: 1.0 }
        );
        soundObject = sound;
      }

      await audioService.playAlarmSound(soundObject);
      this.currentRingingAlarm = { alarmId, soundObject, isRinging: true };

      console.log(`✅ Alarm started with legacy fallback: ${alarmId}`);
    } catch (fallbackError) {
      console.error(`❌ Even fallback failed for alarm ${alarmId}:`, fallbackError);
      throw fallbackError;
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

      // Stop AudioManager or legacy sound object
      if (!soundObject) {
        console.log('🔇 Stopping AudioManager alarm playback');
        await AudioManager.stopAsync();
      } else {
        // Stop legacy audio service
        console.log('🔇 Stopping legacy alarm sound');
        await audioService.stopAlarmSound(soundObject);
      }

      // Clear state
      this.currentRingingAlarm = null;
      this.isNavigatingToRingingScreen = false;
      this.isOnRingingScreen = false;

      console.log(`✅ Alarm stopped ringing: ${alarmId}`);
    } catch (error) {
      console.error('❌ Failed to stop ringing alarm:', error);

      // Force clear state even if stopping failed
      this.currentRingingAlarm = null;
      this.isNavigatingToRingingScreen = false;
      this.isOnRingingScreen = false;

      // Try emergency cleanup
      try {
        await AudioManager.stopAsync();
      } catch (emergencyError) {
        console.warn('⚠️ Emergency cleanup also failed:', emergencyError);
      }

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
   * Robustly check if alarm should be ringing using multiple detection sources
   * This method doesn't rely solely on internal state and can detect when
   * background alarms should be active even if internal state is inconsistent
   */
  private async checkIfAlarmShouldBeRinging(): Promise<AlarmDetectionResult> {
    console.log(
      '🔍 Checking if alarm should be ringing (multi-source detection)...'
    );

    // Method 1: Check internal state first
    if (this.currentRingingAlarm?.isRinging) {
      console.log(
        '✅ Internal state shows alarm ringing:',
        this.currentRingingAlarm.alarmId
      );
      return {
        isRinging: true,
        alarmId: this.currentRingingAlarm.alarmId,
        // Note: We might not have audioTrack stored in currentRingingAlarm
        source: 'internal_state',
      };
    }

    // Method 2: Check for scheduled notifications that should be active right now
    try {
      console.log('🔍 Checking scheduled notifications...');
      const scheduledNotifications =
        await notificationService.getAllScheduledAlarms();
      const now = new Date();

      // Look for notifications that should have triggered within the last 30 minutes
      // (accounting for notification delivery delays, background processing, and user behavior)
      const recentlyTriggeredNotifications = scheduledNotifications.filter(
        notification => {
          try {
            // Extract notification time from different trigger types
            let notificationTime: Date | null = null;

            console.log(
              `🔍 Processing notification: ${notification.identifier}`
            );
            console.log(
              `📊 Trigger type:`,
              (notification.trigger as any)?.type
            );
            console.log(`📊 Full trigger:`, notification.trigger);
            console.log(
              `📊 Notification content data:`,
              notification.content?.data
            );

            // Method 1: Check for direct date in trigger (expo-notifications DateTrigger)
            if (notification.trigger && 'date' in notification.trigger) {
              const triggerDate = (notification.trigger as any).date;
              console.log(`📅 Found trigger.date:`, triggerDate);
              if (triggerDate) {
                notificationTime = new Date(triggerDate);
                console.log(`📅 Parsed trigger date:`, notificationTime);
              }
            }

            // Method 1b: Handle timeInterval triggers (iOS converts DATE to timeInterval)
            if (
              !notificationTime &&
              notification.trigger &&
              'seconds' in notification.trigger &&
              'type' in notification.trigger &&
              (notification.trigger as any).type === 'timeInterval'
            ) {
              const seconds = (notification.trigger as any).seconds;
              console.log(`⏰ Found timeInterval trigger: ${seconds} seconds`);

              // Calculate trigger time: current time + remaining seconds
              // This gives us the actual scheduled alarm time
              notificationTime = new Date(now.getTime() + seconds * 1000);
              console.log(
                `⏰ Calculated timeInterval trigger time:`,
                notificationTime
              );

              // Log additional context for debugging
              if (seconds <= 300) {
                // 5 minutes or less
                console.log(
                  `🎯 TimeInterval notification is imminent: ${seconds}s remaining`
                );
              }
              if (seconds <= 30) {
                // 30 seconds or less
                console.log(
                  `🚨 TimeInterval notification is about to trigger: ${seconds}s remaining`
                );
              }
              if (seconds <= 5) {
                // 5 seconds or less
                console.log(
                  `🔥 TimeInterval notification should be triggering NOW: ${seconds}s remaining`
                );
              }
            }

            // Method 2: Check for dateComponents (legacy or different trigger types)
            if (
              !notificationTime &&
              notification.trigger &&
              'dateComponents' in notification.trigger
            ) {
              const dateComp = (notification.trigger as any).dateComponents;
              console.log(`📅 Found dateComponents:`, dateComp);
              if (dateComp?.date) {
                notificationTime = new Date(dateComp.date);
              }
            }

            // Method 3: Check notification data for backup scheduledTime
            if (
              !notificationTime &&
              notification.content?.data?.scheduledTime
            ) {
              const scheduledTime = notification.content.data
                .scheduledTime as string;
              console.log(`📅 Found backup scheduledTime:`, scheduledTime);
              notificationTime = new Date(scheduledTime);
              console.log(`📅 Parsed backup scheduledTime:`, notificationTime);
            }

            // Method 3a: Check for triggerTimestamp backup
            if (
              !notificationTime &&
              notification.content?.data?.triggerTimestamp
            ) {
              const timestamp = notification.content.data
                .triggerTimestamp as number;
              console.log(`📅 Found backup triggerTimestamp:`, timestamp);
              notificationTime = new Date(timestamp);
              console.log(`📅 Parsed backup timestamp:`, notificationTime);
            }

            // Method 3b: Enhanced backup calculation for timeInterval
            // If we have timeInterval but no backup scheduledTime, try to reverse-engineer
            if (
              !notificationTime &&
              notification.trigger &&
              'seconds' in notification.trigger
            ) {
              const seconds = (notification.trigger as any).seconds;
              // Estimate when this notification was scheduled (approximately)
              // This is not perfect but gives us something to work with
              const estimatedScheduleTime = new Date(
                now.getTime() + seconds * 1000
              );
              console.log(
                `🔮 Estimated schedule time from timeInterval:`,
                estimatedScheduleTime
              );
              notificationTime = estimatedScheduleTime;
            }

            // Method 4: Fallback - check if notification has direct date property
            if (!notificationTime && (notification as any).date) {
              notificationTime = new Date((notification as any).date);
            }

            if (!notificationTime) {
              console.log(
                '⚠️ Could not determine notification time for:',
                notification.identifier,
                'Available properties:',
                Object.keys(notification)
              );
              return false;
            }

            const timeDiff = now.getTime() - notificationTime.getTime();
            const timeDiffSeconds = Math.round(timeDiff / 1000);
            const timeDiffMinutes = Math.round(timeDiff / 60000);

            // Enhanced alarm detection logic - covers multiple scenarios:
            // 1. Currently triggering alarms (±30 seconds)
            // 2. Imminent alarms (next 5 minutes)
            // 3. Recently triggered alarms (past 5 minutes)
            // 4. Long-missed alarms (past 30 minutes)

            const isCurrentlyTriggering = Math.abs(timeDiff) <= 30 * 1000; // ±30 seconds
            const isImminentAlarm =
              timeDiff < 0 && Math.abs(timeDiff) <= 5 * 60 * 1000; // Next 5 minutes
            const isRecentlyTriggered =
              timeDiff >= 0 && timeDiff <= 5 * 60 * 1000; // Past 5 minutes
            const isMissedAlarm = timeDiff >= 0 && timeDiff <= 30 * 60 * 1000; // Past 30 minutes

            const shouldHaveTriggered =
              isCurrentlyTriggering ||
              isImminentAlarm ||
              isRecentlyTriggered ||
              isMissedAlarm;

            // Enhanced logging with detection reason
            let detectionReason = '';
            if (isCurrentlyTriggering) detectionReason = 'CURRENTLY_TRIGGERING';
            else if (isImminentAlarm) detectionReason = 'IMMINENT_ALARM';
            else if (isRecentlyTriggered)
              detectionReason = 'RECENTLY_TRIGGERED';
            else if (isMissedAlarm) detectionReason = 'MISSED_ALARM';
            else detectionReason = 'OUTSIDE_WINDOW';

            console.log(`📊 Time analysis for ${notification.identifier}:`, {
              currentTime: now.toISOString(),
              scheduledTime: notificationTime.toISOString(),
              timeDiffSeconds,
              shouldHaveTriggered,
              detectionReason,
            });

            if (shouldHaveTriggered) {
              console.log(
                `🎯 ALARM DETECTED (${detectionReason}): Found active notification: ${notification.identifier}`
              );
              if (timeDiff >= 0) {
                console.log(
                  `🎯 Time diff: ${timeDiffSeconds}s (${timeDiffMinutes} minutes ago)`
                );
              } else {
                console.log(
                  `🎯 Time diff: ${timeDiffSeconds}s (${Math.abs(timeDiffMinutes)} minutes in future)`
                );
              }
              console.log(
                `🎯 Alarm ID: ${notification.content?.data?.alarmId}`
              );
              console.log(
                `🎯 Audio track: ${(notification.content?.data?.audioTrack as any)?.name || 'Unknown'}`
              );
            } else {
              console.log(
                `⏰ Notification outside detection window: ${timeDiffMinutes} minutes`
              );
            }

            return shouldHaveTriggered;
          } catch (error) {
            console.warn(
              '⚠️ Error processing notification time:',
              notification.identifier,
              error
            );
            return false;
          }
        }
      );

      if (recentlyTriggeredNotifications.length > 0) {
        const notification = recentlyTriggeredNotifications[0]; // Take the first one
        const data = notification.content?.data;

        console.log(
          '✅ Found active alarm from notifications:',
          notification.identifier
        );
        console.log('📊 Notification data:', data);

        return {
          isRinging: true,
          alarmId: (data?.alarmId as string) || notification.identifier,
          audioTrack: data?.audioTrack as AudioTrack | undefined,
          source: 'scheduled_notifications',
        };
      }
    } catch (error) {
      console.warn('⚠️ Failed to check scheduled notifications:', error);
    }

    console.log('❌ No active alarm detected from any source');
    return {
      isRinging: false,
      source: 'not_found',
    };
  }

  /**
   * Setup AppState listener to handle app becoming active during alarms
   * Uses robust alarm detection to handle cases where app was opened from home screen
   */
  private setupAppStateListener(): void {
    const { AppState } = require('react-native');

    AppState.addEventListener('change', async (nextAppState: string) => {
      console.log(`📱 AppState changed to: ${nextAppState}`);

      // When app becomes active, robustly check if any alarm should be ringing
      if (nextAppState === 'active') {
        console.log(
          '🔍 App became active - performing robust alarm detection...'
        );

        try {
          // Use robust detection instead of just checking this.currentRingingAlarm
          const alarmState = await this.checkIfAlarmShouldBeRinging();

          console.log(`📊 Alarm detection result:`, {
            isRinging: alarmState.isRinging,
            alarmId: alarmState.alarmId,
            source: alarmState.source,
            currentlyOnRingingScreen: this.isOnRingingScreen,
            currentlyNavigating: this.isNavigatingToRingingScreen,
          });

          if (alarmState.isRinging) {
            console.log(
              `🔔 App became active during alarm: ${alarmState.alarmId} (detected via: ${alarmState.source})`
            );

            // Only navigate if we're not already on the ringing screen
            if (!this.isOnRingingScreen && !this.isNavigatingToRingingScreen) {
              console.log('🚀 Navigating to ringing screen...');

              // If we detected alarm via notifications but don't have internal state,
              // we need to start the alarm audio and set internal state
              if (
                alarmState.source === 'scheduled_notifications' &&
                !this.currentRingingAlarm
              ) {
                console.log(
                  '🔄 Starting alarm audio and setting internal state...'
                );

                if (alarmState.audioTrack) {
                  try {
                    await this.startRingingAlarm(
                      alarmState.alarmId!,
                      alarmState.audioTrack
                    );
                  } catch (error) {
                    console.error('❌ Failed to start alarm audio:', error);
                    // Continue with navigation anyway - user can manually stop
                  }
                } else {
                  console.warn(
                    '⚠️ No audio track found for alarm, using fallback'
                  );
                  // Set basic internal state so navigation works
                  this.currentRingingAlarm = {
                    alarmId: alarmState.alarmId!,
                    soundObject: null,
                    isRinging: true,
                  };
                }
              }

              // Small delay to ensure app is fully active before navigation
              setTimeout(async () => {
                if (alarmState.isRinging && !this.isOnRingingScreen) {
                  await this.navigateToRingingScreen(alarmState.alarmId!);
                }
              }, 100);
            } else {
              console.log(
                '⚠️ Skipping navigation - already on ringing screen or navigating'
              );
            }
          } else {
            console.log('ℹ️ No active alarms detected during app activation');
          }
        } catch (error) {
          console.error('❌ Error during robust alarm detection:', error);
          // Fallback to old behavior
          if (
            this.currentRingingAlarm &&
            !this.isOnRingingScreen &&
            !this.isNavigatingToRingingScreen
          ) {
            console.log('🔄 Falling back to simple alarm check...');
            setTimeout(async () => {
              if (this.currentRingingAlarm && !this.isOnRingingScreen) {
                await this.navigateToRingingScreen(
                  this.currentRingingAlarm.alarmId
                );
              }
            }, 100);
          }
        }
      }
    });
  }

  /**
   * Setup notification listeners for alarm events
   */
  private setupNotificationListeners(): void {
    console.log('🔧 Setting up notification listeners for alarm events...');

    // Listen for notification responses (when user taps notification)
    // This handles: user taps notification when app is backgrounded/killed
    notificationService.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      const alarmId = data?.alarmId;
      const audioTrack = data?.audioTrack;

      console.log(
        '📱 Notification response received (user tapped notification):',
        {
          alarmId,
          hasAudioTrack: !!audioTrack,
          notificationData: data,
          currentRingingAlarm: this.currentRingingAlarm?.alarmId,
        }
      );

      if (alarmId && audioTrack) {
        const useBackgroundAudio = data?.useBackgroundAudio === true;
        console.log('🔔 Alarm notification tapped (user action):', alarmId);
        this.handleAlarmTrigger(String(alarmId), audioTrack as any, useBackgroundAudio);
      } else {
        console.warn(
          '⚠️ Invalid notification response data - missing alarmId or audioTrack'
        );
      }
    });

    // Listen for notifications received while app is in foreground
    // This handles: notification arrives when app is in foreground
    notificationService.addNotificationReceivedListener(notification => {
      const data = notification.request.content.data;
      const alarmId = data?.alarmId;
      const audioTrack = data?.audioTrack;
      const { AppState } = require('react-native');
      const currentAppState = AppState.currentState;

      console.log('📨 Notification received:', {
        alarmId,
        hasAudioTrack: !!audioTrack,
        currentAppState,
        notificationData: data,
        currentRingingAlarm: this.currentRingingAlarm?.alarmId,
        notificationIdentifier: notification.request.identifier,
      });

      if (alarmId && audioTrack) {
        const useBackgroundAudio = data?.useBackgroundAudio === true;
        
        if (currentAppState === 'active') {
          console.log('🔔 Alarm triggered in FOREGROUND:', alarmId);
          this.handleAlarmTrigger(String(alarmId), audioTrack as any, useBackgroundAudio);
        } else {
          console.log(
            '🔔 Alarm notification received in BACKGROUND - starting background audio:',
            alarmId
          );
          console.log('📊 Background trigger context:', {
            appState: currentAppState,
            alarmId,
            useBackgroundAudio,
            currentlyRinging: this.currentRingingAlarm?.alarmId,
          });
          this.handleBackgroundAlarmTrigger(String(alarmId), audioTrack as any, useBackgroundAudio);
        }
      } else {
        console.warn(
          '⚠️ Invalid notification data - missing alarmId or audioTrack:',
          {
            alarmId,
            audioTrack,
            notificationId: notification.request.identifier,
          }
        );
      }
    });

    console.log('✅ Notification listeners setup completed');
  }

  /**
   * Handle alarm trigger (from notification or foreground)
   */
  private async handleAlarmTrigger(
    alarmId: string,
    audioTrack: AudioTrack,
    useBackgroundAudio: boolean = false
  ): Promise<void> {
    console.log('🎯 Handling alarm trigger (foreground/notification tap):', {
      alarmId,
      audioTrackName: audioTrack.name,
      audioTrackType: audioTrack.type,
      currentRingingAlarm: this.currentRingingAlarm?.alarmId,
      isOnRingingScreen: this.isOnRingingScreen,
      isNavigating: this.isNavigatingToRingingScreen,
    });

    try {
      // Check if this alarm is already ringing - prevent duplicates
      if (this.currentRingingAlarm?.alarmId === alarmId) {
        console.log(
          '⚠️ Alarm already ringing, ignoring duplicate trigger:',
          alarmId
        );
        console.log('📊 Current alarm state:', {
          alarmId: this.currentRingingAlarm.alarmId,
          isRinging: this.currentRingingAlarm.isRinging,
          hasSoundObject: !!this.currentRingingAlarm.soundObject,
        });
        return;
      }

      // Check if any alarm is currently ringing - stop it first
      if (this.currentRingingAlarm) {
        console.log('🔄 Stopping current alarm before starting new one:', {
          currentAlarmId: this.currentRingingAlarm.alarmId,
          newAlarmId: alarmId,
        });
        await this.stopRingingAlarm();
      }

      console.log('🚀 Starting alarm ringing and navigation sequence...');

      // Start ringing the alarm with background audio support
      await this.startRingingAlarm(alarmId, audioTrack, useBackgroundAudio);
      console.log('✅ Alarm audio started successfully');

      // Navigate to alarm ringing screen if possible
      console.log('📱 Attempting navigation to ringing screen...');
      await this.navigateToRingingScreen(alarmId);

      console.log('✅ Alarm trigger handling completed successfully');
    } catch (error) {
      console.error('❌ Failed to handle alarm trigger:', error);
      console.log('📊 Error context:', {
        alarmId,
        audioTrack: audioTrack.name,
        currentRingingAlarm: this.currentRingingAlarm?.alarmId,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Handle background alarm trigger with enhanced background audio support
   * CRITICAL: This must set currentRingingAlarm properly for app activation detection
   */
  private async handleBackgroundAlarmTrigger(
    alarmId: string,
    audioTrack: AudioTrack,
    useBackgroundAudio: boolean = false
  ): Promise<void> {
    try {
      console.log(`🔔 Starting background alarm audio: ${alarmId} (background: ${useBackgroundAudio})`);

      // Check if this alarm is already ringing - prevent duplicates
      if (this.currentRingingAlarm?.alarmId === alarmId) {
        console.log('⚠️ Alarm already ringing in background, ignoring duplicate trigger:', alarmId);
        return;
      }

      // Stop any currently ringing alarm first
      if (this.currentRingingAlarm) {
        console.log('🔄 Stopping current alarm before starting background alarm');
        await this.stopRingingAlarm();
      }

      // Use enhanced background audio if enabled
      if (useBackgroundAudio && this.backgroundAlarmEnabled && Platform.OS === 'ios') {
        console.log('🔇 Using background audio system for alarm trigger');
        await this.startRingingAlarm(alarmId, audioTrack, true);
      } else {
        // Standard background trigger
        console.log('📱 Using standard audio system for background alarm');
        
        // Ensure audio service is configured for background
        if (!audioService.isAudioConfigured()) {
          console.log('🎵 Configuring audio for background playback');
          await audioService.configureAudio();
        }

        await this.startRingingAlarm(alarmId, audioTrack, false);
      }

      console.log('✅ Background alarm audio started successfully:', alarmId);
    } catch (error) {
      console.error('❌ Failed to handle background alarm trigger:', error);
      await this.handleBackgroundAlarmTriggerFallback(alarmId, audioTrack);
    }
  }

  /**
   * Fallback for background alarm trigger when main method fails
   */
  private async handleBackgroundAlarmTriggerFallback(
    alarmId: string,
    audioTrack: AudioTrack
  ): Promise<void> {
    try {
      console.log('🔄 Setting fallback alarm state for app activation detection');
      
      // Set basic state for navigation to work
      this.currentRingingAlarm = {
        alarmId,
        soundObject: null,
        isRinging: true,
      };

      // Attempt system default sound as last resort
      console.log('🔄 Attempting fallback with system default sound');
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'default' },
        { shouldPlay: true, isLooping: true, volume: 1.0 }
      );

      // Update state with fallback sound
      if (this.currentRingingAlarm) {
        this.currentRingingAlarm.soundObject = sound;
      }

      console.log('✅ Fallback alarm sound started with basic state');
    } catch (fallbackError) {
      console.error('❌ Even fallback alarm failed:', fallbackError);

      // Last resort: set state without audio so navigation still works
      this.currentRingingAlarm = {
        alarmId,
        soundObject: null,
        isRinging: true,
      };
      console.log('⚠️ Set alarm state without audio - navigation will work, but no sound');
    }
  }

  /**
   * Navigate to alarm ringing screen with duplicate prevention
   */
  private async navigateToRingingScreen(alarmId: string): Promise<void> {
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

      // Use safe replace to prevent stacking multiple alarm screens
      await safeReplace(`/alarms/ringing?alarmId=${alarmId}`, {
        bypassCooldown: true, // Emergency navigation for alarms
      });
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
