import { AudioTrack } from './AudioManager';
import { Asset } from 'expo-asset';

export interface PredefinedSound {
  id: string;
  name: string;
  emoji: string;
  fileName: string;
  description: string;
  category: 'gentle' | 'energetic' | 'nature' | 'classic';
}

// Predefined alarm sounds with metadata
export const PREDEFINED_SOUNDS: PredefinedSound[] = [
  {
    id: 'wake-up',
    name: 'Wake Up Song',
    emoji: '🌅',
    fileName: 'wake-up-song.mp3',
    description: 'Classic morning alarm sound',
    category: 'classic'
  },
  {
    id: 'gentle',
    name: 'Gentle Morning',
    emoji: '☀️',
    fileName: 'gentle-morning.mp3',
    description: 'Soft and peaceful wake up',
    category: 'gentle'
  },
  {
    id: 'energetic',
    name: 'Energy Boost',
    emoji: '⚡',
    fileName: 'energy-boost.mp3',
    description: 'High energy start to your day',
    category: 'energetic'
  },
  {
    id: 'nature',
    name: 'Birds Singing',
    emoji: '🐦',
    fileName: 'birds-singing.mp3',
    description: 'Natural bird sounds',
    category: 'nature'
  },
  {
    id: 'classical',
    name: 'Classical Rise',
    emoji: '🎼',
    fileName: 'classical-rise.mp3',
    description: 'Elegant classical music',
    category: 'classic'
  },
  {
    id: 'electronic',
    name: 'Electronic Beat',
    emoji: '🎵',
    fileName: 'electronic-beat.mp3',
    description: 'Modern electronic alarm',
    category: 'energetic'
  },
  {
    id: 'jazz',
    name: 'Jazz Morning',
    emoji: '🎷',
    fileName: 'jazz-morning.mp3',
    description: 'Smooth jazz wake up',
    category: 'gentle'
  },
  {
    id: 'acoustic',
    name: 'Acoustic Guitar',
    emoji: '🎸',
    fileName: 'acoustic-guitar.mp3',
    description: 'Gentle acoustic guitar melody',
    category: 'gentle'
  },
];

class SoundLibraryClass {
  private soundsBasePath: string = '';

  constructor() {
    // In a real app, you would store actual audio files in assets/sounds/
    // For now, we'll use placeholder URLs or local require() paths
    this.soundsBasePath = 'assets/sounds/';
  }

  getAllSounds(): PredefinedSound[] {
    return PREDEFINED_SOUNDS;
  }

  getSoundById(id: string): PredefinedSound | undefined {
    return PREDEFINED_SOUNDS.find(sound => sound.id === id);
  }

  getSoundsByCategory(category: PredefinedSound['category']): PredefinedSound[] {
    return PREDEFINED_SOUNDS.filter(sound => sound.category === category);
  }

  async convertToAudioTrack(sound: PredefinedSound): Promise<AudioTrack> {
    const uri = await this.getSoundUri(sound);
    return {
      id: sound.id,
      name: sound.name,
      uri: uri,
      type: 'predefined',
    };
  }

  async convertAllToAudioTracks(): Promise<AudioTrack[]> {
    const tracks = await Promise.all(
      PREDEFINED_SOUNDS.map(sound => this.convertToAudioTrack(sound))
    );
    return tracks;
  }

  private async getSoundUri(sound: PredefinedSound): Promise<string> {
    // Using local assets - much more reliable than external URLs
    // These require() statements bundle the audio files with the app
    const localAssets: Record<string, any> = {
      'wake-up': require('../../assets/sounds/wake-up-song.wav'),
      'gentle': require('../../assets/sounds/gentle-morning.wav'),
      'energetic': require('../../assets/sounds/energy-boost.wav'),
      'nature': require('../../assets/sounds/birds-singing.wav'),
      'classical': require('../../assets/sounds/classical-rise.wav'),
      'electronic': require('../../assets/sounds/electronic-beat.wav'),
      'jazz': require('../../assets/sounds/jazz-morning.wav'),
      'acoustic': require('../../assets/sounds/acoustic-guitar.wav'),
    };

    try {
      const assetModule = localAssets[sound.id] || localAssets['wake-up'];
      const asset = Asset.fromModule(assetModule);
      await asset.downloadAsync();
      return asset.localUri || asset.uri;
    } catch (error) {
      console.error('❌ Failed to load asset:', sound.id, error);
      // Fallback to external URL if local asset fails
      return 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav';
    }
  }

  // Method to add custom sounds (for future expansion)
  addCustomSound(sound: Omit<PredefinedSound, 'id'> & { uri: string }): AudioTrack {
    const customSound: AudioTrack = {
      id: `custom-${Date.now()}`,
      name: sound.name,
      uri: sound.uri,
      type: 'uploaded',
    };
    return customSound;
  }

  // Method to validate audio file format
  isValidAudioFormat(fileName: string): boolean {
    const validExtensions = ['.mp3', '.m4a', '.wav', '.aac'];
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    return validExtensions.includes(extension);
  }

  // Method to get category info
  getCategoryInfo() {
    return {
      gentle: {
        name: 'Gentle',
        description: 'Soft and peaceful sounds',
        icon: '🌸',
        color: '#E8F5E8'
      },
      energetic: {
        name: 'Energetic',
        description: 'High energy wake up sounds',
        icon: '⚡',
        color: '#FFF3E0'
      },
      nature: {
        name: 'Nature',
        description: 'Natural environmental sounds',
        icon: '🌿',
        color: '#E0F2E0'
      },
      classic: {
        name: 'Classic',
        description: 'Traditional alarm sounds',
        icon: '🎼',
        color: '#F0F8FF'
      }
    };
  }
}

// Export singleton instance
export const SoundLibrary = new SoundLibraryClass();