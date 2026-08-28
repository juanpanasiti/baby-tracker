import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import i18n from '../i18n';

// Configure default notification handler for foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  async setupChannels(): Promise<void> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('feeding-alarms', {
        name: 'Feeding Alarms',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6366F1',
      });

      await Notifications.setNotificationChannelAsync('appointment-reminders', {
        name: 'Appointment Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#A78BFA',
      });
    }
  },

  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  },

  async scheduleFeedingAlarm(
    babyName: string,
    intervalMinutes: number,
    baseTimestamp = Date.now()
  ): Promise<{ notificationId: string; targetTime: number }> {
    await this.setupChannels();
    await this.requestPermissions();

    const targetTime = baseTimestamp + intervalMinutes * 60 * 1000;
    const triggerDate = new Date(targetTime);

    const title = i18n.t('alarms.feedingAlarmTitle');
    const body = i18n.t('alarms.feedingAlarmBody', { babyName: babyName || 'Baby' });

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: 'feeding', targetTime },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId: 'feeding-alarms',
      },
    });

    return { notificationId, targetTime };
  },

  async scheduleAppointmentReminder(
    title: string,
    doctorName: string,
    appointmentTime: number,
    minutesBefore: number
  ): Promise<string | null> {
    await this.setupChannels();
    await this.requestPermissions();

    const targetTime = appointmentTime - minutesBefore * 60 * 1000;
    if (targetTime <= Date.now()) {
      return null;
    }

    const triggerDate = new Date(targetTime);
    const dateStr = new Date(appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const notifTitle = i18n.t('alarms.appointmentAlarmTitle', { title });
    const notifBody = i18n.t('alarms.appointmentAlarmBody', {
      doctor: doctorName || 'Pediatrician',
      time: dateStr,
    });

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: notifTitle,
        body: notifBody,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: 'appointment', appointmentTime },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId: 'appointment-reminders',
      },
    });

    return notificationId;
  },

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch {
      // Ignored
    }
  },

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch {
      // Ignored
    }
  },
};
