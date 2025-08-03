// Export all types
export * from './src/ExpoAlarmkit.types';

// Export module functions
export {
  isAvailable,
  getVersion,
  requestAuthorization,
  getAuthorizationStatus,
  scheduleAlarm,
  cancelAlarm,
  cancelAllAlarms,
  getScheduledAlarms,
  snoozeAlarm,
  stopAlarm,
  addListener as addAlarmEventListener,
  removeSubscription as removeAlarmEventListener,
} from './src/ExpoAlarmkitModule';

// Export default module
export { default } from './src/ExpoAlarmkitModule';
