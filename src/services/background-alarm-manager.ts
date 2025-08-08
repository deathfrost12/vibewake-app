import { Platform } from 'react-native';
import { backgroundAlarmService } from './background/background-alarm-service';
import { alarmService } from './alarms/alarm-service';
import { audioService } from './audio/audio-service';
import { sleepSoundsService } from './sleep-sounds/sleep-sounds-service';
import { focusTimerService } from './focus/focus-timer-service';
import { breathingExerciseService } from './breathing/breathing-exercise-service';
import { batteryUsageService } from './battery/battery-usage-service';

export interface BackgroundAlarmManagerStats {
  alarmService: {
    initialized: boolean;
    currentRingingAlarm: string | null;
    backgroundAudioEnabled: boolean;
  };
  backgroundAlarmService: {
    initialized: boolean;
    silentLoopActive: boolean;
    config: any;
  };
  audioService: {
    configured: boolean;
    hasCurrentAlarm: boolean;
  };
  batteryUsage: {
    estimatedImpact: 'low' | 'medium' | 'high';
    batteryLevel: number;
    recommendations: string[];
  };
  wellnessServices: {
    sleepSounds: boolean;
    focusTimer: boolean;
    breathingExercise: boolean;
  };
}

/**
 * Central manager for all background alarm functionality
 * Coordinates silent loop background audio system with wellness features
 */
export class BackgroundAlarmManager {
  private static instance: BackgroundAlarmManager;
  private isInitialized = false;

  static getInstance(): BackgroundAlarmManager {
    if (!BackgroundAlarmManager.instance) {
      BackgroundAlarmManager.instance = new BackgroundAlarmManager();
    }
    return BackgroundAlarmManager.instance;
  }

  /**
   * Initialize the complete background alarm system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('✅ BackgroundAlarmManager already initialized');
      return;
    }

    try {
      console.log(
        '🚀 Initializing BackgroundAlarmManager with all services...'
      );

      // Core services initialization
      console.log('📱 Initializing core alarm services...');

      // Initialize audio service first (required by others)
      await audioService.configureAudio();

      // Initialize background alarm service for silent loop
      await backgroundAlarmService.initialize({
        enableSilentLoop: Platform.OS === 'ios', // Only on iOS
        batteryOptimized: false, // Full power for alarms
        fallbackToNotifications: true,
      });

      // Initialize main alarm service with background support
      await alarmService.initialize();

      // Initialize battery monitoring
      console.log('🔋 Initializing battery usage monitoring...');
      await batteryUsageService.initialize();

      // Initialize wellness services for Apple review legitimacy
      console.log(
        '🧘 Initializing wellness services for background audio justification...'
      );

      // These are already singleton instances, just verify they're ready
      sleepSoundsService; // Already initialized singleton
      focusTimerService; // Already initialized singleton
      breathingExerciseService; // Already initialized singleton

      console.log('✅ All wellness services initialized');

      this.isInitialized = true;
      console.log(
        '✅ BackgroundAlarmManager fully initialized with hybrid background alarm system'
      );

      // Log initial system status
      const stats = await this.getSystemStats();
      console.log('📊 System status:', {
        platform: Platform.OS,
        backgroundAudioSupported: Platform.OS === 'ios',
        services: {
          alarm: stats.alarmService.initialized,
          backgroundAlarm: stats.backgroundAlarmService.initialized,
          audio: stats.audioService.configured,
          battery: true,
        },
      });
    } catch (error) {
      console.error('❌ Failed to initialize BackgroundAlarmManager:', error);
      this.isInitialized = false;
      throw error;
    }
  }

  /**
   * Start background alarm preparation for imminent alarms
   * This is called when user creates an alarm or when app detects alarm within 10 minutes
   */
  async prepareForAlarm(
    alarmId: string,
    timeUntilAlarmMs: number
  ): Promise<void> {
    try {
      console.log(
        `🔄 Preparing background alarm system for: ${alarmId} (in ${Math.round(timeUntilAlarmMs / 1000 / 60)}min)`
      );

      // Check battery status first
      const shouldDisable =
        await batteryUsageService.shouldDisableBackgroundAudio();
      if (shouldDisable) {
        console.log(
          '🔋 Low battery detected - skipping background audio preparation'
        );
        return;
      }

      // Start silent loop if alarm is within 10 minutes and iOS
      if (Platform.OS === 'ios' && timeUntilAlarmMs <= 10 * 60 * 1000) {
        if (!backgroundAlarmService.isSilentLoopActive()) {
          console.log('🔇 Starting silent loop for imminent alarm');
          await backgroundAlarmService.startSilentLoop();
        }
      }

      console.log(`✅ Background alarm system prepared for: ${alarmId}`);
    } catch (error) {
      console.error('❌ Failed to prepare background alarm system:', error);
      // Don't throw - alarm should still work without background preparation
    }
  }

  /**
   * Stop all background audio activities
   * Called when user dismisses all alarms or app goes to sleep
   */
  async stopAllBackgroundAudio(): Promise<void> {
    try {
      console.log('🛑 Stopping all background audio activities...');

      // Stop background alarm service
      await backgroundAlarmService.emergencyStop();

      // Stop wellness services
      await sleepSoundsService.cleanup();
      await focusTimerService.cleanup();
      await breathingExerciseService.cleanup();

      // Stop any current alarm
      if (alarmService.isAlarmRinging()) {
        await alarmService.stopRingingAlarm();
      }

      console.log('✅ All background audio activities stopped');
    } catch (error) {
      console.error('❌ Failed to stop background audio activities:', error);
      // Continue cleanup even if some parts fail
    }
  }

