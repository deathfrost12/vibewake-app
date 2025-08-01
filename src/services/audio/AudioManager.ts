import { Audio } from 'expo-av';
import { AVPlaybackStatus } from 'expo-av';
import { AudioTrack } from './types';
import { SoundLibrary } from './SoundLibrary';

export interface PlaybackState {
  isLoaded: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  position: number;
  duration: number;
  volume: number;
}

export interface AlarmPlaybackOptions {
  preferredTrack: AudioTrack;
  fallbackSoundId?: string;
  onSpotifyPlayerNeeded?: (track: AudioTrack) => void;
  onPlaybackFailed?: (error: Error, fallbackUsed: boolean) => void;
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

      // Handle Spotify tracks
      if (track.type === 'spotify') {
        if (!track.uri || track.uri.trim() === '') {
          throw new Error(
            'This Spotify track does not have a preview available. Please choose a different track.'
          );
        }

        // Spotify preview URLs are direct audio streams, should work with expo-av
        console.log('🎵 Loading Spotify preview URL:', track.uri);
      } else {
        // Validate URI for other track types
        if (!track.uri || track.uri.trim() === '') {
          throw new Error('Invalid audio URI: empty or undefined');
        }
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

  removePlaybackStatusListener(
    listener: (status: PlaybackState) => void
  ): void {
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

  // HYBRID ALARM PLAYBACK METHODS
  
  /**
   * Play audio for alarm with smart fallback strategy
   * For Spotify tracks without preview: plays fallback and triggers Spotify player callback
   * For other tracks: attempts direct playback with fallback on error
   */
  async playAlarmAudio(options: AlarmPlaybackOptions): Promise<{
    success: boolean;
    usedFallback: boolean;
    requiresSpotifyPlayer: boolean;
  }> {
    const { preferredTrack, fallbackSoundId, onSpotifyPlayerNeeded, onPlaybackFailed } = options;
    
    console.log('🚨 Starting alarm playback for:', preferredTrack.name);
    console.log('🚨 Track type:', preferredTrack.type, 'URI:', preferredTrack.uri);

    // Strategy 1: Handle Spotify tracks without preview URL
    if (preferredTrack.type === 'spotify' && (!preferredTrack.uri || preferredTrack.uri.trim() === '')) {
      console.log('🎵 Spotify track has no preview URL, using fallback + Spotify player option');
      
      // Play fallback sound immediately for reliable alarm
      const fallbackResult = await this.playFallbackSound(fallbackSoundId);
      
      // Notify that Spotify player is needed for full track
      if (onSpotifyPlayerNeeded) {
        onSpotifyPlayerNeeded(preferredTrack);
      }
      
      return {
        success: fallbackResult,
        usedFallback: true,
        requiresSpotifyPlayer: true,
      };
    }

    // Strategy 2: Try to play the preferred track directly
    try {
      await this.loadAudio(preferredTrack);
      await this.playAsync();
      
      console.log('✅ Successfully playing preferred track');
      return {
        success: true,
        usedFallback: false,
        requiresSpotifyPlayer: false,
      };
    } catch (error) {
      console.warn('⚠️ Failed to play preferred track, trying fallback:', error);
      
      // Strategy 3: Fallback to reliable local sound
      const fallbackResult = await this.playFallbackSound(fallbackSoundId);
      
      if (onPlaybackFailed) {
        onPlaybackFailed(error as Error, true);
      }
      
      // For Spotify tracks, also offer the web player option
      const requiresSpotifyPlayer = preferredTrack.type === 'spotify';
      if (requiresSpotifyPlayer && onSpotifyPlayerNeeded) {
        onSpotifyPlayerNeeded(preferredTrack);
      }
      
      return {
        success: fallbackResult,
        usedFallback: true,
        requiresSpotifyPlayer,
      };
    }
  }

  /**
   * Play a reliable fallback sound for alarms
   */
  async playFallbackSound(fallbackSoundId?: string): Promise<boolean> {
    try {
      console.log('🔄 Playing fallback alarm sound');
      
      // Use provided fallback or default to first predefined sound
      const soundId = fallbackSoundId || SoundLibrary.getAllSounds()[0]?.id;
      if (!soundId) {
        console.error('❌ No fallback sound available');
        return false;
      }

      const fallbackSound = SoundLibrary.getSoundById(soundId);
      if (!fallbackSound) {
        console.error('❌ Fallback sound not found:', soundId);
        return false;
      }

      // Convert to AudioTrack and play
      const fallbackTrack = await SoundLibrary.convertToAudioTrack(fallbackSound);
      await this.loadAudio(fallbackTrack);
      await this.setIsLoopingAsync(true); // Loop alarm sound
      await this.playAsync();
      
      console.log('✅ Fallback sound playing:', fallbackSound.name);
      return true;
    } catch (error) {
      console.error('❌ Failed to play fallback sound:', error);
      return false;
    }
  }

  /**
   * Check if a track can be played reliably without fallback
   */
  canPlayReliably(track: AudioTrack): boolean {
    switch (track.type) {
      case 'predefined':
      case 'uploaded':
        return true;
      case 'spotify':
        return !!(track.uri && track.uri.trim() !== '');
      default:
        return false;
    }
  }

  /**
   * Get recommended fallback sound for a track
   */
  getRecommendedFallback(track: AudioTrack): string {
    // For now, use the default alarm sound
    // Could be enhanced to pick based on track genre, energy, etc.
    const defaultSound = SoundLibrary.getAllSounds()[0];
    return defaultSound?.id || 'alarm-classic';
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
