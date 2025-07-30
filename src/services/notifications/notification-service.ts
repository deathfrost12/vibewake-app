import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { AudioTrack } from '../audio/types';

export interface AlarmNotification {
  id: string;
  title: string;
  time: Date;
  isActive: boolean;
  audioTrack: AudioTrack;
  repeatDays?: number[]; // 0 = Sunday, 1 = Monday, etc.
}

export interface NotificationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: string;
}

class NotificationService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Configure notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // Set up Android notification channel for alarms
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('alarms', {
        name: 'Alarm Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#5CFFF0',
        sound: 'default',
        description: 'Notifications for scheduled alarms',
      });
    }

    this.initialized = true;
    console.log('⏰ NotificationService initialized');
  }

  async requestPermissions(): Promise<NotificationPermissionStatus> {
    if (!Device.isDevice) {
      return {
        granted: false,
        canAskAgain: false,
        status: 'simulator_not_supported',
      };
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    console.log('⏰ Notification permissions:', finalStatus);

    return {
      granted: finalStatus === 'granted',
      canAskAgain: existingStatus === 'undetermined',
      status: finalStatus,
    };
  }

  async scheduleAlarm(alarm: AlarmNotification): Promise<string> {
    await this.initialize();

    const permissions = await this.requestPermissions();
    if (!permissions.granted) {
      throw new Error('Notification permissions not granted');
    }

    const content: Notifications.NotificationContentInput = {
      title: alarm.title || 'Alarm',
      body: `Wake up! Your alarm is ringing 🔔`,
      sound: Platform.OS === 'android' ? 'default' : true,
      priority: Notifications.AndroidNotificationPriority.MAX,
      data: {
        alarmId: alarm.id,
        audioTrack: alarm.audioTrack,
        type: 'alarm',
      },
    };

    // For one-time alarms
    if (!alarm.repeatDays || alarm.repeatDays.length === 0) {
      const identifier = await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: alarm.time,
          channelId: Platform.OS === 'android' ? 'alarms' : undefined,
        },
      });

      console.log('⏰ Scheduled one-time alarm:', identifier, 'for', alarm.time);
      return identifier;
    }

    // For repeating alarms, schedule for each day of the week
    const identifiers: string[] = [];
    
    for (const weekday of alarm.repeatDays) {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          ...content,
          title: `${alarm.title} (${this.getDayName(weekday)})`,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: weekday === 0 ? 7 : weekday, // Convert Sunday from 0 to 7
          hour: alarm.time.getHours(),
          minute: alarm.time.getMinutes(),
          channelId: Platform.OS === 'android' ? 'alarms' : undefined,
        },
      });

      identifiers.push(identifier);
      console.log('⏰ Scheduled weekly alarm:', identifier, 'for', this.getDayName(weekday), 'at', `${alarm.time.getHours()}:${alarm.time.getMinutes()}`);
    }

    return identifiers.join(','); // Return comma-separated identifiers
  }

  async cancelAlarm(identifier: string): Promise<void> {
    const identifiers = identifier.split(',');
    
    for (const id of identifiers) {
      await Notifications.cancelScheduledNotificationAsync(id.trim());
      console.log('⏰ Cancelled alarm:', id.trim());
    }
  }

  async cancelAllAlarms(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('⏰ Cancelled all alarms');
  }

  async getAllScheduledAlarms(): Promise<Notifications.NotificationRequest[]> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    return scheduled.filter(notification => 
      notification.content.data?.type === 'alarm'
    );
  }

  async getNextTriggerDate(time: Date, repeatDays?: number[]): Promise<Date | null> {
    if (!repeatDays || repeatDays.length === 0) {
      // One-time alarm
      return time > new Date() ? time : null;
    }

    // Find next occurrence for repeating alarm
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const alarmTime = time.getHours() * 60 + time.getMinutes();

    // Sort repeat days
    const sortedDays = [...repeatDays].sort((a, b) => a - b);

    // Find next occurrence
    for (let i = 0; i < 7; i++) {
      const checkDay = (currentDay + i) % 7;
      
      if (sortedDays.includes(checkDay)) {
        // If it's today, check if alarm time hasn't passed
        if (i === 0 && alarmTime <= currentTime) {
          continue; // Skip today, alarm time has passed
        }
        
        const nextDate = new Date(now);
        nextDate.setDate(now.getDate() + i);
        nextDate.setHours(time.getHours(), time.getMinutes(), 0, 0);
        return nextDate;
      }
    }

    return null;
  }

  private getDayName(weekday: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[weekday] || 'Unknown';
  }

  // Setup notification listeners for alarm triggering
  setupAlarmListeners() {
    // Listen for notification responses (when user taps notification)
    Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      const alarmId = data?.alarmId;
      const type = data?.type;
      
      if (type === 'alarm' && alarmId) {
        console.log('⏰ Alarm notification tapped, navigating to ringing screen:', alarmId);
        this.navigateToAlarmRinging(alarmId as string);
      }
    });

    // Listen for notifications received while app is in foreground
    Notifications.addNotificationReceivedListener(notification => {
      const data = notification.request.content.data;
      const alarmId = data?.alarmId;
      const type = data?.type;
      
      if (type === 'alarm' && alarmId) {
        console.log('⏰ Alarm triggered in foreground, navigating to ringing screen:', alarmId);
        this.navigateToAlarmRinging(alarmId as string);
      }
    });
  }

  private navigateToAlarmRinging(alarmId: string) {
    // Use Expo Router to navigate to alarm ringing screen
    // Note: This requires the router to be available globally or passed in
    try {
      const { router } = require('expo-router');
      router.push(`/alarms/ringing?alarmId=${alarmId}`);
    } catch (error) {
      console.error('⏰ Failed to navigate to alarm ringing screen:', error);
    }
  }

  // Notification event listeners
  addNotificationReceivedListener(listener: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(listener);
  }

  addNotificationResponseReceivedListener(listener: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  removeNotificationSubscription(subscription: Notifications.EventSubscription) {
    Notifications.removeNotificationSubscription(subscription);
  }
}

export const notificationService = new NotificationService();