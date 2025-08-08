import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';
import { Platform } from 'react-native';

export interface AlarmAudioOptions {
  volume?: number;
  shouldLoop?: boolean;
  fadeInDurationMs?: number;
}

export class AudioService {
  private static instance: AudioService;
  private isConfigured = false;
  private currentAlarmPlayer: AudioPlayer | null = null;

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  /**
   * Configure audio for background playbook and alarm functionality
   * This MUST be called before any audio operations
   */
  async configureAudio(): Promise<void> {
    if (this.isConfigured) {
      return;
    }

    try {
      await setAudioModeAsync({
        // Allow audio to continue playing when app goes to background
        shouldPlayInBackground: true,

        // Allow audio to play even when device is in silent mode (iOS)
        playsInSilentMode: true,

        // Don't allow other apps to interrupt our alarm - use doNotMix for alarms
        interruptionMode: 'doNotMix',
        interruptionModeAndroid: 'doNotMix',

        // Don't allow recording to keep permissions minimal
        allowsRecording: false,
      });

      this.isConfigured = true;
      console.log(
        '✅ Audio configured for background playback with expo-audio'
      );
    } catch (error) {
      console.error('❌ Failed to configure audio:', error);
      throw error;
    }
  }

  /**
   * Configure audio specifically for silent loop background mode
   * This is optimized for minimal battery usage while keeping session alive
   */
  async configureSilentLoopMode(): Promise<void> {
    try {
      await setAudioModeAsync({
        shouldPlayInBackground: true,
        playsInSilentMode: true,
        allowsRecording: false, // Minimal permissions for battery optimization
        interruptionMode: 'mixWithOthers', // Less aggressive for background loop
      });

      this.isConfigured = true;
      console.log(
        '✅ Audio configured for silent loop background mode with expo-audio'
      );
    } catch (error) {
      console.error('❌ Failed to configure silent loop audio mode:', error);
      throw error;
    }
  }

  /**
   * Reset audio configuration to default
   */
  async resetAudioMode(): Promise<void> {
    try {
      await setAudioModeAsync({
        shouldPlayInBackground: false,
        playsInSilentMode: false,
        allowsRecording: false,
        interruptionMode: 'mixWithOthers',
      });

      this.isConfigured = false;
      console.log('✅ Audio mode reset to default with expo-audio');
    } catch (error) {
      console.error('❌ Failed to reset audio mode:', error);
      throw error;
    }
  }

  /**
   * Check if audio is properly configured
   */
  isAudioConfigured(): boolean {
    return this.isConfigured;
  }

  /**
   * Load and prepare audio file for playbook
   */
  async loadAudio(uri: string): Promise<AudioPlayer> {
    if (!this.isConfigured) {
      await this.configureAudio();
    }

    try {
      const player = createAudioPlayer({ uri });

      // Set initial configuration
      player.volume = 1.0;

      return player;
    } catch (error) {
      console.error('❌ Failed to load audio:', error);
      throw error;
    }
  }

  /**
   * Load alarm audio with enhanced options for background playbook
   */
  async loadAlarmAudio(
    uri: string,
    options?: AlarmAudioOptions
  ): Promise<AudioPlayer> {
    if (!this.isConfigured) {
      await this.configureAudio();
    }

    const { volume = 1.0, shouldLoop = true } = options || {};

    try {
      const player = createAudioPlayer({ uri });

      // Configure player for alarm use
      player.volume = volume;
      // Note: expo-audio handles looping differently - we'll implement this in playback

      this.currentAlarmPlayer = player;
      console.log(
        '✅ Alarm audio loaded and ready for background playback with expo-audio'
      );

      return player;
    } catch (error) {
      console.error('❌ Failed to load alarm audio:', error);
      throw error;
    }
  }

