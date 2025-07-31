import { useAudioPlayer, AudioPlayer } from 'expo-audio';
import { AudioTrack } from './types';

export interface PlaybackState {
  isLoaded: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  position: number;
  duration: number;
  volume: number;
}

class AudioManagerClass {
  private audioPlayer: AudioPlayer | null = null;
  private isInitialized: boolean = false;
  private playbackStatusListeners: ((status: PlaybackState) => void)[] = [];
  private currentTrack: AudioTrack | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // expo-audio handles audio mode configuration automatically
      this.isInitialized = true;
      console.log('🎵 AudioManager initialized with expo-audio');
    } catch (error) {
      console.error('❌ Failed to initialize AudioManager:', error);
      throw error;
    }
  }

  async loadAudio(track: AudioTrack): Promise<void> {
    try {
      // Unload previous audio if exists
      await this.unloadAudio();

      console.log('🎵 Loading audio:', track.name, 'URI:', track.uri);
      console.log('🎵 Track type:', track.type);
      
      // Validate URI
      if (!track.uri || track.uri.trim() === '') {
        throw new Error('Invalid audio URI: empty or undefined');
      }
      
      // Create new audio player instance using the functional approach
      // Note: We'll need to adapt this to work with the class-based approach
      this.currentTrack = track;
      
      console.log('✅ Audio track prepared for loading');
    } catch (error) {
      console.error('❌ Failed to load audio:', error);
      console.error('❌ Track details:', track);
      throw error;
    }
  }

  async playAsync(): Promise<void> {
    if (!this.currentTrack) {
      throw new Error('No audio loaded');
    }

    try {
      console.log('🎵 Playing audio');
      
      // For expo-audio, we need to use the hook-based approach or direct player methods
      // This will need to be adapted based on how we integrate with the hook system
      if (this.audioPlayer) {
        this.audioPlayer.play();
      }
      
    } catch (error) {
      console.error('❌ Failed to play audio:', error);
      throw error;
    }
  }

  async pauseAsync(): Promise<void> {
    if (!this.audioPlayer) {
      throw new Error('No audio loaded');
    }

    try {
      console.log('⏸️ Pausing audio');
      this.audioPlayer.pause();
    } catch (error) {
      console.error('❌ Failed to pause audio:', error);
      throw error;
    }
  }

  async stopAsync(): Promise<void> {
    if (!this.audioPlayer) {
      return;
    }

    try {
      console.log('⏹️ Stopping audio');
      this.audioPlayer.pause();
      
      // expo-audio doesn't auto-reset position, so we need to seek to beginning
      this.audioPlayer.seekTo(0);
    } catch (error) {
      console.error('❌ Failed to stop audio:', error);
      throw error;
    }
  }

  async setVolumeAsync(volume: number): Promise<void> {
    if (!this.audioPlayer) {
      throw new Error('No audio loaded');
    }

    try {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      this.audioPlayer.volume = clampedVolume;
    } catch (error) {
      console.error('❌ Failed to set volume:', error);
      throw error;
    }
  }

  async setPositionAsync(position: number): Promise<void> {
    if (!this.audioPlayer) {
      throw new Error('No audio loaded');
    }

    try {
      // Convert milliseconds to seconds for expo-audio
      const positionInSeconds = position / 1000;
      this.audioPlayer.seekTo(positionInSeconds);
    } catch (error) {
      console.error('❌ Failed to set position:', error);
      throw error;
    }
  }

  async setIsLoopingAsync(isLooping: boolean): Promise<void> {
    if (!this.audioPlayer) {
      throw new Error('No audio loaded');
    }

    try {
      this.audioPlayer.loop = isLooping;
    } catch (error) {
      console.error('❌ Failed to set looping:', error);
      throw error;
    }
  }

  async unloadAudio(): Promise<void> {
    if (this.audioPlayer) {
      try {
        console.log('🗑️ Unloading audio');
        // expo-audio handles cleanup automatically when component unmounts
        // or when a new audio source is loaded
        this.audioPlayer = null;
        this.currentTrack = null;
      } catch (error) {
        console.error('❌ Failed to unload audio:', error);
      }
    }
  }

  async getStatusAsync(): Promise<PlaybackState | null> {
    if (!this.audioPlayer) {
      return null;
    }

    try {
      // expo-audio provides these properties directly on the player
      return {
        isLoaded: this.audioPlayer.isLoaded,
        isPlaying: this.audioPlayer.playing,
        isPaused: !this.audioPlayer.playing && this.audioPlayer.currentTime > 0,
        position: this.audioPlayer.currentTime * 1000, // Convert to milliseconds
        duration: this.audioPlayer.duration * 1000, // Convert to milliseconds
        volume: this.audioPlayer.volume,
      };
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

  // Helper method to create an audio player for a specific track
  // This will be used by components that need to play audio
  createPlayerForTrack(track: AudioTrack): AudioPlayer {
    console.log('🎵 Creating audio player for track:', track.name);
    
    // This is a placeholder - actual implementation will depend on how we integrate
    // with the hook-based system of expo-audio
    return {} as AudioPlayer;
  }

  // Method to set the active audio player (used by components)
  setActivePlayer(player: AudioPlayer): void {
    this.audioPlayer = player;
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