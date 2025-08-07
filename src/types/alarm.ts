import { AudioTrack } from '../services/audio/types';

/**
 * Base alarm interface shared across the application
 */
export interface BaseAlarm {
  id: string;
  title: string;
  time: Date;
  isActive: boolean;
  audioTrack: AudioTrack;
  repeatDays?: number[]; // 0 = Sunday, 1 = Monday, etc.
  isNativeAlarm?: boolean; // True if using AlarmKit
  nativeAlarmId?: string; // AlarmKit alarm ID
  backgroundAudioEnabled?: boolean; // True if using background audio (silent loop)
}

/**
 * Full alarm interface with metadata
 */
export interface Alarm extends BaseAlarm {
  notificationId?: string;
  notificationIds?: string[]; // For multiple notification IDs (repeating alarms)
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Alarm creation/update data
 */
export type AlarmCreateData = Omit<
  Alarm,
  'id' | 'createdAt' | 'updatedAt' | 'notificationId' | 'notificationIds'
>;

/**
 * Alarm update data
 */
export type AlarmUpdateData = Partial<
  Omit<Alarm, 'id' | 'createdAt' | 'updatedAt'>
>;

/**
 * Alarm notification data (for notification service)
 */
export interface AlarmNotification extends BaseAlarm {
  useBackgroundAudio?: boolean; // Flag for notification service to use background audio
}
