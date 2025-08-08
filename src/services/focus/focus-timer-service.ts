import { Audio } from 'expo-av';
import { audioService } from '../audio/audio-service';

export interface FocusSession {
  id: string;
  duration: number; // minutes
  breakDuration: number; // minutes
  sessionType: 'focus' | 'break' | 'long-break';
  ambientSound?: string;
  startTime: Date;
}

export interface FocusAmbientSound {
  id: string;
  name: string;
  description: string;
  uri: string;
  category: 'nature' | 'white-noise' | 'binaural' | 'cafe';
}

export class FocusTimerService {
  private static instance: FocusTimerService;
  private currentSession: FocusSession | null = null;
  private ambientSound: Audio.Sound | null = null;
  private sessionTimer: ReturnType<typeof setTimeout> | null = null;
  private isRunning = false;

  static getInstance(): FocusTimerService {
    if (!FocusTimerService.instance) {
      FocusTimerService.instance = new FocusTimerService();
    }
    return FocusTimerService.instance;
  }

  /**
   * Get available ambient sounds for focus sessions
   * This provides legitimate background audio justification
   */
  getAmbientSounds(): FocusAmbientSound[] {
    return [
      {
        id: 'forest-focus',
        name: 'Forest Focus',
        description: 'Gentle forest sounds for deep concentration',
        uri: 'https://www.soundjay.com/misc/sounds/forest-focus-01.wav', // Replace with actual assets
        category: 'nature',
      },
      {
        id: 'rain-focus',
        name: 'Rain Focus',
        description: 'Light rain for enhanced focus',
        uri: 'https://www.soundjay.com/misc/sounds/rain-focus-01.wav', // Replace with actual assets
        category: 'nature',
      },
      {
        id: 'brown-noise-focus',
        name: 'Brown Noise Focus',
        description: 'Deep brown noise for concentration',
        uri: 'https://www.soundjay.com/misc/sounds/brown-noise-focus-01.wav', // Replace with actual assets
        category: 'white-noise',
      },
      {
        id: 'binaural-alpha',
        name: 'Alpha Waves',
        description: 'Binaural beats for enhanced focus (10Hz)',
        uri: 'https://www.soundjay.com/misc/sounds/alpha-waves-01.wav', // Replace with actual assets
        category: 'binaural',
      },
      {
        id: 'cafe-ambience',
        name: 'Café Ambience',
        description: 'Background café sounds for productivity',
        uri: 'https://www.soundjay.com/misc/sounds/cafe-01.wav', // Replace with actual assets
        category: 'cafe',
      },
      {
        id: 'ocean-focus',
        name: 'Ocean Focus',
        description: 'Calm ocean waves for deep work',
        uri: 'https://www.soundjay.com/misc/sounds/ocean-focus-01.wav', // Replace with actual assets
        category: 'nature',
      },
    ];
  }

  /**
   * Start a focus session with optional ambient sound
   * This justifies continuous background audio for productivity
   */
  async startFocusSession(
    duration: number, // minutes
    ambientSoundId?: string,
    sessionType: 'focus' | 'break' = 'focus'
  ): Promise<void> {
    try {
      if (this.isRunning) {
        await this.stopFocusSession();
      }

      console.log(`🎯 Starting ${duration}min ${sessionType} session`);

      // Create session
      this.currentSession = {
        id: `session_${Date.now()}`,
        duration,
        breakDuration: 5, // Default 5min break
        sessionType,
        ambientSound: ambientSoundId,
        startTime: new Date(),
      };

      // Start ambient sound if specified
      if (ambientSoundId) {
        await this.startAmbientSound(ambientSoundId);
      }

      // Set session timer
      this.sessionTimer = setTimeout(
        async () => {
          await this.handleSessionComplete();
        },
        duration * 60 * 1000
      );

      this.isRunning = true;

      console.log('✅ Focus session started');
    } catch (error) {
      console.error('❌ Failed to start focus session:', error);
      throw error;
    }
  }

  /**
   * Stop current focus session
   */
  async stopFocusSession(): Promise<void> {
    try {
      console.log('🎯 Stopping focus session...');

      // Clear timer
      if (this.sessionTimer) {
        clearTimeout(this.sessionTimer);
        this.sessionTimer = null;
      }

      // Stop ambient sound
      if (this.ambientSound) {
        await this.stopAmbientSound();
      }

      this.currentSession = null;
      this.isRunning = false;

      console.log('✅ Focus session stopped');
    } catch (error) {
      console.error('❌ Failed to stop focus session:', error);
      // Force cleanup
      this.currentSession = null;
      this.isRunning = false;
    }
  }

  /**
   * Pause/Resume current focus session
   */
  async pauseFocusSession(): Promise<void> {
    if (!this.isRunning || !this.currentSession) {
      return;
    }

    try {
      if (this.sessionTimer) {
        clearTimeout(this.sessionTimer);
        this.sessionTimer = null;
      }

      // Pause ambient sound by lowering volume
      if (this.ambientSound) {
        await this.ambientSound.setVolumeAsync(0.2);
      }

      this.isRunning = false;
      console.log('⏸️ Focus session paused');
    } catch (error) {
      console.error('❌ Failed to pause focus session:', error);
    }
  }

