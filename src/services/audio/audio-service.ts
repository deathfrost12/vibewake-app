import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import { Platform } from 'react-native';

export interface AlarmAudioOptions {
  volume?: number;
  shouldLoop?: boolean;
  fadeInDurationMs?: number;
}

export class AudioService {
  private static instance: AudioService;
  private isConfigured = false;
  private currentAlarmSound: Audio.Sound | null = null;

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  /**
   * Configure audio for background playback and alarm functionality
   * This MUST be called before any audio operations
   */
  async configureAudio(): Promise<void> {
    if (this.isConfigured) {
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        // Allow audio to continue playing when app goes to background
        staysActiveInBackground: true,

        // Allow audio to play even when device is in silent mode (iOS)
        playsInSilentModeIOS: true,

        // Set interruption mode for iOS - prioritize alarm over other audio
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,

        // Set interruption mode for Android - prioritize alarm over other audio
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,

        // Duck other audio when our alarm plays (lower their volume)
        shouldDuckAndroid: true,

        // Play through earpiece if no headphones (important for alarms)
        playThroughEarpieceAndroid: false,

        // Allow recording (if we need it for voice notes later)
        allowsRecordingIOS: false,
      });

      this.isConfigured = true;
      console.log('✅ Audio configured for background playback');
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
      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        shouldDuckAndroid: false, // Don't duck others for silent audio
        playThroughEarpieceAndroid: false,
        allowsRecordingIOS: false,
      });

      this.isConfigured = true;
      console.log('✅ Audio configured for silent loop background mode');
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
      await Audio.setAudioModeAsync({
        staysActiveInBackground: false,
        playsInSilentModeIOS: false,
        interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        allowsRecordingIOS: false,
      });

      this.isConfigured = false;
      console.log('✅ Audio mode reset to default');
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
   * Load and prepare audio file for playback
   */
  async loadAudio(uri: string): Promise<Audio.Sound> {
    if (!this.isConfigured) {
      await this.configureAudio();
    }

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        {
          shouldPlay: false,
          isLooping: true, // Alarms should loop until dismissed
          volume: 1.0,
        }
      );

      return sound;
    } catch (error) {
      console.error('❌ Failed to load audio:', error);
      throw error;
    }
  }

  /**
   * Load alarm audio with enhanced options for background playback
   */
  async loadAlarmAudio(uri: string, options?: AlarmAudioOptions): Promise<Audio.Sound> {
    if (!this.isConfigured) {
      await this.configureAudio();
    }

    const {
      volume = 1.0,
      shouldLoop = true,
    } = options || {};

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        {
          shouldPlay: false,
          isLooping: shouldLoop,
          volume,
          positionMillis: 0,
        },
        null
      );

      this.currentAlarmSound = sound;
      console.log('✅ Alarm audio loaded and ready for background playback');
      
      return sound;
    } catch (error) {
      console.error('❌ Failed to load alarm audio:', error);
      throw error;
    }
  }

  /**
   * Play alarm sound with background capability
   */
  async playAlarmSound(sound: Audio.Sound): Promise<void> {
    try {
      await sound.playAsync();
      console.log('✅ Alarm sound started playing');
    } catch (error) {
      console.error('❌ Failed to play alarm sound:', error);
      throw error;
    }
  }

  /**
   * Play alarm sound with fade-in effect
   */
  async playAlarmSoundWithFadeIn(sound: Audio.Sound, fadeInMs: number = 2000): Promise<void> {
    try {
      // Start at low volume
      await sound.setVolumeAsync(0.1);
      await sound.playAsync();

      // Gradually increase volume over fadeInMs
      const steps = 20;
      const stepDuration = fadeInMs / steps;
      const volumeStep = 0.9 / steps; // From 0.1 to 1.0

      for (let i = 0; i < steps; i++) {
        const volume = 0.1 + (volumeStep * (i + 1));
        await sound.setVolumeAsync(Math.min(volume, 1.0));
        await new Promise(resolve => setTimeout(resolve, stepDuration));
      }

      console.log(`✅ Alarm sound started with ${fadeInMs}ms fade-in`);
    } catch (error) {
      console.error('❌ Failed to play alarm sound with fade-in:', error);
      throw error;
    }
  }

  /**
   * Stop alarm sound
   */
  async stopAlarmSound(sound: Audio.Sound): Promise<void> {
    try {
      await sound.stopAsync();
      await sound.unloadAsync();
      
      // Clear current alarm sound reference
      if (this.currentAlarmSound === sound) {
        this.currentAlarmSound = null;
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
    if (!this.currentAlarmSound) {
      console.log('🔇 No current alarm sound to stop');
      return;
    }

    try {
      await this.stopAlarmSound(this.currentAlarmSound);
    } catch (error) {
      console.error('❌ Failed to stop current alarm sound:', error);
      // Force cleanup
      this.currentAlarmSound = null;
    }
  }

  /**
   * Emergency stop all audio - force cleanup
   */
  async stopAllAudio(): Promise<void> {
    try {
      // Stop current alarm sound if any
      await this.stopCurrentAlarmSound();

      // Stop all sound instances across the app
      await Audio.setIsEnabledAsync(false);
      await Audio.setIsEnabledAsync(true);

      // Re-configure audio for next use
      await this.configureAudio();

      console.log('✅ All audio stopped and reset');
    } catch (error) {
      console.error('❌ Failed to stop all audio:', error);
      throw error;
    }
  }

  /**
   * Get current alarm sound instance
   */
  getCurrentAlarmSound(): Audio.Sound | null {
    return this.currentAlarmSound;
  }

  /**
   * Check if alarm sound is currently playing
   */
  async isAlarmPlaying(): Promise<boolean> {
    if (!this.currentAlarmSound) {
      return false;
    }

    try {
      const status = await this.currentAlarmSound.getStatusAsync();
      return status.isLoaded && status.isPlaying;
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
    hasCurrentAlarmSound: boolean;
    platform: string;
  } {
    return {
      configured: this.isConfigured,
      hasCurrentAlarmSound: this.currentAlarmSound !== null,
      platform: Platform.OS,
    };
  }
}

// Export singleton instance
export const audioService = AudioService.getInstance();
