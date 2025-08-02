import { AudioTrack } from '../audio/types';
import {
  notificationService,
  AlarmNotification,
} from '../notifications/notification-service';
import { audioService } from '../audio/audio-service';
import { Audio } from 'expo-av';
import { safeReplace } from '../../utils/navigation-utils';

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

      // Look for notifications that should have triggered within the last 5 minutes
      // (accounting for notification delivery delays and background processing)
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

            // Method 1: Check for direct date in trigger (expo-notifications DateTrigger)
            if (notification.trigger && 'date' in notification.trigger) {
              const triggerDate = (notification.trigger as any).date;
              console.log(`📅 Found trigger.date:`, triggerDate);
              if (triggerDate) {
                notificationTime = new Date(triggerDate);
                console.log(`📅 Parsed trigger date:`, notificationTime);
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

            // Check if notification should have triggered in the last 5 minutes
            const shouldHaveTriggered =
              timeDiff >= 0 && timeDiff <= 5 * 60 * 1000; // 5 minutes

            console.log(`📊 Time analysis for ${notification.identifier}:`, {
              scheduledTime: notificationTime.toISOString(),
              currentTime: now.toISOString(),
              timeDiffSeconds: Math.round(timeDiff / 1000),
              shouldHaveTriggered,
            });

            if (shouldHaveTriggered) {
              console.log(
                `🎯 Found recently triggered notification: ${notification.identifier}, time diff: ${Math.round(timeDiff / 1000)}s`
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
                await this.navigateToRingingScreen(this.currentRingingAlarm.alarmId);
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
        console.log('🔔 Alarm notification tapped (user action):', alarmId);
        this.handleAlarmTrigger(String(alarmId), audioTrack as any);
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
        if (currentAppState === 'active') {
          console.log('🔔 Alarm triggered in FOREGROUND:', alarmId);
          this.handleAlarmTrigger(String(alarmId), audioTrack as any);
        } else {
          console.log(
            '🔔 Alarm notification received in BACKGROUND - starting background audio:',
            alarmId
          );
          console.log('📊 Background trigger context:', {
            appState: currentAppState,
            alarmId,
            currentlyRinging: this.currentRingingAlarm?.alarmId,
          });
          this.handleBackgroundAlarmTrigger(String(alarmId), audioTrack as any);
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
    audioTrack: AudioTrack
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

      // Start ringing the alarm
      await this.startRingingAlarm(alarmId, audioTrack);
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
   * Handle background alarm trigger - focus on audio AND proper state management
   * CRITICAL: This must set currentRingingAlarm properly for app activation detection
   */
  private async handleBackgroundAlarmTrigger(
    alarmId: string,
    audioTrack: AudioTrack
  ): Promise<void> {
    try {
      console.log('🔔 Starting background alarm audio:', alarmId);
      console.log(
        '📊 Current ringing alarm before background trigger:',
        this.currentRingingAlarm?.alarmId
      );

      // Check if this alarm is already ringing - prevent duplicates
      if (this.currentRingingAlarm?.alarmId === alarmId) {
        console.log(
          '⚠️ Alarm already ringing in background, ignoring duplicate trigger:',
          alarmId
        );
        return;
      }

      // Stop any currently ringing alarm first
      if (this.currentRingingAlarm) {
        console.log(
          '🔄 Stopping current alarm before starting background alarm'
        );
        await this.stopRingingAlarm();
      }

      // Ensure audio service is configured for background
      if (!audioService.isAudioConfigured()) {
        console.log('🎵 Configuring audio for background playback');
        await audioService.configureAudio();
      }

      // CRITICAL: Use the same startRingingAlarm method that properly sets currentRingingAlarm
      // This ensures state consistency between foreground and background triggers
      await this.startRingingAlarm(alarmId, audioTrack);

      console.log('✅ Background alarm audio started successfully:', alarmId);
      console.log(
        '📊 Current ringing alarm after background trigger:',
        this.currentRingingAlarm?.alarmId
      );
      console.log(
        '🎯 Background alarm state properly set for app activation detection'
      );
    } catch (error) {
      console.error('❌ Failed to handle background alarm trigger:', error);

      // Fallback: try to set basic state even if audio fails
      try {
        console.log(
          '🔄 Setting fallback alarm state for app activation detection'
        );
        this.currentRingingAlarm = {
          alarmId,
          soundObject: null,
          isRinging: true,
        };

        // Attempt system default sound as last resort
        console.log('🔄 Attempting fallback with system default sound');
        const { Audio } = await import('expo-av');
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
        console.log(
          '⚠️ Set alarm state without audio - navigation will work, but no sound'
        );
      }
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
        bypassCooldown: true // Emergency navigation for alarms
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
