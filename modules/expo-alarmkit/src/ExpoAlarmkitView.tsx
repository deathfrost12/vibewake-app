import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoAlarmkitViewProps } from './ExpoAlarmkit.types';

const NativeView: React.ComponentType<ExpoAlarmkitViewProps> =
  requireNativeView('ExpoAlarmkit');

export default function ExpoAlarmkitView(props: ExpoAlarmkitViewProps) {
  return <NativeView {...props} />;
}
