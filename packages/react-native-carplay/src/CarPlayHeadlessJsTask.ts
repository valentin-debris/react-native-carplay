import type { Task, TaskProvider } from 'react-native';
import { AppRegistry, DeviceEventEmitter, Platform } from 'react-native';

// this headless task is required on Android (Auto) to make sure timers are working fine when screen is off

const headlessTask: TaskProvider = (): Task => taskData =>
  new Promise((resolve, reject) => {
    let finishListener: ReturnType<typeof DeviceEventEmitter.addListener> | null = null;

    try {
      finishListener = DeviceEventEmitter.addListener('didFinish', () => {
        try {
          finishListener?.remove();
          resolve();
        } catch (error) {
          console.error('Error in CarPlayHeadlessJsTask didFinish listener:', error);
          reject(error);
        }
      });
    } catch (error) {
      console.error('Error in headless task:', error);
      finishListener?.remove();
      reject(error);
    }
  });

export default function registerHeadlessTask() {
  if (Platform.OS !== 'android') {
    return;
  }
  AppRegistry.registerHeadlessTask('CarPlayHeadlessJsTask', headlessTask);
}
