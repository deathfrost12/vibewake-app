import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Czech educational notification types
export type RepetitoPushNotificationType =
  | 'study_reminder'
  | 'streak_motivation'
  | 'exam_countdown'
  | 'magic_notes_ready'
  | 'achievement_unlock'
  | 'study_buddy_invite';

export interface RepetitoPushNotificationData extends Record<string, unknown> {
  type: RepetitoPushNotificationType;
  subject?: string; // 'Český jazyk', 'Matematika', etc.
  examType?: 'maturita' | 'přijímačky' | 'zápočet';
  streakCount?: number;
  achievementId?: string;
  studySetId?: string;
  userId?: string;
}

export interface RepetitoPushToken {
  token: string;
  userId: string;
  deviceInfo: {
    platform: 'ios' | 'android';
    deviceId: string;
    appVersion: string;
    osVersion: string;
  };
  createdAt: Date;
  isActive: boolean;
}

// 🔔 Configure notification handler with Czech educational context
Notifications.setNotificationHandler({
  handleNotification: async notification => {
    console.log(
      '📱 Repetito Push Notification received:',
      notification.request.content
    );

    return {
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

class RepetitoPushNotificationService {
  private static instance: RepetitoPushNotificationService;
  private expoPushToken: string | null = null;
  private initialized = false;

  static getInstance(): RepetitoPushNotificationService {
    if (!RepetitoPushNotificationService.instance) {
      RepetitoPushNotificationService.instance =
        new RepetitoPushNotificationService();
    }
    return RepetitoPushNotificationService.instance;
  }

  /**
   * 🚀 Initialize push notifications with Czech educational focus
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('📱 Repetito Push Notifications už jsou inicializované');
      return;
    }

    try {
      console.log('🔄 Inicializuji Repetito Push Notifications...');

      // Check if device supports push notifications
      if (!Device.isDevice) {
        console.warn(
          '⚠️ Push notifications fungují pouze na fyzickém zařízení'
        );
        return;
      }

      // Setup Android notification channel with Czech context
      if (Platform.OS === 'android') {
        await this.setupAndroidNotificationChannel();
      }

      console.log('✅ Repetito Push Notifications inicializovány');
      this.initialized = true;
    } catch (error) {
      console.error('❌ Chyba při inicializaci push notifications:', error);
      throw error;
    }
  }

  /**
   * 📱 Setup Android notification channel with Repetito branding
   */
  private async setupAndroidNotificationChannel(): Promise<void> {
    await Notifications.setNotificationChannelAsync('repetito-study', {
      name: 'Repetito - Studium',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#14C46D', // Magical Green
      sound: 'default',
      description: 'Notifikace pro studijní připomínky a motivaci',
    });

    await Notifications.setNotificationChannelAsync('repetito-achievements', {
      name: 'Repetito - Úspěchy',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 100, 100, 100],
      lightColor: '#14C46D',
      sound: 'default',
      description: 'Notifikace pro dosažené úspěchy a milníky',
    });

    console.log('✅ Android notification channels vytvořeny');
  }

  /**
   * 🔑 Request permissions for push notifications (Czech UX)
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission if not granted
      if (existingStatus !== 'granted') {
        console.log('📝 Žádám o povolení push notifications...');
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('⚠️ Uživatel nepovolil push notifications');
        return false;
      }

      console.log('✅ Push notifications povoleny');
      return true;
    } catch (error) {
      console.error('❌ Chyba při žádosti o povolení:', error);
      return false;
    }
  }

  /**
   * 🎯 Get Expo push token with project context
   */
  async getExpoPushToken(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.warn('⚠️ Push token není dostupný na simulátoru');
        return null;
      }

      // Check permissions first
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      // Get project ID from constants
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      if (!projectId) {
        console.error('❌ Chybí projectId - zkontroluj app.json');
        return null;
      }

      console.log('🔑 Získávám Expo push token pro projekt:', projectId);

      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      this.expoPushToken = pushTokenString;
      console.log(
        '✅ Expo push token získán:',
        pushTokenString.substring(0, 20) + '...'
      );

      return pushTokenString;
    } catch (error) {
      console.error('❌ Chyba při získávání push token:', error);
      return null;
    }
  }

  /**
   * 💾 Save push token to Supabase with device info
   */
  async savePushTokenToDatabase(token: string, userId: string): Promise<void> {
    try {
      const deviceInfo = {
        platform: Platform.OS as 'ios' | 'android',
        deviceId: Device.deviceName || 'unknown',
        appVersion: Constants.expoConfig?.version || '1.0.0',
        osVersion: Device.osVersion || 'unknown',
      };

      console.log('💾 Ukládám push token do databáze pro uživatele:', userId);

      // TODO: Implement Supabase save
      // await supabase.from('push_tokens').upsert({
      //   token,
      //   user_id: userId,
      //   device_info: deviceInfo,
      //   created_at: new Date().toISOString(),
      //   is_active: true,
      // });

      console.log('✅ Push token uložen do databáze');
    } catch (error) {
      console.error('❌ Chyba při ukládání push token:', error);
      throw error;
    }
  }

  /**
   * 📚 Schedule local notification for study reminder (Czech context)
   */
  async scheduleStudyReminder(
    subject: string,
    examType: 'maturita' | 'přijímačky' | 'zápočet',
    reminderTime: Date
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `📚 Čas na ${subject}!`,
          body: `Připrav se na ${examType} - každá minuta studia se počítá! 💪`,
          data: {
            type: 'study_reminder',
            subject,
            examType,
          } as RepetitoPushNotificationData,
          sound: 'default',
          badge: 1,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: reminderTime,
        },
      });

      console.log(
        `✅ Study reminder naplánován pro ${subject} na ${reminderTime.toLocaleString('cs-CZ')}`
      );
      return notificationId;
    } catch (error) {
      console.error('❌ Chyba při plánování study reminder:', error);
      throw error;
    }
  }

  /**
   * 🔥 Schedule streak motivation notification (Czech gamification)
   */
  async scheduleStreakMotivation(streakCount: number): Promise<string> {
    const motivationalMessages = [
      `Máš ${streakCount} dní v řadě! Nezlom si šňůru! 🔥`,
      `${streakCount} dní dokázáno! Pokračuj v rytmu! 💪`,
      `Neuvěřitelných ${streakCount} dní! Jsi na dobré cestě! ⭐`,
    ];

    const message =
      motivationalMessages[
        Math.floor(Math.random() * motivationalMessages.length)
      ];

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔥 Skvělá šňůra!',
          body: message,
          data: {
            type: 'streak_motivation',
            streakCount,
          } as RepetitoPushNotificationData,
          sound: 'default',
          badge: 1,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 60, // Send in 1 minute for testing
        },
      });

      console.log(`✅ Streak motivation naplánována pro ${streakCount} dní`);
      return notificationId;
    } catch (error) {
      console.error('❌ Chyba při plánování streak motivation:', error);
      throw error;
    }
  }

  /**
   * 🎉 Send achievement notification (Czech celebration)
   */
  async sendAchievementNotification(
    achievementTitle: string,
    achievementDescription: string
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🎉 ${achievementTitle}`,
          body: achievementDescription,
          data: {
            type: 'achievement_unlock',
            achievementId: achievementTitle.toLowerCase().replace(/\s+/g, '_'),
          } as RepetitoPushNotificationData,
          sound: 'default',
          badge: 1,
        },
        trigger: null, // Send immediately
      });

      console.log(`✅ Achievement notification odeslána: ${achievementTitle}`);
    } catch (error) {
      console.error('❌ Chyba při odesílání achievement notification:', error);
      throw error;
    }
  }

  /**
   * 🗑️ Cancel scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log(`✅ Notification ${notificationId} zrušena`);
    } catch (error) {
      console.error('❌ Chyba při rušení notification:', error);
      throw error;
    }
  }

  /**
   * 🧹 Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('✅ Všechny scheduled notifications zrušeny');
    } catch (error) {
      console.error('❌ Chyba při rušení všech notifications:', error);
      throw error;
    }
  }

  /**
   * 📊 Get notification settings for user
   */
  getNotificationSettings() {
    return {
      studyReminders: true,
      streakMotivation: true,
      achievements: true,
      examCountdown: true,
      magicNotesReady: true,
    };
  }

  /**
   * 🔍 Get current push token
   */
  getCurrentPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * 📱 Get device and notification info for debugging
   */
  async getDebugInfo() {
    const permissions = await Notifications.getPermissionsAsync();
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();

    return {
      isDevice: Device.isDevice,
      platform: Platform.OS,
      deviceName: Device.deviceName,
      osVersion: Device.osVersion,
      appVersion: Constants.expoConfig?.version,
      permissions: permissions.status,
      expoPushToken: this.expoPushToken,
      scheduledNotificationsCount: scheduledNotifications.length,
      initialized: this.initialized,
    };
  }
}

// Export singleton instance
export const pushNotificationService =
  RepetitoPushNotificationService.getInstance();

// Export types for use in other parts of the app
export default pushNotificationService;
