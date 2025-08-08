import { Audio } from 'expo-av';
import { audioService } from '../audio/audio-service';

export interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  inhaleSeconds: number;
  holdInSeconds: number;
  exhaleSeconds: number;
  holdOutSeconds: number;
  cycles: number; // -1 for infinite
  guideSound?: string; // Audio guide URI
}

export interface BreathingSession {
  id: string;
  pattern: BreathingPattern;
  startTime: Date;
  currentCycle: number;
  currentPhase: 'inhale' | 'hold-in' | 'exhale' | 'hold-out';
  isActive: boolean;
}

export class BreathingExerciseService {
  private static instance: BreathingExerciseService;
  private currentSession: BreathingSession | null = null;
  private backgroundSound: Audio.Sound | null = null;
  private guideSound: Audio.Sound | null = null;
  private sessionTimer: ReturnType<typeof setTimeout> | null = null;
  private phaseTimer: ReturnType<typeof setTimeout> | null = null;

  static getInstance(): BreathingExerciseService {
    if (!BreathingExerciseService.instance) {
      BreathingExerciseService.instance = new BreathingExerciseService();
    }
    return BreathingExerciseService.instance;
  }

  /**
   * Get available breathing patterns
   * This provides legitimate background audio justification for wellness
   */
  getBreathingPatterns(): BreathingPattern[] {
    return [
      {
        id: '4-7-8',
        name: '4-7-8 Breathing',
        description: 'Inhale 4s, hold 7s, exhale 8s - for relaxation and sleep',
        inhaleSeconds: 4,
        holdInSeconds: 7,
        exhaleSeconds: 8,
        holdOutSeconds: 0,
        cycles: 8,
        guideSound: 'https://www.soundjay.com/misc/sounds/breath-guide-478.wav', // Replace with actual
      },
      {
        id: 'box-breathing',
        name: 'Box Breathing',
        description: 'Equal 4s intervals - for stress relief and focus',
        inhaleSeconds: 4,
        holdInSeconds: 4,
        exhaleSeconds: 4,
        holdOutSeconds: 4,
        cycles: 10,
        guideSound: 'https://www.soundjay.com/misc/sounds/breath-guide-box.wav', // Replace with actual
      },
      {
        id: 'coherent-breathing',
        name: 'Coherent Breathing',
        description: '5s in, 5s out - for heart rate variability',
        inhaleSeconds: 5,
        holdInSeconds: 0,
        exhaleSeconds: 5,
        holdOutSeconds: 0,
        cycles: 20,
        guideSound:
          'https://www.soundjay.com/misc/sounds/breath-guide-coherent.wav', // Replace with actual
      },
      {
        id: 'extended-exhale',
        name: 'Extended Exhale',
        description:
          '4s in, 6s out - for anxiety and nervous system regulation',
        inhaleSeconds: 4,
        holdInSeconds: 0,
        exhaleSeconds: 6,
        holdOutSeconds: 0,
        cycles: 15,
        guideSound:
          'https://www.soundjay.com/misc/sounds/breath-guide-extended.wav', // Replace with actual
      },
      {
        id: 'mindful-breathing',
        name: 'Mindful Breathing',
        description: 'Natural rhythm with mindful awareness - continuous',
        inhaleSeconds: 6,
        holdInSeconds: 2,
        exhaleSeconds: 6,
        holdOutSeconds: 2,
        cycles: -1, // Continuous
        guideSound:
          'https://www.soundjay.com/misc/sounds/breath-guide-mindful.wav', // Replace with actual
      },
    ];
  }

