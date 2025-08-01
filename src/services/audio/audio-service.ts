import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';

export class AudioService {
  private static instance: AudioService;
  private isConfigured = false;

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
   * Stop alarm sound
   */
  async stopAlarmSound(sound: Audio.Sound): Promise<void> {
    try {
      await sound.stopAsync();
      await sound.unloadAsync();
      console.log('✅ Alarm sound stopped');
    } catch (error) {
      console.error('❌ Failed to stop alarm sound:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const audioService = AudioService.getInstance();
