import { registerRootComponent } from 'expo';
import notifee, { EventType } from '@notifee/react-native';
import { useAlarmRingingStore } from './src/store/useAlarmRingingStore';
import { initDatabase } from './src/db/client';

import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { widgetTaskHandler } from './src/widgets/widgetTaskHandler';

import App from './App';

// Register Android Home Screen Widgets Task Handler
registerWidgetTaskHandler(widgetTaskHandler);

// Handle background notification actions (Silence, Snooze, Take Dose, Dismiss) when app is minimized or killed
notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification, pressAction } = detail;

  if (type === EventType.ACTION_PRESS) {
    const actionId = pressAction?.id;
    const data = notification?.data;

    if (actionId === 'SILENCE_ALARM') {
      try {
        await initDatabase();
      } catch {
        // Ignored if already initialized
      }

      // Populate store with notification metadata if app was cold-started in background
      if (data?.type) {
        useAlarmRingingStore.setState({
          ringingBabyId: (data.babyId as string) || null,
          ringingBabyName: (data.babyName as string) || null,
          ringingSound: (data.soundName as string) || 'default',
          alarmType: (data.type as 'feeding' | 'medication') || 'feeding',
          medicationId: (data.medicationId as string) || undefined,
          medicationName: (data.medicationName as string) || undefined,
          dosage: (data.dosage as string) || undefined,
          isReAlert: String(data.isReAlert) === 'true',
          repeatCount: data.repeatCount ? Number(data.repeatCount) : 0,
          originalTargetTime: data.originalTargetTime ? Number(data.originalTargetTime) : undefined,
        });
      }

      await useAlarmRingingStore.getState().silenceAlarm();
      if (notification?.id) {
        await notifee.cancelNotification(notification.id);
      }
    } else if (actionId === 'DISMISS_ALARM') {
      try {
        await initDatabase();
      } catch {
        // Ignored if already initialized
      }

      if (data?.type) {
        useAlarmRingingStore.setState({
          ringingBabyId: (data.babyId as string) || null,
          ringingBabyName: (data.babyName as string) || null,
          alarmType: (data.type as 'feeding' | 'medication') || 'feeding',
          medicationId: (data.medicationId as string) || undefined,
        });
      }

      await useAlarmRingingStore.getState().dismissAlarm();
      if (notification?.id) {
        await notifee.cancelNotification(notification.id);
      }
    } else if (actionId === 'SNOOZE_ALARM') {
      try {
        await initDatabase();
      } catch {
        // Ignored if already initialized
      }
      if (data?.type) {
        useAlarmRingingStore.setState({
          ringingBabyId: (data.babyId as string) || null,
          ringingBabyName: (data.babyName as string) || null,
          alarmType: (data.type as 'feeding' | 'medication') || 'feeding',
          medicationId: (data.medicationId as string) || undefined,
        });
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
      if (data?.medicationId) {
        useAlarmRingingStore.setState({
          medicationId: data.medicationId as string,
        });
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

