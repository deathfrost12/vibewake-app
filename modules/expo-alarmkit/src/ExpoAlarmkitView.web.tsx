import * as React from 'react';

import { ExpoAlarmkitViewProps } from './ExpoAlarmkit.types';

export default function ExpoAlarmkitView(props: ExpoAlarmkitViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
