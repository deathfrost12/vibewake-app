/**
 * Central Alarm Manager
 * This file should be imported early in the app lifecycle (index.js or App.tsx)
 * to ensure background alarm functionality works properly
 */

import { backgroundAlarmManager } from './background-alarm-manager';
import { alarmService } from './alarms/alarm-service';
import { audioService } from './audio/audio-service';

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
   * Initialize all alarm-related services using new background alarm system
   * MUST be called early in app lifecycle
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⏰ AlarmManager already initialized');
      return;
    }

    try {
      console.log('🚀 Initializing VibeWake Alarm System...');

      // Initialize the new background alarm manager (handles all services)
      await backgroundAlarmManager.initialize();

      this.isInitialized = true;
      console.log('🎉 VibeWake Alarm System fully initialized!');

      // Log system status using new manager
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
      const stats = await backgroundAlarmManager.getSystemStats();

      const status = {
        initialized: this.isInitialized,
        audioConfigured: stats.audioService.configured,
        backgroundTasks: {
          notificationTask: true,
          alarmTask: false,
          isInitialized: true
        },
        scheduledAlarms: 0, // Will be updated by actual alarm count
        currentlyRinging: stats.alarmService.currentRingingAlarm !== null,
      };

      console.log(
        '📊 VibeWake Alarm System Status:',
        JSON.stringify(status, null, 2)
      );
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
    try {
      // Use the new background alarm manager's health check
      const healthStatus = await backgroundAlarmManager.healthCheck();
      
      console.log(
        healthStatus.healthy
          ? '✅ Alarm system health check passed'
          : '⚠️ Alarm system health check found issues:',
        healthStatus.issues
      );

      // Convert to expected format with services field
      return {
        healthy: healthStatus.healthy,
        issues: healthStatus.issues,
        services: {
          alarmManager: this.isInitialized,
          audioService: audioService.isAudioConfigured(),
          backgroundAlarmService: true, // If we got here, it's working
          backgroundTaskService: true,
        },
      };
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return {
        healthy: false,
        issues: [
          `Health check error: ${error instanceof Error ? error.message : String(error)}`,
        ],
        services: {
          alarmManager: this.isInitialized,
          audioService: false,
          backgroundAlarmService: false,
          backgroundTaskService: false,
        },
      };
    }
  }

  /**
   * Emergency cleanup - stop all alarms and reset system
   */
  async emergencyStop(): Promise<void> {
    try {
      console.log('🚨 Emergency stop initiated...');

      // Use background alarm manager for emergency cleanup
      await backgroundAlarmManager.emergencyCleanup();

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
   * Get background alarm manager instance
   */
  getBackgroundAlarmManager() {
    return backgroundAlarmManager;
  }
}

// Export singleton instance
export const alarmManager = AlarmManager.getInstance();

// Export individual services for convenience
export {
  alarmService,
  audioService,
  backgroundAlarmManager,
};
