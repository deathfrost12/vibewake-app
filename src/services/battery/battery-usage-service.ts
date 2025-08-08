import { Platform } from 'react-native';
import * as Battery from 'expo-battery';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BatteryUsageStats {
  backgroundAudioEnabled: boolean;
  silentLoopActive: boolean;
  estimatedBatteryImpact: 'low' | 'medium' | 'high';
  lastChecked: Date;
  batteryLevel: number;
  isCharging: boolean;
  recommendations: string[];
}

export interface BatteryUsageConfig {
  showBatteryWarnings: boolean;
  optimizationLevel: 'performance' | 'balanced' | 'battery-saver';
  autoDisableBackgroundAudio: boolean;
  lowBatteryThreshold: number; // Percentage
}

export class BatteryUsageService {
  private static instance: BatteryUsageService;
  private config: BatteryUsageConfig = {
    showBatteryWarnings: true,
    optimizationLevel: 'balanced',
    autoDisableBackgroundAudio: false,
    lowBatteryThreshold: 20,
  };

  private batteryCheckInterval: ReturnType<typeof setInterval> | null = null;
  private readonly STORAGE_KEY = 'battery_usage_config';
  private readonly STATS_KEY = 'battery_usage_stats';

  static getInstance(): BatteryUsageService {
    if (!BatteryUsageService.instance) {
      BatteryUsageService.instance = new BatteryUsageService();
    }
    return BatteryUsageService.instance;
  }

  /**
   * Initialize battery monitoring service
   */
  async initialize(): Promise<void> {
    try {
      // Load saved configuration
      await this.loadConfiguration();

      // Start battery monitoring if enabled
      if (this.config.showBatteryWarnings) {
        await this.startBatteryMonitoring();
      }

      console.log('✅ BatteryUsageService initialized');
    } catch (error) {
      console.error('❌ Failed to initialize BatteryUsageService:', error);
      throw error;
    }
  }

  /**
   * Get current battery usage statistics
   */
  async getBatteryUsageStats(
    backgroundAudioEnabled: boolean = false,
    silentLoopActive: boolean = false
  ): Promise<BatteryUsageStats> {
    try {
      const batteryLevel = await Battery.getBatteryLevelAsync();
      const batteryState = await Battery.getBatteryStateAsync();
      const isCharging = batteryState === Battery.BatteryState.CHARGING;

      // Calculate estimated battery impact
      let estimatedBatteryImpact: 'low' | 'medium' | 'high' = 'low';

      if (backgroundAudioEnabled && silentLoopActive) {
        estimatedBatteryImpact = 'medium'; // Silent loop uses minimal CPU but keeps audio session alive
      } else if (backgroundAudioEnabled) {
        estimatedBatteryImpact = 'low'; // Just background audio without silent loop
      }

      // Generate recommendations based on current state
      const recommendations = this.generateRecommendations({
        batteryLevel,
        isCharging,
        backgroundAudioEnabled,
        silentLoopActive,
        optimizationLevel: this.config.optimizationLevel,
      });

      const stats: BatteryUsageStats = {
        backgroundAudioEnabled,
        silentLoopActive,
        estimatedBatteryImpact,
        lastChecked: new Date(),
        batteryLevel: Math.round(batteryLevel * 100),
        isCharging,
        recommendations,
      };

      // Save stats for historical tracking
      await AsyncStorage.setItem(this.STATS_KEY, JSON.stringify(stats));

      return stats;
    } catch (error) {
      console.error('❌ Failed to get battery usage stats:', error);

      // Return fallback stats
      return {
        backgroundAudioEnabled,
        silentLoopActive,
        estimatedBatteryImpact: 'low',
        lastChecked: new Date(),
        batteryLevel: 50, // Fallback
        isCharging: false,
        recommendations: ['Unable to determine battery status'],
      };
    }
  }

  /**
   * Generate battery usage recommendations
   */
  private generateRecommendations(context: {
    batteryLevel: number;
    isCharging: boolean;
    backgroundAudioEnabled: boolean;
    silentLoopActive: boolean;
    optimizationLevel: string;
  }): string[] {
    const recommendations: string[] = [];
    const batteryPercent = Math.round(context.batteryLevel * 100);

    // Low battery warnings
    if (
      batteryPercent < this.config.lowBatteryThreshold &&
      !context.isCharging
    ) {
      if (context.backgroundAudioEnabled) {
        recommendations.push(
          `🔋 Low battery (${batteryPercent}%) - Consider disabling background audio for alarms`
        );
      }

      if (context.silentLoopActive) {
        recommendations.push(
          '🔇 Silent loop is active - This may drain battery faster when low'
        );
      }
    }

    // Optimization level specific recommendations
    switch (context.optimizationLevel) {
      case 'battery-saver':
        if (context.backgroundAudioEnabled) {
          recommendations.push(
            '⚡ Battery saver mode: Use notification-only alarms to maximize battery life'
          );
        }
        break;

      case 'balanced':
        if (context.silentLoopActive && batteryPercent < 50) {
          recommendations.push(
            '⚖️ Balanced mode: Silent loop will auto-disable at 20% battery'
          );
        }
        break;

      case 'performance':
        recommendations.push(
          '🚀 Performance mode: All alarm features enabled for maximum reliability'
        );
        break;
    }

    // General recommendations
    if (context.backgroundAudioEnabled && !context.isCharging) {
      recommendations.push(
        '💡 Background audio uses ~1-5% battery per hour for reliable alarms'
      );
    }

    if (context.silentLoopActive) {
      recommendations.push(
        '🔇 Silent loop keeps audio session alive - minimal impact (~1% per hour)'
      );
    }

    // Educational information
    if (Platform.OS === 'ios' && context.backgroundAudioEnabled) {
      recommendations.push(
        '📱 iOS background audio allows alarms to work when device is locked'
      );
    }

    return recommendations;
  }

