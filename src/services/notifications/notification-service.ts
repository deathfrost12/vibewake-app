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
      try {
        // Validate alarm time is in the future
        const now = new Date();
        if (alarm.time <= now) {
          throw new Error('Alarm time must be in the future');
        }

        const identifier = await this.scheduleNotificationWithRetry({
          content,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: alarm.time,
            channelId: Platform.OS === 'android' ? 'alarms' : undefined,
          },
        });

        console.log('⏰ Scheduled one-time alarm:', identifier, 'for', alarm.time);
        return identifier;
      } catch (error) {
        console.error('❌ Failed to schedule one-time alarm:', error);
        throw new Error(`Failed to schedule notification, ${error}`);
      }
    }

    // For repeating alarms, calculate next occurrences and schedule as individual DATE triggers
    const identifiers: string[] = [];
    
    try {
      // Calculate next 7 days for each repeat day to create specific date triggers
      const now = new Date();
      const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
      
      for (const weekday of alarm.repeatDays) {
        // Find the next occurrence of this weekday
        const nextOccurrence = this.getNextOccurrenceForWeekday(alarm.time, weekday);
        
        if (nextOccurrence && nextOccurrence > now) {
          try {
            const identifier = await this.scheduleNotificationWithRetry({
              content: {
                ...content,
                title: `${alarm.title} (${this.getDayName(weekday)})`,
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: nextOccurrence,
                channelId: Platform.OS === 'android' ? 'alarms' : undefined,
              },
            });

            identifiers.push(identifier);
            console.log('⏰ Scheduled date alarm:', identifier, 'for', this.getDayName(weekday), 'at', nextOccurrence.toISOString());
            
            // Schedule for the following week too (to maintain recurring behavior)
            const nextWeek = new Date(nextOccurrence.getTime() + oneWeekInMs);
            const weekIdentifier = await this.scheduleNotificationWithRetry({
              content: {
                ...content,
                title: `${alarm.title} (${this.getDayName(weekday)})`,
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: nextWeek,
                channelId: Platform.OS === 'android' ? 'alarms' : undefined,
              },
            });
            
            identifiers.push(weekIdentifier);
            console.log('⏰ Scheduled weekly alarm:', weekIdentifier, 'for', this.getDayName(weekday), 'at', nextWeek.toISOString());
          } catch (error) {
            console.error('❌ Failed to schedule repeating alarm for', this.getDayName(weekday), ':', error);
            // Continue with other days even if one fails
          }
        }
      }

      if (identifiers.length === 0) {
        throw new Error('No alarm notifications could be scheduled');
      }

      return identifiers.join(','); // Return comma-separated identifiers
    } catch (error) {
      console.error('❌ Failed to schedule repeating alarms:', error);
      throw new Error(`Failed to schedule notification, ${error}`);
    }
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

  private getNextOccurrenceForWeekday(alarmTime: Date, weekday: number): Date | null {
    const now = new Date();
    const currentDay = now.getDay();
    
    // Calculate days until the target weekday
    let daysUntilTarget = weekday - currentDay;
    if (daysUntilTarget < 0) {
      daysUntilTarget += 7; // Next week
    } else if (daysUntilTarget === 0) {
      // Same day - check if alarm time has passed
      const todayAlarmTime = new Date(now);
      todayAlarmTime.setHours(alarmTime.getHours(), alarmTime.getMinutes(), 0, 0);
      
      if (todayAlarmTime <= now) {
        daysUntilTarget = 7; // Next week
      }
    }
    
    // Create the next occurrence
    const nextOccurrence = new Date(now);
    nextOccurrence.setDate(now.getDate() + daysUntilTarget);
    nextOccurrence.setHours(alarmTime.getHours(), alarmTime.getMinutes(), 0, 0);
    
    return nextOccurrence;
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

  // Helper method for retry logic with exponential backoff
  private async scheduleNotificationWithRetry(
    request: Notifications.NotificationRequestInput,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<string> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`⏰ Attempting to schedule notification (attempt ${attempt}/${maxRetries})`);
        
        // Additional validation to prevent NSInternalInconsistencyException
        if (request.trigger?.type === Notifications.SchedulableTriggerInputTypes.DATE) {
          const triggerDate = (request.trigger as any).date;
          if (!(triggerDate instanceof Date) || isNaN(triggerDate.getTime())) {
            throw new Error('Invalid trigger date provided');
          }
          
          const now = new Date();
          if (triggerDate <= now) {
            throw new Error('Trigger date must be in the future');
          }
        }
        
        const identifier = await Notifications.scheduleNotificationAsync(request);
        console.log(`✅ Successfully scheduled notification: ${identifier}`);
        return identifier;
      } catch (error: any) {
        lastError = error;
        console.warn(`⚠️ Attempt ${attempt} failed:`, error.message);
        
        // If this is the last attempt, don't wait
        if (attempt < maxRetries) {
          // Exponential backoff: wait longer between retries
          const waitTime = delay * Math.pow(2, attempt - 1);
          console.log(`⏳ Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    // If we get here, all retries failed
    throw new Error(`Failed to schedule notification after ${maxRetries} attempts. Last error: ${lastError?.message}`);
  }
}

export const notificationService = new NotificationService();