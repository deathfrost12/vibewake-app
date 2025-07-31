import { Audio } from 'expo-av';
import { AVPlaybackStatus } from 'expo-av';

export interface AudioTrack {
  id: string;
  name: string;
  uri: string;
  type: 'predefined' | 'uploaded' | 'spotify';
  duration?: number;
}

export interface PlaybackState {
  isLoaded: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  position: number;
  duration: number;
  volume: number;
}

class AudioManagerClass {
  private sound: Audio.Sound | null = null;
  private isInitialized: boolean = false;
  private playbackStatusListeners: ((status: PlaybackState) => void)[] = [];

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Configure audio mode for alarm functionality
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      this.isInitialized = true;
      console.log('🎵 AudioManager initialized');
    } catch (error) {
      console.error('❌ Failed to initialize AudioManager:', error);
      throw error;
    }
  }

  async loadAudio(track: AudioTrack): Promise<void> {
    try {
      // Unload previous sound if exists
      await this.unloadAudio();

      console.log('🎵 Loading audio:', track.name, 'URI:', track.uri);
      console.log('🎵 Track type:', track.type);
      
      // Validate URI
      if (!track.uri || track.uri.trim() === '') {
        throw new Error('Invalid audio URI: empty or undefined');
      }
      
      const { sound, status } = await Audio.Sound.createAsync(
        { uri: track.uri },
        { 
          shouldPlay: false,
          volume: 1.0,
          rate: 1.0,
          isLooping: false,
        },
        this.onPlaybackStatusUpdate
      );

      this.sound = sound;
      console.log('✅ Audio loaded successfully');
      console.log('🎵 Initial load status:', status);
    } catch (error) {
      console.error('❌ Failed to load audio:', error);
      console.error('❌ Track details:', track);
      console.error('❌ Error details:', error);
      throw error;
    }
  }

  async playAsync(): Promise<void> {
    if (!this.sound) {
      throw new Error('No audio loaded');
    }

    try {
      console.log('🎵 Playing audio');
      const status = await this.sound.getStatusAsync();
      console.log('🎵 Audio status before play:', status);
      
      await this.sound.playAsync();
      
      const statusAfter = await this.sound.getStatusAsync();
      console.log('🎵 Audio status after play:', statusAfter);
    } catch (error) {
      console.error('❌ Failed to play audio:', error);
      throw error;
    }
  }

  async pauseAsync(): Promise<void> {
    if (!this.sound) {
      throw new Error('No audio loaded');
    }

    try {
      console.log('⏸️ Pausing audio');
      await this.sound.pauseAsync();
    } catch (error) {
      console.error('❌ Failed to pause audio:', error);
      throw error;
    }
  }

  async stopAsync(): Promise<void> {
    if (!this.sound) {
      return;
    }

    try {
      console.log('⏹️ Stopping audio');
      await this.sound.stopAsync();
      await this.sound.setPositionAsync(0);
    } catch (error) {
      console.error('❌ Failed to stop audio:', error);
      throw error;
    }
  }

  async setVolumeAsync(volume: number): Promise<void> {
    if (!this.sound) {
      throw new Error('No audio loaded');
    }

    try {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      await this.sound.setVolumeAsync(clampedVolume);
    } catch (error) {
      console.error('❌ Failed to set volume:', error);
      throw error;
    }
  }

  async setPositionAsync(position: number): Promise<void> {
    if (!this.sound) {
      throw new Error('No audio loaded');
    }

    try {
      await this.sound.setPositionAsync(position);
    } catch (error) {
      console.error('❌ Failed to set position:', error);
      throw error;
    }
  }

  async setIsLoopingAsync(isLooping: boolean): Promise<void> {
    if (!this.sound) {
      throw new Error('No audio loaded');
    }

    try {
      await this.sound.setIsLoopingAsync(isLooping);
    } catch (error) {
      console.error('❌ Failed to set looping:', error);
      throw error;
    }
  }

  async unloadAudio(): Promise<void> {
    if (this.sound) {
      try {
        console.log('🗑️ Unloading audio');
        await this.sound.unloadAsync();
        this.sound = null;
      } catch (error) {
        console.error('❌ Failed to unload audio:', error);
      }
    }
  }

  async getStatusAsync(): Promise<PlaybackState | null> {
    if (!this.sound) {
      return null;
    }

    try {
      const status = await this.sound.getStatusAsync();
      return this.mapPlaybackStatus(status);
    } catch (error) {
      console.error('❌ Failed to get status:', error);
      return null;
    }
  }

  addPlaybackStatusListener(listener: (status: PlaybackState) => void): void {
    this.playbackStatusListeners.push(listener);
  }

  removePlaybackStatusListener(listener: (status: PlaybackState) => void): void {
    const index = this.playbackStatusListeners.indexOf(listener);
    if (index > -1) {
      this.playbackStatusListeners.splice(index, 1);
    }
  }

  private onPlaybackStatusUpdate = (status: AVPlaybackStatus): void => {
    const playbackState = this.mapPlaybackStatus(status);
    if (playbackState) {
      this.playbackStatusListeners.forEach(listener => listener(playbackState));
    }
  };

  private mapPlaybackStatus(status: AVPlaybackStatus): PlaybackState | null {
    if (!status.isLoaded) {
      return null;
    }

    return {
      isLoaded: status.isLoaded,
      isPlaying: status.isPlaying,
      isPaused: !status.isPlaying && status.positionMillis > 0,
      position: status.positionMillis,
      duration: status.durationMillis || 0,
      volume: status.volume || 1.0,
    };
  }

  // Cleanup method
  async cleanup(): Promise<void> {
    await this.unloadAudio();
    this.playbackStatusListeners = [];
    this.isInitialized = false;
    console.log('🧹 AudioManager cleaned up');
  }
}

// Export singleton instance
export const AudioManager = new AudioManagerClass();