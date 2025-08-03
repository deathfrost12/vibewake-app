import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './ExpoAlarmkit.types';

type ExpoAlarmkitModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class ExpoAlarmkitModule extends NativeModule<ExpoAlarmkitModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(ExpoAlarmkitModule, 'ExpoAlarmkitModule');