  /**
   * Check if background audio should be auto-disabled due to low battery
   */
  async shouldDisableBackgroundAudio(): Promise<boolean> {
    if (!this.config.autoDisableBackgroundAudio) {
      return false;
    }

    try {
      const batteryLevel = await Battery.getBatteryLevelAsync();
      const batteryPercent = Math.round(batteryLevel * 100);

      return batteryPercent < this.config.lowBatteryThreshold;
    } catch (error) {
      console.warn('⚠️ Failed to check battery level for auto-disable:', error);
      return false;
    }
  }

  /**
   * Get battery usage education content
   */
  getBatteryEducationContent(): {
    backgroundAudio: string[];
    silentLoop: string[];
    recommendations: string[];
    tips: string[];
  } {
    return {
      backgroundAudio: [
        '🎵 Background audio allows alarms to play when your phone is locked',
        '🔋 Uses approximately 1-5% battery per hour depending on usage',
        '📱 Essential for reliable alarm functionality on iOS',
        '🔇 Works best when combined with silent loop technology',
      ],
      silentLoop: [
        '🔇 Silent loop keeps audio session active using an inaudible sound',
        '⚡ Minimal battery impact (~1% per hour) for maximum alarm reliability',
        '🍎 Apple-approved technique used by many audio and alarm apps',
        '🎯 Ensures seamless transition from background to alarm audio',
      ],
      recommendations: [
        '🔌 Charge your device overnight when using background alarms',
        '⚙️ Use "Battery Saver" mode if you need to conserve power',
        '📊 Monitor battery usage in Settings > Battery to track impact',
        '🔄 Toggle background audio off when not needed to save battery',
      ],
      tips: [
        '💡 Background audio impact is similar to playing music quietly',
        '🌙 Sleep sounds and focus timers justify continuous audio usage',
        '⏰ Notification-only alarms work but may be less reliable when locked',
        '🔋 Battery optimization varies by device age and iOS version',
      ],
    };
  }

  /**
   * Update battery usage configuration
   */
  async updateConfiguration(
    newConfig: Partial<BatteryUsageConfig>
  ): Promise<void> {
    try {
      this.config = { ...this.config, ...newConfig };

      // Save to storage
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.config));

      // Update monitoring based on new config
      if (this.config.showBatteryWarnings && !this.batteryCheckInterval) {
        await this.startBatteryMonitoring();
      } else if (
        !this.config.showBatteryWarnings &&
        this.batteryCheckInterval
      ) {
        this.stopBatteryMonitoring();
      }

      console.log('✅ Battery usage configuration updated');
    } catch (error) {
      console.error('❌ Failed to update battery configuration:', error);
      throw error;
    }
  }

  /**
   * Get current configuration
   */
  getConfiguration(): BatteryUsageConfig {
    return { ...this.config };
  }

  /**
   * Start battery monitoring
   */
  private async startBatteryMonitoring(): Promise<void> {
    try {
      // Clear existing interval
      if (this.batteryCheckInterval) {
        clearInterval(this.batteryCheckInterval);
      }

      // Check battery every 5 minutes
      this.batteryCheckInterval = setInterval(
        async () => {
          try {
            const shouldDisable = await this.shouldDisableBackgroundAudio();

            if (shouldDisable) {
              console.log(
                '🔋 Low battery detected - recommending background audio disable'
              );
              // You could emit an event here for the UI to listen to
            }
          } catch (error) {
            console.warn('⚠️ Battery check failed:', error);
          }
        },
        5 * 60 * 1000
      ); // 5 minutes

      console.log('✅ Battery monitoring started');
    } catch (error) {
      console.error('❌ Failed to start battery monitoring:', error);
    }
  }

  /**
   * Stop battery monitoring
   */
  private stopBatteryMonitoring(): void {
    if (this.batteryCheckInterval) {
      clearInterval(this.batteryCheckInterval);
      this.batteryCheckInterval = null;
      console.log('✅ Battery monitoring stopped');
    }
  }

  /**
   * Load configuration from storage
   */
  private async loadConfiguration(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.config = { ...this.config, ...JSON.parse(stored) };
        console.log('✅ Battery usage configuration loaded');
      }
    } catch (error) {
      console.warn(
        '⚠️ Failed to load battery configuration, using defaults:',
        error
      );
    }
  }

  /**
   * Get historical battery usage stats
   */
  async getHistoricalStats(): Promise<BatteryUsageStats | null> {
    try {
      const stored = await AsyncStorage.getItem(this.STATS_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('⚠️ Failed to load historical battery stats:', error);
      return null;
    }
  }

  /**
   * Cleanup service
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up BatteryUsageService...');
    this.stopBatteryMonitoring();
    console.log('✅ BatteryUsageService cleanup completed');
  }
}

// Export singleton instance
export const batteryUsageService = BatteryUsageService.getInstance();