  /**
   * Start breathing exercise session with background audio guidance
   * This justifies continuous background audio for wellness features
   */
  async startBreathingSession(
    patternId: string,
    backgroundSoundUri?: string
  ): Promise<void> {
    try {
      if (this.currentSession?.isActive) {
        await this.stopBreathingSession();
      }

      const pattern = this.getBreathingPatterns().find(p => p.id === patternId);
      if (!pattern) {
        throw new Error(`Breathing pattern not found: ${patternId}`);
      }

      console.log('🫁 Starting breathing session:', pattern.name);

      // Create session
      this.currentSession = {
        id: `breath_${Date.now()}`,
        pattern,
        startTime: new Date(),
        currentCycle: 0,
        currentPhase: 'inhale',
        isActive: true,
      };

      // Configure audio for background playback
      await audioService.configureSilentLoopMode();

      // Start background sound if provided
      if (backgroundSoundUri) {
        await this.startBackgroundSound(backgroundSoundUri);
      }

      // Start breathing guide audio if available
      if (pattern.guideSound) {
        await this.startGuideSound(pattern.guideSound);
      }

      // Start breathing cycle
      await this.startBreathingCycle();

      console.log('✅ Breathing session started');
    } catch (error) {
      console.error('❌ Failed to start breathing session:', error);
      throw error;
    }
  }

  /**
   * Stop breathing session
   */
  async stopBreathingSession(): Promise<void> {
    try {
      console.log('🫁 Stopping breathing session...');

      // Clear timers
      if (this.sessionTimer) {
        clearTimeout(this.sessionTimer);
        this.sessionTimer = null;
      }
      if (this.phaseTimer) {
        clearTimeout(this.phaseTimer);
        this.phaseTimer = null;
      }

      // Stop audio
      await this.stopBackgroundSound();
      await this.stopGuideSound();

      // Clear session
      if (this.currentSession) {
        this.currentSession.isActive = false;
        this.currentSession = null;
      }

      console.log('✅ Breathing session stopped');
    } catch (error) {
      console.error('❌ Failed to stop breathing session:', error);
      // Force cleanup
      this.currentSession = null;
    }
  }

  /**
   * Pause/Resume breathing session
   */
  async pauseBreathingSession(): Promise<void> {
    if (!this.currentSession?.isActive) return;

    try {
      // Clear timers
      if (this.phaseTimer) {
        clearTimeout(this.phaseTimer);
        this.phaseTimer = null;
      }

      // Lower background sound volume
      if (this.backgroundSound) {
        await this.backgroundSound.setVolumeAsync(0.3);
      }

      this.currentSession.isActive = false;
      console.log('⏸️ Breathing session paused');
    } catch (error) {
      console.error('❌ Failed to pause breathing session:', error);
    }
  }

  async resumeBreathingSession(): Promise<void> {
    if (!this.currentSession || this.currentSession.isActive) return;

    try {
      // Restore background sound volume
      if (this.backgroundSound) {
        await this.backgroundSound.setVolumeAsync(0.6);
      }

      this.currentSession.isActive = true;

      // Resume breathing cycle from current phase
      await this.continueBreathingCycle();

      console.log('▶️ Breathing session resumed');
    } catch (error) {
      console.error('❌ Failed to resume breathing session:', error);
    }
  }