  /**
   * Play alarm sound with background capability
   * Note: Looping is now handled via longer audio files instead of JS timers
   */
  async playAlarmSound(player: AudioPlayer): Promise<void> {
    try {
      await player.play();
      console.log(
        '✅ Alarm sound started playing with expo-audio (looping via long audio files)'
      );
    } catch (error) {
      console.error('❌ Failed to play alarm sound:', error);
      throw error;
    }
  }

  // Note: setupAudioLooping() method removed - we now use longer audio files
  // instead of JS timer-based looping to avoid background timer issues

  /**
   * Play alarm sound with fade-in effect
   * Note: Looping is now handled via longer audio files instead of JS timers
   */
  async playAlarmSoundWithFadeIn(
    player: AudioPlayer,
    fadeInMs: number = 2000
  ): Promise<void> {
    try {
      // Start at low volume
      player.volume = 0.1;
      await player.play();

      // Gradually increase volume over fadeInMs
      const steps = 20;
      const stepDuration = fadeInMs / steps;
      const volumeStep = 0.9 / steps; // From 0.1 to 1.0

      for (let i = 0; i < steps; i++) {
        const volume = 0.1 + volumeStep * (i + 1);
        player.volume = Math.min(volume, 1.0);
        await new Promise(resolve => setTimeout(resolve, stepDuration));
      }

      console.log(
        `✅ Alarm sound started with ${fadeInMs}ms fade-in (looping via long audio files)`
      );
    } catch (error) {
      console.error('❌ Failed to play alarm sound with fade-in:', error);
      throw error;
    }
  }

  /**
   * Stop alarm sound
   */
  async stopAlarmSound(player: AudioPlayer): Promise<void> {
    try {
      await player.pause();

      // Clear current alarm player reference
      if (this.currentAlarmPlayer === player) {
        this.currentAlarmPlayer = null;
      }

      console.log('✅ Alarm sound stopped');
    } catch (error) {
      console.error('❌ Failed to stop alarm sound:', error);
      throw error;
    }
  }

  /**
   * Stop current alarm sound (if any)
   */
  async stopCurrentAlarmSound(): Promise<void> {
    if (!this.currentAlarmPlayer) {
      console.log('🔇 No current alarm player to stop');
      return;
    }

    try {
      await this.stopAlarmSound(this.currentAlarmPlayer);
    } catch (error) {
      console.error('❌ Failed to stop current alarm sound:', error);
      // Force cleanup
      this.currentAlarmPlayer = null;
    }
  }

  /**
   * Emergency stop all audio - force cleanup
   */
  async stopAllAudio(): Promise<void> {
    try {
      // Stop current alarm player if any
      await this.stopCurrentAlarmSound();

      // Reset audio mode and re-configure
      await this.resetAudioMode();
      await this.configureAudio();

      console.log('✅ All audio stopped and reset with expo-audio');
    } catch (error) {
      console.error('❌ Failed to stop all audio:', error);
      throw error;
    }
  }

  /**
   * Get current alarm player instance
   */
  getCurrentAlarmPlayer(): AudioPlayer | null {
    return this.currentAlarmPlayer;
  }

  /**
   * Check if alarm sound is currently playing
   */
  async isAlarmPlaying(): Promise<boolean> {
    if (!this.currentAlarmPlayer) {
      return false;
    }

    try {
      // expo-audio doesn't have an isPlaying property, but we can check if current time is advancing
      // For now, we'll assume if we have a current player, it's playing (simplified)
      return true;
    } catch (error) {
      console.error('❌ Failed to check alarm playing status:', error);
      return false;
    }
  }

  /**
   * Get diagnostics for the audio service
   */
  getDiagnostics(): {
    configured: boolean;
    hasCurrentAlarmPlayer: boolean;
    platform: string;
  } {
    return {
      configured: this.isConfigured,
      hasCurrentAlarmPlayer: this.currentAlarmPlayer !== null,
      platform: Platform.OS,
    };
  }
}

// Export singleton instance
export const audioService = AudioService.getInstance();
