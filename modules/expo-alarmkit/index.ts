// Reexport the native module. On web, it will be resolved to ExpoAlarmkitModule.web.ts
// and on native platforms to ExpoAlarmkitModule.ts
export { default } from './src/ExpoAlarmkitModule';
export { default as ExpoAlarmkitView } from './src/ExpoAlarmkitView';
export * from  './src/ExpoAlarmkit.types';
