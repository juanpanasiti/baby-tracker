import { registerRootComponent } from 'expo';
import notifee, { EventType } from '@notifee/react-native';
import { useAlarmRingingStore } from './src/store/useAlarmRingingStore';
import { initDatabase } from './src/db/client';

import App from './App';

// Handle background notification actions (Silence, Snooze, Take Dose) when app is minimized or killed
notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification, pressAction } = detail;

  if (type === EventType.ACTION_PRESS) {
    const actionId = pressAction?.id;

    if (actionId === 'SILENCE_ALARM') {
      await useAlarmRingingStore.getState().silenceAlarm();
      if (notification?.id) {
        await notifee.cancelNotification(notification.id);
      }
    } else if (actionId === 'SNOOZE_ALARM') {
      try {
        await initDatabase();
      } catch {
        // Ignored if already initialized
      }
      await useAlarmRingingStore.getState().snoozeAlarm(15);
      if (notification?.id) {
        await notifee.cancelNotification(notification.id);
      }
    } else if (actionId === 'TAKE_MEDICATION') {
      try {
        await initDatabase();
      } catch {
        // Ignored if already initialized
      }
      await useAlarmRingingStore.getState().takeMedicationDose();
      if (notification?.id) {
        await notifee.cancelNotification(notification.id);
      }
    }
  }
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

