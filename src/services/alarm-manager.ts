/**
 * Central Alarm Manager
 * This file should be imported early in the app lifecycle (index.js or App.tsx)
 * to ensure background alarm functionality works properly
 */

import { alarmService } from './alarms/alarm-service';
import { audioService } from './audio/audio-service';
import { notificationService } from './notifications/notification-service';
import { backgroundTaskService } from './background/background-task-service';

export class AlarmManager {
  private static instance: AlarmManager;
  private isInitialized = false;

  static getInstance(): AlarmManager {
    if (!AlarmManager.instance) {
      AlarmManager.instance = new AlarmManager();
    }
    return AlarmManager.instance;
  }

  /**
   * Initialize all alarm-related services
   * MUST be called early in app lifecycle
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⏰ AlarmManager already initialized');
      return;
    }

    try {
      console.log('🚀 Initializing VibeWake Alarm System...');

      // Step 1: Configure audio for background playback
      await audioService.configureAudio();
      console.log('✅ Audio service configured');

      // Step 2: Initialize notification service
      await notificationService.initialize();
      console.log('✅ Notification service initialized');

      // Step 3: Initialize background task service
      await backgroundTaskService.initialize();
      console.log('✅ Background task service initialized');

      // Step 4: Initialize main alarm service
      await alarmService.initialize();
      console.log('✅ Alarm service initialized');

      this.isInitialized = true;
      console.log('🎉 VibeWake Alarm System fully initialized!');

      // Log system status
      await this.logSystemStatus();
    } catch (error) {
      console.error('❌ Failed to initialize AlarmManager:', error);
      throw error;
    }
  }

  /**
   * Get initialization status
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Log current system status for debugging
   */
  async logSystemStatus(): Promise<void> {
    try {
      const backgroundStatus = await backgroundTaskService.getBackgroundTaskStatus();
      const scheduledAlarms = await alarmService.getScheduledAlarms();
      const isRinging = alarmService.isAlarmRinging();
      const audioConfigured = audioService.isAudioConfigured();

      const status = {
        initialized: this.isInitialized,
        audioConfigured,
        backgroundTasks: backgroundStatus,
        scheduledAlarms: scheduledAlarms.length,
        currentlyRinging: isRinging,
      };

      console.log('📊 VibeWake Alarm System Status:', JSON.stringify(status, null, 2));
    } catch (error) {
      console.error('❌ Failed to get system status:', error);
    }
  }

  /**
   * Health check for alarm system
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    issues: string[];
    services: Record<string, boolean>;
  }> {
    const issues: string[] = [];
    const services = {
      alarmManager: this.isInitialized,
      audioService: false,
      notificationService: false,
      backgroundTaskService: false,
    };

    try {
      // Check audio service
      services.audioService = audioService.isAudioConfigured();
      if (!services.audioService) {
        issues.push('Audio service not configured for background playback');
      }

      // Check notification service
      try {
        const permissions = await notificationService.requestPermissions();
        services.notificationService = permissions.granted;
        if (!permissions.granted) {
          issues.push('Notification permissions not granted');
        }
      } catch (error) {
        services.notificationService = false;
        issues.push('Notification service error: ' + error.message);
      }

      // Check background task service
      try {
        const backgroundStatus = await backgroundTaskService.getBackgroundTaskStatus();
        services.backgroundTaskService = backgroundStatus.isInitialized;
        if (!backgroundStatus.isInitialized) {
          issues.push('Background task service not initialized');
        }
      } catch (error) {
        services.backgroundTaskService = false;
        issues.push('Background task service error: ' + error.message);
      }

      const healthy = issues.length === 0;

      console.log(
        healthy ? '✅ Alarm system health check passed' : '⚠️ Alarm system health check found issues:',
        issues
      );

      return { healthy, issues, services };
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return {
        healthy: false,
        issues: [`Health check error: ${error.message}`],
        services,
      };
    }
  }

  /**
   * Emergency cleanup - stop all alarms and reset system
   */
  async emergencyStop(): Promise<void> {
    try {
      console.log('🚨 Emergency stop initiated...');

      // Stop any currently ringing alarm
      if (alarmService.isAlarmRinging()) {
        await alarmService.stopRingingAlarm();
      }

      // Cancel all scheduled alarms
      await alarmService.cancelAllAlarms();

      // Reset audio mode
      await audioService.resetAudioMode();

      console.log('✅ Emergency stop completed');
    } catch (error) {
      console.error('❌ Emergency stop failed:', error);
      throw error;
    }
  }

  /**
   * Get alarm service instance
   */
  getAlarmService() {
    return alarmService;
  }

  /**
   * Get audio service instance
   */
  getAudioService() {
    return audioService;
  }

  /**
   * Get notification service instance
   */
  getNotificationService() {
    return notificationService;
  }

  /**
   * Get background task service instance
   */
  getBackgroundTaskService() {
    return backgroundTaskService;
  }
}

// Export singleton instance
export const alarmManager = AlarmManager.getInstance();

// Export individual services for convenience
export {
  alarmService,
  audioService,
  notificationService,
  backgroundTaskService,
};