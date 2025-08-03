import { NativeModulesProxy, EventEmitter } from 'expo-modules-core';

// This will be the actual native module proxy
const ExpoAlarmkitModule = NativeModulesProxy.ExpoAlarmkit;

// Basic module functions
export async function requestAuthorization(): Promise<boolean> {
  return ExpoAlarmkitModule?.requestAuthorization();
}

export async function getAuthorizationStatus(): Promise<any> {
  return ExpoAlarmkitModule?.getAuthorizationStatus();
}

export async function scheduleAlarm(alarm: any): Promise<string> {
  return ExpoAlarmkitModule?.scheduleAlarm(alarm);
}

export async function cancelAlarm(alarmId: string): Promise<void> {
  return ExpoAlarmkitModule?.cancelAlarm(alarmId);
}

export async function cancelAllAlarms(): Promise<void> {
  return ExpoAlarmkitModule?.cancelAllAlarms();
}

export async function getScheduledAlarms(): Promise<any[]> {
  return ExpoAlarmkitModule?.getScheduledAlarms();
}

export async function snoozeAlarm(
  alarmId: string,
  minutes: number
): Promise<void> {
  return ExpoAlarmkitModule?.snoozeAlarm(alarmId, minutes);
}

export async function stopAlarm(alarmId: string): Promise<void> {
  return ExpoAlarmkitModule?.stopAlarm(alarmId);
}

export async function isAvailable(): Promise<boolean> {
  return ExpoAlarmkitModule?.isAvailable();
}

export async function getVersion(): Promise<string> {
  return ExpoAlarmkitModule?.getVersion();
}

// Event emitter using proper expo-modules-core pattern
// Use a simple event listener store since we don't have a proper EventEmitter
let listeners: { [eventName: string]: Array<(event: any) => void> } = {};

export function addListener(
  eventName: string,
  listener: (event: any) => void
): any {
  if (!listeners[eventName]) {
    listeners[eventName] = [];
  }
  listeners[eventName].push(listener);

  // Return a subscription object
  return {
    remove: () => {
      if (listeners[eventName]) {
        const index = listeners[eventName].indexOf(listener);
        if (index > -1) {
          listeners[eventName].splice(index, 1);
        }
      }
    },
  };
}

export function removeSubscription(subscription: any): void {
  if (subscription?.remove) {
    subscription.remove();
  }
}

// Function to emit events to listeners (used internally)
export function emitEvent(eventName: string, event: any): void {
  if (listeners[eventName]) {
    listeners[eventName].forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in AlarmKit event listener:', error);
      }
    });
  }
}

export default ExpoAlarmkitModule;
