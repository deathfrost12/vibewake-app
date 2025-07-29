import { useEffect, useState, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import pushNotificationService, {
  RepetitoPushNotificationData,
  RepetitoPushNotificationType,
} from '../services/notifications/push-notifications';
import { useAuthStore } from '../stores/auth-store';

export interface NotificationState {
  isInitialized: boolean;
  hasPermission: boolean;
  expoPushToken: string | null;
  lastNotification: Notifications.Notification | null;
  error: string | null;
}

export interface NotificationActions {
  initializeNotifications: () => Promise<void>;
  requestPermissions: () => Promise<boolean>;
  scheduleStudyReminder: (
    subject: string,
    examType: 'maturita' | 'přijímačky' | 'zápočet',
    time: Date
  ) => Promise<string>;
  scheduleStreakMotivation: (streakCount: number) => Promise<string>;
  sendAchievement: (title: string, description: string) => Promise<void>;
  cancelNotification: (id: string) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  getDebugInfo: () => Promise<any>;
}

/**
 * 🔔 React hook pro push notifications v Repetito
 *
 * Poskytuje state a actions pro práci s push notifications
 * s českým educational kontextem
 */
export function usePushNotifications(): NotificationState &
  NotificationActions {
  const [state, setState] = useState<NotificationState>({
    isInitialized: false,
    hasPermission: false,
    expoPushToken: null,
    lastNotification: null,
    error: null,
  });

  const { user } = useAuthStore();

  /**
   * 🚀 Initialize push notifications
   */
  const initializeNotifications = useCallback(async () => {
    try {
      console.log('🔄 Inicializuji push notifications přes hook...');

      setState(prev => ({ ...prev, error: null }));

      // Initialize the service
      await pushNotificationService.initialize();

      // Get push token
      const token = await pushNotificationService.getExpoPushToken();

      // Save to database if user is logged in
      if (token && user?.id) {
        await pushNotificationService.savePushTokenToDatabase(token, user.id);
      }

      setState(prev => ({
        ...prev,
        isInitialized: true,
        hasPermission: !!token,
        expoPushToken: token,
      }));

      console.log('✅ Push notifications inicializovány přes hook');
    } catch (error) {
      console.error('❌ Chyba při inicializaci přes hook:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Neznámá chyba',
      }));
    }
  }, [user?.id]);

  /**
   * 📝 Request permissions
   */
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const hasPermission = await pushNotificationService.requestPermissions();
      setState(prev => ({ ...prev, hasPermission }));
      return hasPermission;
    } catch (error) {
      console.error('❌ Chyba při žádosti o povolení:', error);
      return false;
    }
  }, []);

  /**
   * 📚 Schedule study reminder with Czech context
   */
  const scheduleStudyReminder = useCallback(
    async (
      subject: string,
      examType: 'maturita' | 'přijímačky' | 'zápočet',
      time: Date
    ): Promise<string> => {
      return await pushNotificationService.scheduleStudyReminder(
        subject,
        examType,
        time
      );
    },
    []
  );

  /**
   * 🔥 Schedule streak motivation
   */
  const scheduleStreakMotivation = useCallback(
    async (streakCount: number): Promise<string> => {
      return await pushNotificationService.scheduleStreakMotivation(
        streakCount
      );
    },
    []
  );

  /**
   * 🎉 Send achievement notification
   */
  const sendAchievement = useCallback(
    async (title: string, description: string): Promise<void> => {
      await pushNotificationService.sendAchievementNotification(
        title,
        description
      );
    },
    []
  );

  /**
   * 🗑️ Cancel notification
   */
  const cancelNotification = useCallback(async (id: string): Promise<void> => {
    await pushNotificationService.cancelNotification(id);
  }, []);

  /**
   * 🧹 Cancel all notifications
   */
  const cancelAllNotifications = useCallback(async (): Promise<void> => {
    await pushNotificationService.cancelAllNotifications();
  }, []);

  /**
   * 🔍 Get debug info
   */
  const getDebugInfo = useCallback(async () => {
    return await pushNotificationService.getDebugInfo();
  }, []);

  /**
   * 👂 Setup notification listeners
   */
  useEffect(() => {
    console.log('📱 Nastavuji notification listeners...');

    // Listener for notifications received while app is in foreground
    const notificationListener = Notifications.addNotificationReceivedListener(
      notification => {
        console.log('📱 Notification received in foreground:', notification);
        setState(prev => ({ ...prev, lastNotification: notification }));
      }
    );

    // Listener for notification taps
    const responseListener =
      Notifications.addNotificationResponseReceivedListener(response => {
        console.log('👆 Notification tapped:', response);

        const data = response.notification.request.content
          .data as RepetitoPushNotificationData;

        // Handle different notification types
        switch (data?.type) {
          case 'study_reminder':
            console.log(
              '📚 Study reminder tapped - navigating to study session'
            );
            // TODO: Navigate to study session
            break;
          case 'streak_motivation':
            console.log('🔥 Streak motivation tapped - showing progress');
            // TODO: Navigate to stats/progress
            break;
          case 'achievement_unlock':
            console.log('🎉 Achievement tapped - showing achievements');
            // TODO: Navigate to achievements
            break;
          default:
            console.log('🔄 Generic notification tapped');
        }
      });

    // Cleanup listeners
    return () => {
      console.log('🧹 Odstraňuji notification listeners');
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  /**
   * 🚀 Auto-initialize when user logs in
   */
  useEffect(() => {
    if (user && !state.isInitialized) {
      console.log('👤 Uživatel se přihlásil - inicializuji push notifications');
      initializeNotifications();
    }
  }, [user, state.isInitialized, initializeNotifications]);

  return {
    ...state,
    initializeNotifications,
    requestPermissions,
    scheduleStudyReminder,
    scheduleStreakMotivation,
    sendAchievement,
    cancelNotification,
    cancelAllNotifications,
    getDebugInfo,
  };
}

/**
 * 🎯 Specialized hook pro study reminders
 */
export function useStudyReminders() {
  const { scheduleStudyReminder, cancelNotification } = usePushNotifications();
  const [scheduledReminders, setScheduledReminders] = useState<string[]>([]);

  const scheduleDaily = useCallback(
    async (
      subject: string,
      examType: 'maturita' | 'přijímačky' | 'zápočet',
      hour: number,
      minute: number
    ) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(hour, minute, 0, 0);

      const reminderId = await scheduleStudyReminder(
        subject,
        examType,
        tomorrow
      );
      setScheduledReminders(prev => [...prev, reminderId]);

      console.log(
        `✅ Denní připomínka pro ${subject} naplánována na ${hour}:${minute.toString().padStart(2, '0')}`
      );
      return reminderId;
    },
    [scheduleStudyReminder]
  );

  const cancelAll = useCallback(async () => {
    for (const id of scheduledReminders) {
      await cancelNotification(id);
    }
    setScheduledReminders([]);
    console.log('✅ Všechny study reminders zrušeny');
  }, [scheduledReminders, cancelNotification]);

  return {
    scheduleDaily,
    cancelAll,
    scheduledRemindersCount: scheduledReminders.length,
  };
}

/**
 * 🔥 Specialized hook pro streak management
 */
export function useStreakNotifications() {
  const { scheduleStreakMotivation, sendAchievement } = usePushNotifications();

  const celebrateStreak = useCallback(
    async (streakCount: number) => {
      // Schedule motivation for tomorrow
      await scheduleStreakMotivation(streakCount);

      // Send achievement for milestones
      if (streakCount === 7) {
        await sendAchievement(
          'Týden v kuse! 🔥',
          'Dokázal/a jsi studovat 7 dní v řadě!'
        );
      } else if (streakCount === 30) {
        await sendAchievement(
          'Měsíc studia! 🏆',
          'Neuvěřitelný měsíc nepřetržitého studia!'
        );
      } else if (streakCount === 100) {
        await sendAchievement(
          'Studijní legenda! 🌟',
          '100 dní v řadě - jsi absolutní šampión!'
        );
      }
    },
    [scheduleStreakMotivation, sendAchievement]
  );

  return {
    celebrateStreak,
  };
}

export default usePushNotifications;