  /**
   * Start background sound for breathing session
   */
  private async startBackgroundSound(uri: string): Promise<void> {
    try {
      console.log('🎵 Starting breathing background sound');

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        {
          shouldPlay: true,
          isLooping: true,
          volume: 0.6,
        }
      );

      this.backgroundSound = sound;
      console.log('✅ Breathing background sound started');
    } catch (error) {
      console.error('❌ Failed to start breathing background sound:', error);
      // Continue without background sound - breathing exercise still works
    }
  }

  /**
   * Start guided breathing audio
   */
  private async startGuideSound(uri: string): Promise<void> {
    try {
      console.log('🗣️ Starting breathing guide sound');

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        {
          shouldPlay: false,
          isLooping: true,
          volume: 0.8,
        }
      );

      this.guideSound = sound;
      await sound.playAsync();

      console.log('✅ Breathing guide sound started');
    } catch (error) {
      console.error('❌ Failed to start breathing guide sound:', error);
      // Continue without guide sound
    }
  }

  /**
   * Stop background sound
   */
  private async stopBackgroundSound(): Promise<void> {
    if (!this.backgroundSound) return;

    try {
      await this.backgroundSound.stopAsync();
      await this.backgroundSound.unloadAsync();
      this.backgroundSound = null;
    } catch (error) {
      console.error('❌ Failed to stop breathing background sound:', error);
      this.backgroundSound = null;
    }
  }

  /**
   * Stop guide sound
   */
  private async stopGuideSound(): Promise<void> {
    if (!this.guideSound) return;

    try {
      await this.guideSound.stopAsync();
      await this.guideSound.unloadAsync();
      this.guideSound = null;
    } catch (error) {
      console.error('❌ Failed to stop breathing guide sound:', error);
      this.guideSound = null;
    }
  }

  /**
   * Start breathing cycle phases
   */
  private async startBreathingCycle(): Promise<void> {
    if (!this.currentSession?.isActive) return;

    const pattern = this.currentSession.pattern;

    // Check if we've completed all cycles
    if (
      pattern.cycles !== -1 &&
      this.currentSession.currentCycle >= pattern.cycles
    ) {
      console.log('🫁 Breathing session completed!');
      await this.stopBreathingSession();
      return;
    }

    await this.executePhase('inhale', pattern.inhaleSeconds * 1000);
  }

  /**
   * Continue breathing cycle from current phase
   */
  private async continueBreathingCycle(): Promise<void> {
    if (!this.currentSession?.isActive) return;

    const session = this.currentSession;
    const pattern = session.pattern;

    // Resume from current phase
    switch (session.currentPhase) {
      case 'inhale':
        await this.executePhase('inhale', pattern.inhaleSeconds * 1000);
        break;
      case 'hold-in':
        await this.executePhase('hold-in', pattern.holdInSeconds * 1000);
        break;
      case 'exhale':
        await this.executePhase('exhale', pattern.exhaleSeconds * 1000);
        break;
      case 'hold-out':
        await this.executePhase('hold-out', pattern.holdOutSeconds * 1000);
        break;
    }
  }

  /**
   * Execute breathing phase
   */
  private async executePhase(
    phase: BreathingSession['currentPhase'],
    durationMs: number
  ): Promise<void> {
    if (!this.currentSession?.isActive) return;

    this.currentSession.currentPhase = phase;
    console.log(`🫁 Phase: ${phase} (${durationMs / 1000}s)`);

    // You could emit events here to update UI visualization

    this.phaseTimer = setTimeout(async () => {
      if (!this.currentSession?.isActive) return;

      const pattern = this.currentSession.pattern;

      switch (phase) {
        case 'inhale':
          if (pattern.holdInSeconds > 0) {
            await this.executePhase('hold-in', pattern.holdInSeconds * 1000);
          } else {
            await this.executePhase('exhale', pattern.exhaleSeconds * 1000);
          }
          break;

        case 'hold-in':
          await this.executePhase('exhale', pattern.exhaleSeconds * 1000);
          break;

        case 'exhale':
          if (pattern.holdOutSeconds > 0) {
            await this.executePhase('hold-out', pattern.holdOutSeconds * 1000);
          } else {
            // Complete cycle
            this.currentSession.currentCycle++;
            await this.startBreathingCycle();
          }
          break;

        case 'hold-out':
          // Complete cycle
          this.currentSession.currentCycle++;
          await this.startBreathingCycle();
          break;
      }
    }, durationMs);
  }

  /**
   * Get current session info
   */
  getCurrentSession(): BreathingSession | null {
    return this.currentSession;
  }

  /**
   * Get session statistics
   */
  getSessionStats(): {
    currentSession: BreathingSession | null;
    isActive: boolean;
    hasBackgroundSound: boolean;
    hasGuideSound: boolean;
    completionPercent: number;
  } {
    let completionPercent = 0;

    if (this.currentSession && this.currentSession.pattern.cycles > 0) {
      completionPercent =
        (this.currentSession.currentCycle /
          this.currentSession.pattern.cycles) *
        100;
    }

    return {
      currentSession: this.currentSession,
      isActive: this.currentSession?.isActive || false,
      hasBackgroundSound: this.backgroundSound !== null,
      hasGuideSound: this.guideSound !== null,
      completionPercent,
    };
  }

  /**
   * Cleanup service
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up BreathingExerciseService...');
    await this.stopBreathingSession();
    console.log('✅ BreathingExerciseService cleanup completed');
  }
}

// Export singleton instance
export const breathingExerciseService = BreathingExerciseService.getInstance();