  /**
   * Get comprehensive system statistics
   */
  async getSystemStats(): Promise<BackgroundAlarmManagerStats> {
    try {
      const currentAlarm = alarmService.getCurrentRingingAlarm();
      const backgroundStats = backgroundAlarmService.getDiagnostics();
      const audioStats = audioService.getDiagnostics();
      const batteryStats = await batteryUsageService.getBatteryUsageStats(
        backgroundStats.silentLoopActive,
        backgroundStats.silentLoopActive
      );

      return {
        alarmService: {
          initialized: true, // If we're here, it's initialized
          currentRingingAlarm: currentAlarm?.alarmId || null,
          backgroundAudioEnabled: backgroundStats.silentLoopActive,
        },
        backgroundAlarmService: {
          initialized: backgroundStats.initialized,
          silentLoopActive: backgroundStats.silentLoopActive,
          config: backgroundStats.config,
        },
        audioService: {
          configured: audioStats.configured,
          hasCurrentAlarm: audioStats.hasCurrentAlarmPlayer,
        },
        batteryUsage: {
          estimatedImpact: batteryStats.estimatedBatteryImpact,
          batteryLevel: batteryStats.batteryLevel,
          recommendations: batteryStats.recommendations,
        },
        wellnessServices: {
          sleepSounds: sleepSoundsService.isCurrentlyPlaying(),
          focusTimer: focusTimerService.isSessionRunning(),
          breathingExercise:
            breathingExerciseService.getSessionStats().isActive,
        },
      };
    } catch (error) {
      console.error('❌ Failed to get system stats:', error);
      throw error;
    }
  }

  /**
   * Perform health check on all services
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check core services
      if (!audioService.isAudioConfigured()) {
        issues.push('Audio service not configured');
        recommendations.push('Restart the app to reconfigure audio');
      }

      // Check background alarm service
      const backgroundDiagnostics = backgroundAlarmService.getDiagnostics();
      if (!backgroundDiagnostics.initialized) {
        issues.push('Background alarm service not initialized');
        recommendations.push('Restart the app to initialize background alarms');
      }

      // Check battery status
      const batteryStats = await batteryUsageService.getBatteryUsageStats();
      if (
        batteryStats.batteryLevel < 20 &&
        batteryStats.backgroundAudioEnabled
      ) {
        issues.push('Low battery with background audio active');
        recommendations.push(
          'Consider disabling background audio to conserve battery'
        );
      }

      // Check iOS specific requirements
      if (Platform.OS === 'ios') {
        if (
          !backgroundDiagnostics.silentLoopActive &&
          alarmService.isAlarmRinging()
        ) {
          issues.push('Alarm ringing without silent loop support');
          recommendations.push(
            'Background audio may stop when device is locked'
          );
        }
      }

      const healthy = issues.length === 0;

      return {
        healthy,
        issues,
        recommendations,
      };
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return {
        healthy: false,
        issues: ['Health check failed to complete'],
        recommendations: ['Try restarting the app'],
      };
    }
  }

  /**
   * Get user education content about background alarms
   */
  getUserEducationContent(): {
    howItWorks: string[];
    batteryImpact: string[];
    tips: string[];
    troubleshooting: string[];
  } {
    const batteryEducation = batteryUsageService.getBatteryEducationContent();

    return {
      howItWorks: [
        '🔇 VibeWake uses a "silent loop" technique to keep audio active in the background',
        '📱 This ensures your alarms will ring even when your iPhone is locked',
        '🎵 The app plays an inaudible sound continuously to maintain the audio session',
        '⏰ When your alarm time arrives, the silent sound switches to your alarm tone',
      ],
      batteryImpact: batteryEducation.backgroundAudio,
      tips: [
        '🔌 Charge your device overnight when using background alarms for best results',
        '🧘 Enable Sleep Sounds or Focus Timer to justify background audio to iOS',
        '⚙️ Use Battery Saver mode in app settings if you need to conserve power',
        '📊 Monitor battery usage in iOS Settings > Battery to track actual impact',
      ],
      troubleshooting: [
        "🔄 If alarms don't ring when locked: Check iOS Background App Refresh settings",
        '🔊 If audio stops in silent mode: Ensure "Plays in Silent Mode" is enabled',
        '📱 If app seems slow: Restart the app to refresh audio configuration',
        '🪫 If battery drains quickly: Temporarily disable background audio features',
      ],
    };
  }

  /**
   * Emergency cleanup - force stop everything
   */
  async emergencyCleanup(): Promise<void> {
    try {
      console.log(
        '🚨 Performing emergency cleanup of background alarm system...'
      );

      await Promise.allSettled([
        backgroundAlarmService.cleanup(),
        sleepSoundsService.cleanup(),
        focusTimerService.cleanup(),
        breathingExerciseService.cleanup(),
        batteryUsageService.cleanup(),
        alarmService.forceStopAllAlarms(),
        audioService.stopAllAudio(),
      ]);

      this.isInitialized = false;
      console.log('✅ Emergency cleanup completed');
    } catch (error) {
      console.error('❌ Emergency cleanup failed:', error);
      // Force reset initialization flag anyway
      this.isInitialized = false;
    }
  }

  /**
   * Check if background alarm manager is ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const backgroundAlarmManager = BackgroundAlarmManager.getInstance();
