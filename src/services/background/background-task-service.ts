import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { alarmService } from '../alarms/alarm-service';
import { audioService } from '../audio/audio-service';

// Background task names
const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND_NOTIFICATION_TASK';
const BACKGROUND_ALARM_TASK = 'BACKGROUND_ALARM_TASK';

export class BackgroundTaskService {
  private static instance: BackgroundTaskService;
  private isRegistered = false;

  static getInstance(): BackgroundTaskService {
    if (!BackgroundTaskService.instance) {
      BackgroundTaskService.instance = new BackgroundTaskService();
    }
    return BackgroundTaskService.instance;
  }

  /**
   * Initialize background task service
   */
  async initialize(): Promise<void> {
    if (this.isRegistered) {
      return;
    }

    try {
      // Register background notification task
      this.registerBackgroundNotificationTask();

      // Register background alarm task
      this.registerBackgroundAlarmTask();

      // Register tasks with Notifications
      await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);

      this.isRegistered = true;
      console.log('✅ BackgroundTaskService initialized');
    } catch (error) {
      console.error('❌ Failed to initialize BackgroundTaskService:', error);
      throw error;
    }
  }

  /**
   * Register background notification task
   * This handles notifications when app is in background/killed
   */
  private registerBackgroundNotificationTask(): void {
    TaskManager.defineTask(
      BACKGROUND_NOTIFICATION_TASK,
      async ({ data, error }) => {
        if (error) {
          console.error('❌ Background notification task error:', error);
          return;
        }

        if (data) {
          try {
            const notificationData = data as any;
            console.log(
              '🔔 Background notification received:',
              notificationData
            );

            // Extract alarm data from notification
            const alarmId = notificationData.alarmId;
            const audioTrack = notificationData.audioTrack;

            if (alarmId && audioTrack) {
              // Configure audio for background playback
              await audioService.configureAudio();

              // Start alarm ringing in background
              await alarmService.startRingingAlarm(alarmId, audioTrack);

              console.log('✅ Background alarm started ringing:', alarmId);
            }
          } catch (error) {
            console.error('❌ Error handling background notification:', error);
          }
        }
      }
    );
  }

  /**
   * Register background alarm task
   * This ensures alarms continue working even when app is killed
   */
  private registerBackgroundAlarmTask(): void {
    TaskManager.defineTask(BACKGROUND_ALARM_TASK, async ({ data, error }) => {
      if (error) {
        console.error('❌ Background alarm task error:', error);
        return;
      }

      if (data) {
        try {
          console.log('⏰ Background alarm task executed:', data);

          // Ensure audio service is configured
          if (!audioService.isAudioConfigured()) {
            await audioService.configureAudio();
          }

          // Process any pending alarm operations
          await this.processBackgroundAlarms();

          console.log('✅ Background alarm task completed');
        } catch (error) {
          console.error('❌ Error in background alarm task:', error);
        }
      }
    });
  }

  /**
   * Process background alarms
   * This method runs in background to ensure alarms work properly
   */
  private async processBackgroundAlarms(): Promise<void> {
    try {
      // Get all scheduled alarms
      const scheduledAlarms = await alarmService.getScheduledAlarms();

      console.log(`📋 Processing ${scheduledAlarms.length} background alarms`);

      // Check if any alarms should be triggered now
      const now = new Date();

      for (const alarm of scheduledAlarms) {
        const trigger = alarm.trigger;

        // Check if this alarm should trigger now
        if (this.shouldAlarmTrigger(trigger, now)) {
          const alarmData = alarm.content.data;

          if (alarmData?.alarmId && alarmData?.audioTrack) {
            console.log('🔔 Triggering background alarm:', alarmData.alarmId);

            // Start ringing alarm
            await alarmService.startRingingAlarm(
              alarmData.alarmId,
              alarmData.audioTrack
            );
          }
        }
      }
    } catch (error) {
      console.error('❌ Error processing background alarms:', error);
    }
  }

  /**
   * Check if alarm should trigger based on its trigger conditions
   */
  private shouldAlarmTrigger(trigger: any, currentTime: Date): boolean {
    if (!trigger) return false;

    try {
      // Handle DATE triggers
      if (trigger.type === 'date') {
        const triggerTime = new Date(trigger.value);
        const timeDiff = Math.abs(
          currentTime.getTime() - triggerTime.getTime()
        );

        // Allow 1 minute tolerance for background execution delays
        return timeDiff <= 60000; // 60 seconds
      }

      // Handle WEEKLY triggers
      if (trigger.type === 'weekly') {
        const currentDay = currentTime.getDay();
        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();

        return (
          trigger.weekday === currentDay + 1 && // Expo uses 1-7, JS uses 0-6
          trigger.hour === currentHour &&
          Math.abs(trigger.minute - currentMinute) <= 1 // 1 minute tolerance
        );
      }

      return false;
    } catch (error) {
      console.error('❌ Error checking alarm trigger:', error);
      return false;
    }
  }

  /**
   * Start background task for alarm monitoring
   */
  async startBackgroundAlarmMonitoring(): Promise<void> {
    try {
      // This would be used for periodic background checks
      // Note: iOS has strict limitations on background execution
      console.log('🔄 Background alarm monitoring started');
    } catch (error) {
      console.error('❌ Failed to start background monitoring:', error);
    }
  }

  /**
   * Stop background task monitoring
   */
  async stopBackgroundAlarmMonitoring(): Promise<void> {
    try {
      console.log('⏹️ Background alarm monitoring stopped');
    } catch (error) {
      console.error('❌ Failed to stop background monitoring:', error);
    }
  }

  /**
   * Check if background tasks are properly registered
   */
  async isBackgroundTaskRegistered(taskName: string): Promise<boolean> {
    return await TaskManager.isTaskRegisteredAsync(taskName);
  }

  /**
   * Get background task status
   */
  async getBackgroundTaskStatus(): Promise<any> {
    try {
      const notificationTaskStatus = await TaskManager.isTaskRegisteredAsync(
        BACKGROUND_NOTIFICATION_TASK
      );
      const alarmTaskStatus = await TaskManager.isTaskRegisteredAsync(
        BACKGROUND_ALARM_TASK
      );

      return {
        notificationTask: notificationTaskStatus,
        alarmTask: alarmTaskStatus,
        isInitialized: this.isRegistered,
      };
    } catch (error) {
      console.error('❌ Failed to get background task status:', error);
      return {
        notificationTask: false,
        alarmTask: false,
        isInitialized: false,
      };
    }
  }

  /**
   * Unregister all background tasks (for cleanup)
   */
  async unregisterBackgroundTasks(): Promise<void> {
    try {
      await TaskManager.unregisterAllTasksAsync();
      this.isRegistered = false;
      console.log('✅ All background tasks unregistered');
    } catch (error) {
      console.error('❌ Failed to unregister background tasks:', error);
    }
  }
}

// Export singleton instance
export const backgroundTaskService = BackgroundTaskService.getInstance();

// Export task names for external reference
export { BACKGROUND_NOTIFICATION_TASK, BACKGROUND_ALARM_TASK };
