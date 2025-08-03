import ExpoAlarmkitModule, {
  addListener,
  removeSubscription,
} from './ExpoAlarmkitModule';

// Types for AlarmKit functionality
export interface AlarmKitAuthorizationStatus {
  granted: boolean;
  status: 'notDetermined' | 'authorized' | 'denied';
}

export interface NativeAlarm {
  id: string;
  title: string;
  date: Date;
  soundName?: string;
  repeatDays?: number[];
  isActive: boolean;
}

export interface AlarmKitEvent {
  alarmId: string;
  type: 'triggered' | 'stopped' | 'snoozed';
  timestamp: number;
}

// Main AlarmKit interface
export interface AlarmKitModule {
  // Authorization
  requestAuthorization(): Promise<boolean>;
  getAuthorizationStatus(): Promise<AlarmKitAuthorizationStatus>;

  // Alarm Management
  scheduleAlarm(alarm: NativeAlarm): Promise<string>;
  cancelAlarm(alarmId: string): Promise<void>;
  cancelAllAlarms(): Promise<void>;
  getScheduledAlarms(): Promise<NativeAlarm[]>;

  // Alarm Control
  snoozeAlarm(alarmId: string, minutes?: number): Promise<void>;
  stopAlarm(alarmId: string): Promise<void>;

  // Utility
  isAvailable(): Promise<boolean>;
  getVersion(): Promise<string>;
}

// Event listener types
export type AlarmKitEventListener = (event: AlarmKitEvent) => void;

// Main module functions
export async function requestAuthorization(): Promise<boolean> {
  return ExpoAlarmkitModule.requestAuthorization();
}

export async function getAuthorizationStatus(): Promise<AlarmKitAuthorizationStatus> {
  return ExpoAlarmkitModule.getAuthorizationStatus();
}

export async function scheduleAlarm(alarm: NativeAlarm): Promise<string> {
  return ExpoAlarmkitModule.scheduleAlarm(alarm);
}

export async function cancelAlarm(alarmId: string): Promise<void> {
  return ExpoAlarmkitModule.cancelAlarm(alarmId);
}

export async function cancelAllAlarms(): Promise<void> {
  return ExpoAlarmkitModule.cancelAllAlarms();
}

export async function getScheduledAlarms(): Promise<NativeAlarm[]> {
  return ExpoAlarmkitModule.getScheduledAlarms();
}

export async function snoozeAlarm(
  alarmId: string,
  minutes: number = 5
): Promise<void> {
  return ExpoAlarmkitModule.snoozeAlarm(alarmId, minutes);
}

export async function stopAlarm(alarmId: string): Promise<void> {
  return ExpoAlarmkitModule.stopAlarm(alarmId);
}

export async function isAvailable(): Promise<boolean> {
  return ExpoAlarmkitModule.isAvailable();
}

export async function getVersion(): Promise<string> {
  return ExpoAlarmkitModule.getVersion();
}

// Event subscription
export function addAlarmEventListener(listener: AlarmKitEventListener) {
  return addListener('onAlarmEvent', listener);
}

export function removeAlarmEventListener(subscription: any) {
  return removeSubscription(subscription);
}

export default ExpoAlarmkitModule;
