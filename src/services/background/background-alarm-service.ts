import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import { Platform } from 'react-native';
import { audioService } from '../audio/audio-service';

export interface BackgroundAlarmConfig {
  enableSilentLoop: boolean;
  batteryOptimized: boolean;
  fallbackToNotifications: boolean;
}

export class BackgroundAlarmService {
  private static instance: BackgroundAlarmService;
  private silentPlayer: AudioPlayer | null = null;
  private isLoopActive = false;
  private isInitialized = false;
  private config: BackgroundAlarmConfig = {
    enableSilentLoop: true,
    batteryOptimized: false,
    fallbackToNotifications: true,
  };

  static getInstance(): BackgroundAlarmService {
    if (!BackgroundAlarmService.instance) {
      BackgroundAlarmService.instance = new BackgroundAlarmService();
    }
    return BackgroundAlarmService.instance;
  }

  /**
   * Initialize background alarm service
   * Must be called before using any background alarm functionality
   */
  async initialize(config?: Partial<BackgroundAlarmConfig>): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('🔇 Initializing BackgroundAlarmService...');

      // Merge config with defaults
      this.config = { ...this.config, ...config };

      // Configure audio service for background playback
      await audioService.configureAudio();

      this.isInitialized = true;
      console.log('✅ BackgroundAlarmService initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize BackgroundAlarmService:', error);
      throw error;
    }
  }

  /**
   * Start silent audio loop to keep audio session alive in background
   * This is the core of the background alarm hack
   */
  async startSilentLoop(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error(
        'BackgroundAlarmService not initialized. Call initialize() first.'
      );
    }

    if (this.isLoopActive) {
      console.log('🔇 Silent loop already active, skipping start');
      return;
    }

    if (Platform.OS !== 'ios') {
      console.log('🔇 Silent loop only needed on iOS, skipping on Android');
      return;
    }

    if (!this.config.enableSilentLoop) {
      console.log('🔇 Silent loop disabled in config, skipping');
      return;
    }

    try {
      console.log('🔇 Starting long silent audio to keep session alive...');

      // Use 10-minute silent file instead of 1s loop to avoid JS timer issues in background
      const silentUri = require('../../../assets/silent-10min.wav');
      this.silentPlayer = createAudioPlayer(silentUri);

      // Configure for silent background audio - use very low but non-zero volume
      // iOS may optimize away completely silent audio
      this.silentPlayer.volume = 0.001;

      // Start playing - will run for 10 minutes without needing JS timers
      await this.silentPlayer.play();

      this.isLoopActive = true;
      console.log(
        '✅ Long silent audio started - audio session kept alive for 10 minutes without JS timers'
      );
    } catch (error) {
      console.error('❌ Failed to start silent loop:', error);
      this.isLoopActive = false;
      throw error;
    }
  }

  // Note: setupSilentLoop() method removed - we now use long 10-minute silent file
  // instead of JS timer-based 1s looping to avoid background timer issues

  /**
   * Stop silent audio loop
   * Call this when alarm finishes or app no longer needs background audio
   */
  async stopSilentLoop(): Promise<void> {
    if (!this.isLoopActive || !this.silentPlayer) {
      console.log('🔇 Silent loop not active, skipping stop');
      return;
    }

    try {
      console.log('🔇 Stopping long silent audio...');

      // Simply pause and cleanup - no intervals to clear
      await this.silentPlayer.pause();

      this.silentPlayer = null;
      this.isLoopActive = false;

      console.log('✅ Long silent audio stopped');
    } catch (error) {
      console.error('❌ Failed to stop silent loop:', error);
      // Force cleanup even if stop fails
      this.silentPlayer = null;
      this.isLoopActive = false;
    }
  }

  /**
   * Switch from silent loop to alarm playbook
   * This ensures seamless transition without dropping audio session
   */
  async switchToAlarmSound(alarmPlayer: AudioPlayer): Promise<void> {
    try {
      console.log('🔄 Switching from silent loop to alarm sound...');

      // First, start the alarm player while silent loop is still running
      await alarmPlayer.play();

      // Small delay to ensure alarm audio starts playing
      await new Promise(resolve => setTimeout(resolve, 100));

      // Now stop the silent loop - audio session remains active due to alarm
      if (this.isLoopActive) {
        await this.stopSilentLoop();
      }

      console.log('✅ Successfully switched to alarm sound with expo-audio');
    } catch (error) {
      console.error('❌ Failed to switch to alarm sound:', error);
      throw error;
    }
  }

  /**
   * Switch back to silent loop after alarm stops
   * Useful if app needs to maintain background audio capability
   */
  async switchBackToSilentLoop(): Promise<void> {
    if (this.isLoopActive) {
      console.log('🔇 Silent loop already active, skipping switch back');
      return;
    }

    try {
      console.log('🔇 Switching back to silent loop...');
      await this.startSilentLoop();
    } catch (error) {
      console.error('❌ Failed to switch back to silent loop:', error);
      // This is not critical - just log the error
    }
  }

  /**
   * Emergency stop - terminate all background audio immediately
   * Use this when app is being closed or in error scenarios
   */
  async emergencyStop(): Promise<void> {
    console.log('🚨 Emergency stop - terminating all background audio');

    try {
      // Stop silent loop
      await this.stopSilentLoop();

      // Reset audio mode to default
      await audioService.resetAudioMode();

      console.log('✅ Emergency stop completed');
    } catch (error) {
      console.error('❌ Emergency stop failed:', error);
      // Force cleanup anyway
      this.silentPlayer = null;
      this.isLoopActive = false;
    }
  }

  /**
   * Check if silent loop is currently active
   */
  isSilentLoopActive(): boolean {
    return this.isLoopActive;
  }

  /**
   * Get current configuration
   */
  getConfig(): BackgroundAlarmConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   * Note: Some changes may require restart of silent loop
   */
  updateConfig(newConfig: Partial<BackgroundAlarmConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };

    console.log('🔧 BackgroundAlarmService config updated:', {
      old: oldConfig,
      new: this.config,
    });

    // If silent loop was disabled, stop it immediately
    if (!this.config.enableSilentLoop && this.isLoopActive) {
      this.stopSilentLoop().catch(console.error);
    }
  }

  /**
   * Get diagnostic information
   */
  getDiagnostics(): {
    initialized: boolean;
    silentLoopActive: boolean;
    config: BackgroundAlarmConfig;
    audioConfigured: boolean;
    platform: string;
  } {
    return {
      initialized: this.isInitialized,
      silentLoopActive: this.isLoopActive,
      config: this.config,
      audioConfigured: audioService.isAudioConfigured(),
      platform: Platform.OS,
    };
  }

  /**
   * Cleanup service - call when app is shutting down
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up BackgroundAlarmService...');

    await this.emergencyStop();

    this.isInitialized = false;
    console.log('✅ BackgroundAlarmService cleanup completed');
  }
}

// Export singleton instance
export const backgroundAlarmService = BackgroundAlarmService.getInstance();
