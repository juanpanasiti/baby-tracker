import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import i18n from '../i18n';
import { useAlarmRingingStore } from '../store/useAlarmRingingStore';

export const FEEDING_ALARM_CATEGORY = 'feeding-alarm-category';

// Configure default notification handler for foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request.content.data;
    const isAlarm = data?.alertMode === 'alarm';

    // If it's a feeding alarm received in foreground, trigger the continuous alarm loop & UI
    if (isAlarm && data?.type === 'feeding') {
      useAlarmRingingStore.getState().triggerAlarm(
        data.babyId as string | undefined,
        data.babyName as string | undefined,
        data.soundName as string | undefined
      );
    }

    return {
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: !isAlarm, // Alarm audio service handles looping audio for alarms
      shouldSetBadge: true,
    };
  },
});

export const notificationService = {
  listenersInitialized: false,

  async setupCategories(): Promise<void> {
    try {
      await Notifications.setNotificationCategoryAsync(FEEDING_ALARM_CATEGORY, [
        {
          identifier: 'SILENCE_ALARM',
          buttonTitle: i18n.t('alarms.silence', { defaultValue: 'Silence' }),
          options: {
            isDestructive: true,
            opensAppToForeground: false,
          },
        },
        {
          identifier: 'SNOOZE_ALARM',
          buttonTitle: i18n.t('alarms.snooze', { defaultValue: 'Snooze (+15m)' }),
          options: {
            opensAppToForeground: false,
          },
        },
      ]);
    } catch (e) {
      console.warn('[notificationService] Failed to set notification categories:', e);
    }
  },

  async setupChannels(alarmSound = 'default'): Promise<void> {
    await this.setupCategories();

    if (Platform.OS === 'android') {
      // 1. Standard discrete Daytime Feeding Notification
      await Notifications.setNotificationChannelAsync('feeding-notifications', {
        name: 'Feeding Notifications (Daytime)',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        enableLights: true,
        enableVibrate: true,
        lightColor: '#6366F1',
        audioAttributes: {
          usage: Notifications.AndroidAudioUsage.NOTIFICATION,
          contentType: Notifications.AndroidAudioContentType.SONIFICATION,
        },
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });

      // 2. High-priority Loud Alarm for Nighttime
      const soundFile = alarmSound && alarmSound !== 'default' ? alarmSound : 'default';
      await Notifications.setNotificationChannelAsync('feeding-alarms', {
        name: 'Feeding Alarms (Night/Loud)',
        importance: Notifications.AndroidImportance.MAX,
        sound: soundFile,
        vibrationPattern: [0, 500, 250, 500, 250, 500, 250, 500],
        enableLights: true,
        enableVibrate: true,
        lightColor: '#EF4444',
        audioAttributes: {
          usage: Notifications.AndroidAudioUsage.ALARM,
          contentType: Notifications.AndroidAudioContentType.SONIFICATION,
        },
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
      });

      // 3. Appointment Reminders
      await Notifications.setNotificationChannelAsync('appointment-reminders', {
        name: 'Appointment Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        enableLights: true,
        enableVibrate: true,
        lightColor: '#A78BFA',
        audioAttributes: {
          usage: Notifications.AndroidAudioUsage.NOTIFICATION,
          contentType: Notifications.AndroidAudioContentType.SONIFICATION,
        },
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }
  },

  initListeners(): void {
    if (this.listenersInitialized) return;
    this.listenersInitialized = true;

    // Handle user interaction with notification banner or action buttons
    Notifications.addNotificationResponseReceivedListener((response) => {
      const { actionIdentifier, notification } = response;
      const data = notification.request.content.data;

      if (data?.type === 'feeding') {
        if (actionIdentifier === 'SILENCE_ALARM') {
          useAlarmRingingStore.getState().silenceAlarm();
        } else if (actionIdentifier === 'SNOOZE_ALARM') {
          useAlarmRingingStore.getState().snoozeAlarm(15);
        } else {
          // Caregiver tapped the notification itself -> Trigger full screen alarm UI
          useAlarmRingingStore.getState().triggerAlarm(
            data.babyId as string | undefined,
            data.babyName as string | undefined,
            data.soundName as string | undefined
          );
        }
      }
    });
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
    intervalMinutesOrTimestamp: number,
    baseTimestamp = Date.now(),
    options?: {
      alertMode?: 'notification' | 'alarm';
      soundName?: string;
      isExactTimestamp?: boolean;
      babyId?: string;
    }
  ): Promise<{ notificationId: string; targetTime: number }> {
    const alertMode = options?.alertMode || 'alarm';
    const soundName = options?.soundName || 'default';

    await this.setupChannels(soundName);
    await this.requestPermissions();

    const targetTime = options?.isExactTimestamp
      ? intervalMinutesOrTimestamp
      : baseTimestamp + intervalMinutesOrTimestamp * 60 * 1000;

    const triggerDate = new Date(targetTime);
    const channelId = alertMode === 'alarm' ? 'feeding-alarms' : 'feeding-notifications';

    const isAlarm = alertMode === 'alarm';
    const title = isAlarm
      ? i18n.t('alarms.feedingAlarmTitle')
      : i18n.t('alarms.feedingNotificationTitle', { defaultValue: '🍼 Time for Feeding' });
    const body = i18n.t('alarms.feedingAlarmBody', { babyName: babyName || 'Baby' });

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: soundName !== 'default' ? soundName : true,
        priority: isAlarm
          ? Notifications.AndroidNotificationPriority.MAX
          : Notifications.AndroidNotificationPriority.HIGH,
        vibrate: isAlarm ? [0, 500, 250, 500, 250, 500] : [0, 250, 250, 250],
        categoryIdentifier: isAlarm ? FEEDING_ALARM_CATEGORY : undefined,
        data: {
          type: 'feeding',
          targetTime,
          alertMode,
          soundName,
          babyName,
          babyId: options?.babyId,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId,
      },
    });

    return { notificationId, targetTime };
  },

  async previewAlarmSound(soundName = 'default', alertMode: 'notification' | 'alarm' = 'alarm'): Promise<void> {
    await this.setupChannels(soundName);
    await this.requestPermissions();

    const isAlarm = alertMode === 'alarm';
    const channelId = isAlarm ? 'feeding-alarms' : 'feeding-notifications';

    if (isAlarm) {
      // Test the continuous alarm loop in app
      useAlarmRingingStore.getState().triggerAlarm(undefined, 'Baby', soundName);
    } else {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 Notification Preview / Notificación',
          body: `Testing ${soundName} sound`,
          sound: soundName !== 'default' ? soundName : true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          vibrate: [0, 250],
          data: { type: 'preview', soundName },
        },
        trigger: null, // trigger immediately
      });
    }
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
        priority: Notifications.AndroidNotificationPriority.MAX,
        vibrate: [0, 250, 250, 250],
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