  /**
   * Resume paused focus session
   */
  async resumeFocusSession(): Promise<void> {
    if (this.isRunning || !this.currentSession) {
      return;
    }

    try {
      // Calculate remaining time
      const elapsed = Date.now() - this.currentSession.startTime.getTime();
      const remaining = this.currentSession.duration * 60 * 1000 - elapsed;

      if (remaining > 0) {
        // Resume timer
        this.sessionTimer = setTimeout(async () => {
          await this.handleSessionComplete();
        }, remaining);

        // Resume ambient sound
        if (this.ambientSound) {
          await this.ambientSound.setVolumeAsync(0.6);
        }

        this.isRunning = true;
        console.log('▶️ Focus session resumed');
      } else {
        // Session already completed
        await this.handleSessionComplete();
      }
    } catch (error) {
      console.error('❌ Failed to resume focus session:', error);
    }
  }

  /**
   * Start ambient sound for focus session
   */
  private async startAmbientSound(soundId: string): Promise<void> {
    try {
      const sound = this.getAmbientSounds().find(s => s.id === soundId);
      if (!sound) {
        console.warn('🎯 Ambient sound not found:', soundId);
        return;
      }

      console.log('🎵 Starting ambient sound:', sound.name);

      // Configure audio for background playback
      await audioService.configureSilentLoopMode();

      // Load and start ambient sound
      const { sound: audioSound } = await Audio.Sound.createAsync(
        { uri: sound.uri },
        {
          shouldPlay: true,
          isLooping: true,
          volume: 0.6,
        }
      );

      this.ambientSound = audioSound;
      console.log('✅ Ambient sound started:', sound.name);
    } catch (error) {
      console.error('❌ Failed to start ambient sound:', error);
      // Continue without ambient sound - focus timer still works
    }
  }

  /**
   * Stop ambient sound
   */
  private async stopAmbientSound(): Promise<void> {
    if (!this.ambientSound) {
      return;
    }

    try {
      console.log('🎵 Stopping ambient sound...');

      // Fade out
      await this.fadeOut(this.ambientSound, 1000);

      await this.ambientSound.stopAsync();
      await this.ambientSound.unloadAsync();

      this.ambientSound = null;
      console.log('✅ Ambient sound stopped');
    } catch (error) {
      console.error('❌ Failed to stop ambient sound:', error);
      this.ambientSound = null;
    }
  }

  /**
   * Handle session completion
   */
  private async handleSessionComplete(): Promise<void> {
    try {
      console.log('🎯 Focus session completed!');

      if (this.currentSession) {
        const sessionType = this.currentSession.sessionType;

        // Suggest break if it was a focus session
        if (sessionType === 'focus') {
          console.log('💡 Time for a break!');
          // You could emit events here to notify UI
        }
      }

      await this.stopFocusSession();
    } catch (error) {
      console.error('❌ Failed to handle session completion:', error);
    }
  }

  /**
   * Fade out audio
   */
  private async fadeOut(sound: Audio.Sound, durationMs: number): Promise<void> {
    try {
      const steps = 10;
      const stepDuration = durationMs / steps;
      const status = await sound.getStatusAsync();
      const currentVolume = status.isLoaded ? status.volume || 0.6 : 0.6;
      const volumeStep = currentVolume / steps;

      for (let i = 0; i < steps; i++) {
        const volume = currentVolume - volumeStep * (i + 1);
        await sound.setVolumeAsync(Math.max(volume, 0));
        await new Promise(resolve => setTimeout(resolve, stepDuration));
      }
    } catch (error) {
      console.error('❌ Fade out failed:', error);
    }
  }

  /**
   * Get current session info
   */
  getCurrentSession(): FocusSession | null {
    return this.currentSession;
  }

  /**
   * Check if session is running
   */
  isSessionRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get session statistics
   */
  getSessionStats(): {
    currentSession: FocusSession | null;
    isRunning: boolean;
    hasAmbientSound: boolean;
    timeRemaining: number | null; // milliseconds
  } {
    let timeRemaining = null;

    if (this.currentSession && this.isRunning) {
      const elapsed = Date.now() - this.currentSession.startTime.getTime();
      timeRemaining = this.currentSession.duration * 60 * 1000 - elapsed;
    }

    return {
      currentSession: this.currentSession,
      isRunning: this.isRunning,
      hasAmbientSound: this.ambientSound !== null,
      timeRemaining,
    };
  }

  /**
   * Cleanup service
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up FocusTimerService...');
    await this.stopFocusSession();
    console.log('✅ FocusTimerService cleanup completed');
  }
}

// Export singleton instance
export const focusTimerService = FocusTimerService.getInstance();
