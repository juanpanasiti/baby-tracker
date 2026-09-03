import * as Notifications from 'expo-notifications';
import notifee, {
  AndroidImportance,
  AndroidCategory,
  AndroidVisibility,
  TriggerType,
  AlarmType,
  TimestampTrigger,
  EventType,
} from '@notifee/react-native';
import { Platform } from 'react-native';
import i18n from '../i18n';
import { useAlarmRingingStore } from '../store/useAlarmRingingStore';
import { usePreferencesStore } from '../store/usePreferencesStore';

export const FEEDING_ALARM_CATEGORY = 'feeding-alarm-category';
export const MEDICATION_ALARM_CATEGORY = 'medication-alarm-category';

// Configure default notification handler for Expo foreground notifications (non-alarm / general)
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request.content.data;
    const isAlarm = data?.alertMode === 'alarm';

    if (isAlarm && (data?.type === 'feeding' || data?.type === 'medication')) {
      useAlarmRingingStore.getState().triggerAlarm({
        babyId: data.babyId as string | undefined,
        babyName: data.babyName as string | undefined,
        soundName: data.soundName as string | undefined,
        alarmType: data.type as 'feeding' | 'medication',
        medicationId: data.medicationId as string | undefined,
        medicationName: data.medicationName as string | undefined,
        dosage: data.dosage as string | undefined,
        isReAlert: String(data?.isReAlert) === 'true',
        repeatCount: data?.repeatCount ? Number(data.repeatCount) : 0,
        originalTargetTime: data?.originalTargetTime ? Number(data.originalTargetTime) : undefined,
      });
    }

    return {
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: !isAlarm,
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
        {
          identifier: 'DISMISS_ALARM',
          buttonTitle: i18n.t('alarms.dismissShort', { defaultValue: 'Dismiss' }),
          options: {
            opensAppToForeground: false,
          },
        },
      ]);

      await Notifications.setNotificationCategoryAsync(MEDICATION_ALARM_CATEGORY, [
        {
          identifier: 'TAKE_MEDICATION',
          buttonTitle: i18n.t('medications.takeDose', { defaultValue: 'Take Dose' }),
          options: {
            opensAppToForeground: false,
          },
        },
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
        {
          identifier: 'DISMISS_ALARM',
          buttonTitle: i18n.t('alarms.dismissShort', { defaultValue: 'Dismiss' }),
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
      const soundFile = alarmSound && alarmSound !== 'default' ? alarmSound : 'default';

      try {
        // 1. Notifee Persistent High-priority Feeding Alarm Channel
        await notifee.createChannel({
          id: 'feeding-alarms',
          name: 'Feeding Alarms (Night/Loud)',
          importance: AndroidImportance.HIGH,
          sound: soundFile,
          vibration: true,
          vibrationPattern: [0, 600, 300, 600, 300, 1000],
          bypassDnd: true,
          visibility: AndroidVisibility.PUBLIC,
          lights: true,
          lightColor: '#EF4444',
        });

        // 2. Notifee Standard Discrete Feeding Notification Channel
        await notifee.createChannel({
          id: 'feeding-notifications',
          name: 'Feeding Notifications (Daytime)',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
          vibrationPattern: [0, 250, 250, 250],
          visibility: AndroidVisibility.PUBLIC,
          lights: true,
          lightColor: '#6366F1',
        });

        // 3. Notifee Persistent Loud Medication Alarm Channel
        await notifee.createChannel({
          id: 'medication-alarms',
          name: 'Medication Alarms (Loud)',
          importance: AndroidImportance.HIGH,
          sound: soundFile,
          vibration: true,
          vibrationPattern: [0, 600, 300, 600, 300, 1000],
          bypassDnd: true,
          visibility: AndroidVisibility.PUBLIC,
          lights: true,
          lightColor: '#10B981',
        });

        // 4. Notifee Discrete Medication Notifications
        await notifee.createChannel({
          id: 'medication-notifications',
          name: 'Medication Notifications (Daytime)',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
          vibrationPattern: [0, 250, 250, 250],
          visibility: AndroidVisibility.PUBLIC,
          lights: true,
          lightColor: '#10B981',
        });

        // 5. Notifee Appointment Reminders
        await notifee.createChannel({
          id: 'appointment-reminders',
          name: 'Appointment Reminders',
          importance: AndroidImportance.HIGH,
          sound: 'default',
          vibration: true,
          vibrationPattern: [0, 250, 250, 250],
          visibility: AndroidVisibility.PUBLIC,
          lights: true,
          lightColor: '#A78BFA',
        });
      } catch (e) {
        console.warn('[notificationService] Error setting up Notifee channels:', e);
      }

      // Also set up Expo notification channels for complete backward compatibility
      try {
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
      } catch {
        // Ignored
      }
    }
  },

  initListeners(): void {
    if (this.listenersInitialized) return;
    this.listenersInitialized = true;

    // Check if app was opened from an initial alarm notification or full-screen intent
    notifee.getInitialNotification().then((initialNotification) => {
      if (initialNotification) {
        const { notification, pressAction } = initialNotification;
        const data = notification?.data;
        const actionId = pressAction?.id;

        if (actionId === 'SILENCE_ALARM') {
          useAlarmRingingStore.getState().silenceAlarm();
        } else if (actionId === 'SNOOZE_ALARM') {
          useAlarmRingingStore.getState().snoozeAlarm(15);
        } else if (actionId === 'TAKE_MEDICATION') {
          useAlarmRingingStore.getState().takeMedicationDose();
        } else if (actionId === 'DISMISS_ALARM') {
          useAlarmRingingStore.getState().dismissAlarm();
        } else if (data?.alertMode === 'alarm') {
          useAlarmRingingStore.getState().triggerAlarm({
            babyId: data.babyId as string | undefined,
            babyName: data.babyName as string | undefined,
            soundName: data.soundName as string | undefined,
            alarmType: data.type as 'feeding' | 'medication',
            medicationId: data.medicationId as string | undefined,
            medicationName: data.medicationName as string | undefined,
            dosage: data.dosage as string | undefined,
            isReAlert: String(data?.isReAlert) === 'true',
            repeatCount: data?.repeatCount ? Number(data.repeatCount) : 0,
            originalTargetTime: data?.originalTargetTime ? Number(data.originalTargetTime) : undefined,
          });
        }
      }
    }).catch(() => {
      // Ignored
    });

    // 1. Notifee Foreground Event Listener
    try {
      notifee.onForegroundEvent(async ({ type, detail }) => {
        const { notification, pressAction } = detail;
        const data = notification?.data;

        if (type === EventType.ACTION_PRESS || type === EventType.PRESS) {
          const actionId = pressAction?.id;

          if (actionId === 'SILENCE_ALARM') {
            await useAlarmRingingStore.getState().silenceAlarm();
            if (notification?.id) {
              await notifee.cancelNotification(notification.id);
            }
          } else if (actionId === 'SNOOZE_ALARM') {
            await useAlarmRingingStore.getState().snoozeAlarm(15);
            if (notification?.id) {
              await notifee.cancelNotification(notification.id);
            }
          } else if (actionId === 'TAKE_MEDICATION') {
            await useAlarmRingingStore.getState().takeMedicationDose();
            if (notification?.id) {
              await notifee.cancelNotification(notification.id);
            }
          } else if (actionId === 'DISMISS_ALARM') {
            await useAlarmRingingStore.getState().dismissAlarm();
            if (notification?.id) {
              await notifee.cancelNotification(notification.id);
            }
          } else {
            // Caregiver tapped notification banner -> Trigger full screen alarm UI
            if (data?.alertMode === 'alarm') {
              useAlarmRingingStore.getState().triggerAlarm({
                babyId: data.babyId as string | undefined,
                babyName: data.babyName as string | undefined,
                soundName: data.soundName as string | undefined,
                alarmType: data.type as 'feeding' | 'medication',
                medicationId: data.medicationId as string | undefined,
                medicationName: data.medicationName as string | undefined,
                dosage: data.dosage as string | undefined,
                isReAlert: String(data?.isReAlert) === 'true',
                repeatCount: data?.repeatCount ? Number(data.repeatCount) : 0,
                originalTargetTime: data?.originalTargetTime ? Number(data.originalTargetTime) : undefined,
              });
            }
          }
        }
      });
    } catch (e) {
      console.warn('[notificationService] Failed to bind Notifee foreground listener:', e);
    }

    // 2. Expo Notification Response Listener (fallback)
    Notifications.addNotificationResponseReceivedListener((response) => {
      const { actionIdentifier, notification } = response;
      const data = notification.request.content.data;

      if (data?.type === 'feeding') {
        if (actionIdentifier === 'SILENCE_ALARM') {
          useAlarmRingingStore.getState().silenceAlarm();
        } else if (actionIdentifier === 'SNOOZE_ALARM') {
          useAlarmRingingStore.getState().snoozeAlarm(15);
        } else if (actionIdentifier === 'DISMISS_ALARM') {
          useAlarmRingingStore.getState().dismissAlarm();
        } else {
          useAlarmRingingStore.getState().triggerAlarm({
            babyId: data.babyId as string | undefined,
            babyName: data.babyName as string | undefined,
            soundName: data.soundName as string | undefined,
            alarmType: 'feeding',
            isReAlert: String(data?.isReAlert) === 'true',
            repeatCount: data?.repeatCount ? Number(data.repeatCount) : 0,
            originalTargetTime: data?.originalTargetTime ? Number(data.originalTargetTime) : undefined,
          });
        }
      } else if (data?.type === 'medication') {
        if (actionIdentifier === 'SILENCE_ALARM') {
          useAlarmRingingStore.getState().silenceAlarm();
        } else if (actionIdentifier === 'SNOOZE_ALARM') {
          useAlarmRingingStore.getState().snoozeAlarm(15);
        } else if (actionIdentifier === 'TAKE_MEDICATION') {
          useAlarmRingingStore.getState().takeMedicationDose();
        } else if (actionIdentifier === 'DISMISS_ALARM') {
          useAlarmRingingStore.getState().dismissAlarm();
        } else {
          useAlarmRingingStore.getState().triggerAlarm({
            babyId: data.babyId as string | undefined,
            babyName: data.babyName as string | undefined,
            soundName: data.soundName as string | undefined,
            alarmType: 'medication',
            medicationId: data.medicationId as string | undefined,
            medicationName: data.medicationName as string | undefined,
            dosage: data.dosage as string | undefined,
            isReAlert: String(data?.isReAlert) === 'true',
            repeatCount: data?.repeatCount ? Number(data.repeatCount) : 0,
            originalTargetTime: data?.originalTargetTime ? Number(data.originalTargetTime) : undefined,
          });
        }
      }
    });
  },

  async requestPermissions(): Promise<boolean> {
    try {
      const settings = await notifee.requestPermission();
      const granted = settings.authorizationStatus >= 1;
      if (granted) return true;
    } catch {
      // Fallback to Expo permissions
    }

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

    const isAlarm = alertMode === 'alarm';
    const channelId = isAlarm ? 'feeding-alarms' : 'feeding-notifications';

    const title = isAlarm
      ? i18n.t('alarms.feedingAlarmTitle', { defaultValue: '🚨 Feeding Alarm' })
      : i18n.t('alarms.feedingNotificationTitle', { defaultValue: '🍼 Time for Feeding' });
    const body = i18n.t('alarms.feedingAlarmBody', { babyName: babyName || 'Baby' });

    const notificationId = `feeding-${options?.babyId || 'default'}-${Date.now()}`;

    try {
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: targetTime,
        alarmManager: {
          type: AlarmType.SET_ALARM_CLOCK,
        },
      };

      await notifee.createTriggerNotification(
        {
          id: notificationId,
          title,
          body,
          data: {
            type: 'feeding',
            targetTime: String(targetTime),
            alertMode,
            soundName,
            babyName,
            babyId: options?.babyId || '',
            isReAlert: 'false',
            repeatCount: '0',
            originalTargetTime: String(targetTime),
          },
          android: {
            channelId,
            category: isAlarm ? AndroidCategory.ALARM : AndroidCategory.REMINDER,
            importance: AndroidImportance.HIGH,
            sound: soundFileMapping(soundName),
            loopSound: isAlarm,
            asForegroundService: isAlarm,
            ongoing: isAlarm,
            autoCancel: !isAlarm,
            visibility: AndroidVisibility.PUBLIC,
            fullScreenAction: isAlarm
              ? {
                  id: 'default',
                  launchActivity: 'default',
                }
              : undefined,
            pressAction: {
              id: 'default',
              launchActivity: 'default',
            },
            actions: isAlarm
              ? [
                  {
                    title: i18n.t('alarms.silence', { defaultValue: 'Silence' }),
                    pressAction: {
                      id: 'SILENCE_ALARM',
                    },
                  },
                  {
                    title: i18n.t('alarms.snooze', { defaultValue: 'Snooze (+15m)' }),
                    pressAction: {
                      id: 'SNOOZE_ALARM',
                    },
                  },
                  {
                    title: i18n.t('alarms.dismissShort', { defaultValue: 'Dismiss' }),
                    pressAction: {
                      id: 'DISMISS_ALARM',
                    },
                  },
                ]
              : undefined,
          },
        },
        trigger
      );

      return { notificationId, targetTime };
    } catch (e) {
      console.warn('[notificationService] Failed to schedule Notifee alarm, falling back to Expo:', e);
      // Expo fallback
      const expoId = await Notifications.scheduleNotificationAsync({
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
          date: new Date(targetTime),
          channelId,
        },
      });

      return { notificationId: expoId, targetTime };
    }
  },

  async previewAlarmSound(soundName = 'default', alertMode: 'notification' | 'alarm' = 'alarm'): Promise<void> {
    await this.setupChannels(soundName);
    await this.requestPermissions();

    const isAlarm = alertMode === 'alarm';

    if (isAlarm) {
      // Test continuous alarm loop in app
      useAlarmRingingStore.getState().triggerAlarm({
        babyName: 'Baby',
        soundName,
        alarmType: 'feeding',
      });
    } else {
      await notifee.displayNotification({
        title: '🔔 Notification Preview / Notificación',
        body: `Testing ${soundName} sound`,
        android: {
          channelId: 'feeding-notifications',
          importance: AndroidImportance.HIGH,
          sound: soundFileMapping(soundName),
        },
      });
    }
  },

  async scheduleMedicationAlarm(
    babyName: string,
    medicationName: string,
    targetTime: number,
    options?: {
      dosage?: string;
      alertMode?: 'notification' | 'alarm';
      soundName?: string;
      babyId?: string;
      medicationId?: string;
    }
  ): Promise<{ notificationId: string; targetTime: number } | null> {
    if (targetTime <= Date.now()) {
      return null;
    }

    const alertMode = options?.alertMode || 'alarm';
    const soundName = options?.soundName || 'default';

    await this.setupChannels(soundName);
    await this.requestPermissions();

    const isAlarm = alertMode === 'alarm';
    const channelId = isAlarm ? 'medication-alarms' : 'medication-notifications';

    const title = isAlarm
      ? i18n.t('alarms.medicationAlarmTitle', { defaultValue: '💊 Medication Alarm' })
      : i18n.t('alarms.medicationNotificationTitle', { defaultValue: '💊 Time for Medication' });
    const doseText = options?.dosage ? ` (${options.dosage})` : '';
    const body = i18n.t('alarms.medicationAlarmBody', {
      babyName: babyName || 'Baby',
      medication: medicationName + doseText,
      defaultValue: `${babyName || 'Baby'}: Time for ${medicationName}${doseText}`,
    });

    const notificationId = `medication-${options?.medicationId || 'default'}-${Date.now()}`;

    try {
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: targetTime,
        alarmManager: {
          type: AlarmType.SET_ALARM_CLOCK,
        },
      };

      await notifee.createTriggerNotification(
        {
          id: notificationId,
          title,
          body,
          data: {
            type: 'medication',
            targetTime: String(targetTime),
            alertMode,
            soundName,
            babyName,
            babyId: options?.babyId || '',
            medicationId: options?.medicationId || '',
            medicationName,
            dosage: options?.dosage || '',
            isReAlert: 'false',
            repeatCount: '0',
            originalTargetTime: String(targetTime),
          },
          android: {
            channelId,
            category: isAlarm ? AndroidCategory.ALARM : AndroidCategory.REMINDER,
            importance: AndroidImportance.HIGH,
            sound: soundFileMapping(soundName),
            loopSound: isAlarm,
            asForegroundService: isAlarm,
            ongoing: isAlarm,
            autoCancel: !isAlarm,
            visibility: AndroidVisibility.PUBLIC,
            fullScreenAction: isAlarm
              ? {
                  id: 'default',
                  launchActivity: 'default',
                }
              : undefined,
            pressAction: {
              id: 'default',
              launchActivity: 'default',
            },
            actions: isAlarm
              ? [
                  {
                    title: i18n.t('medications.takeDose', { defaultValue: 'Take Dose' }),
                    pressAction: {
                      id: 'TAKE_MEDICATION',
                    },
                  },
                  {
                    title: i18n.t('alarms.silence', { defaultValue: 'Silence' }),
                    pressAction: {
                      id: 'SILENCE_ALARM',
                    },
                  },
                  {
                    title: i18n.t('alarms.snooze', { defaultValue: 'Snooze (+15m)' }),
                    pressAction: {
                      id: 'SNOOZE_ALARM',
                    },
                  },
                  {
                    title: i18n.t('alarms.dismissShort', { defaultValue: 'Dismiss' }),
                    pressAction: {
                      id: 'DISMISS_ALARM',
                    },
                  },
                ]
              : undefined,
          },
        },
        trigger
      );

      return { notificationId, targetTime };
    } catch (e) {
      console.warn('[notificationService] Failed to schedule Notifee medication alarm, falling back:', e);

      const expoId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: soundName !== 'default' ? soundName : true,
          priority: isAlarm
            ? Notifications.AndroidNotificationPriority.MAX
            : Notifications.AndroidNotificationPriority.HIGH,
          vibrate: isAlarm ? [0, 500, 250, 500, 250, 500] : [0, 250, 250, 250],
          categoryIdentifier: isAlarm ? MEDICATION_ALARM_CATEGORY : undefined,
          data: {
            type: 'medication',
            targetTime,
            alertMode,
            soundName,
            babyName,
            babyId: options?.babyId,
            medicationId: options?.medicationId,
            medicationName,
            dosage: options?.dosage,
            isReAlert: 'false',
            repeatCount: '0',
            originalTargetTime: String(targetTime),
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(targetTime),
          channelId,
        },
      });

      return { notificationId: expoId, targetTime };
    }
  },

  async scheduleReAlertAlarm(params: {
    type: 'feeding' | 'medication';
    babyName: string;
    babyId?: string;
    soundName?: string;
    repeatCount?: number;
    originalTargetTime?: number;
    medicationId?: string;
    medicationName?: string;
    dosage?: string;
    intervalMinutes?: number;
  }): Promise<{ notificationId: string; targetTime: number } | null> {
    const preferences = usePreferencesStore.getState();
    if (!preferences.alarmNaggingEnabled) {
      return null;
    }

    const currentCount = params.repeatCount ?? 0;
    const maxRepeats = preferences.alarmNaggingMaxRepeats;
    if (maxRepeats !== null && currentCount >= maxRepeats) {
      return null;
    }

    const intervalMinutes = params.intervalMinutes || preferences.alarmNaggingInterval || 5;
    const targetTime = Date.now() + intervalMinutes * 60 * 1000;
    const nextRepeatCount = currentCount + 1;
    const soundName = params.soundName || preferences.alarmSound || 'default';
    const isMedication = params.type === 'medication';

    await this.setupChannels(soundName);
    await this.requestPermissions();

    const channelId = isMedication ? 'medication-alarms' : 'feeding-alarms';
    const idKey = isMedication && params.medicationId ? params.medicationId : params.babyId || 'default';
    const notificationId = `realert-${params.type}-${idKey}-${Date.now()}`;

    const title = isMedication
      ? i18n.t('alarms.reAlertMedicationTitle', { defaultValue: '💊 Medication Reminder (Repeat)' })
      : i18n.t('alarms.reAlertFeedingTitle', { defaultValue: '🍼 Feeding Reminder (Repeat)' });

    const body = isMedication
      ? i18n.t('alarms.reAlertMedicationBody', {
          babyName: params.babyName || 'Baby',
          medication: (params.medicationName || 'Medication') + (params.dosage ? ` (${params.dosage})` : ''),
          defaultValue: `Dose not logged yet: ${params.medicationName || 'Medication'} for ${params.babyName || 'Baby'}.`,
        })
      : i18n.t('alarms.reAlertFeedingBody', {
          babyName: params.babyName || 'Baby',
          defaultValue: `Feeding not logged yet for ${params.babyName || 'Baby'}. Time to feed!`,
        });

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: targetTime,
      alarmManager: {
        type: AlarmType.SET_ALARM_CLOCK,
      },
    };

    const actions = isMedication
      ? [
          {
            title: i18n.t('medications.takeDose', { defaultValue: 'Take Dose' }),
            pressAction: { id: 'TAKE_MEDICATION' },
          },
          {
            title: i18n.t('alarms.silence', { defaultValue: 'Silence' }),
            pressAction: { id: 'SILENCE_ALARM' },
          },
          {
            title: i18n.t('alarms.snooze', { defaultValue: 'Snooze (+15m)' }),
            pressAction: { id: 'SNOOZE_ALARM' },
          },
          {
            title: i18n.t('alarms.dismissShort', { defaultValue: 'Dismiss' }),
            pressAction: { id: 'DISMISS_ALARM' },
          },
        ]
      : [
          {
            title: i18n.t('alarms.silence', { defaultValue: 'Silence' }),
            pressAction: { id: 'SILENCE_ALARM' },
          },
          {
            title: i18n.t('alarms.snooze', { defaultValue: 'Snooze (+15m)' }),
            pressAction: { id: 'SNOOZE_ALARM' },
          },
          {
            title: i18n.t('alarms.dismissShort', { defaultValue: 'Dismiss' }),
            pressAction: { id: 'DISMISS_ALARM' },
          },
        ];

    try {
      await notifee.createTriggerNotification(
        {
          id: notificationId,
          title,
          body,
          data: {
            type: params.type,
            targetTime: String(targetTime),
            alertMode: 'alarm',
            soundName,
            babyName: params.babyName,
            babyId: params.babyId || '',
            medicationId: params.medicationId || '',
            medicationName: params.medicationName || '',
            dosage: params.dosage || '',
            isReAlert: 'true',
            repeatCount: String(nextRepeatCount),
            originalTargetTime: String(params.originalTargetTime || targetTime),
          },
          android: {
            channelId,
            category: AndroidCategory.ALARM,
            importance: AndroidImportance.HIGH,
            sound: soundFileMapping(soundName),
            loopSound: true,
            asForegroundService: true,
            ongoing: true,
            autoCancel: false,
            visibility: AndroidVisibility.PUBLIC,
            fullScreenAction: {
              id: 'default',
              launchActivity: 'default',
            },
            pressAction: {
              id: 'default',
              launchActivity: 'default',
            },
            actions,
          },
        },
        trigger
      );

      return { notificationId, targetTime };
    } catch (e) {
      console.warn('[notificationService] Failed to schedule re-alert notification:', e);
      return null;
    }
  },

  async scheduleAppointmentReminder(
    title: string,
    doctorName: string,
    appointmentTime: number,
    minutesBefore: number,
    category: 'medical' | 'vaccine' | 'administrative' | 'other' = 'medical'
  ): Promise<string | null> {
    await this.setupChannels();
    await this.requestPermissions();

    const targetTime = appointmentTime - minutesBefore * 60 * 1000;
    if (targetTime <= Date.now()) {
      return null;
    }

    const dateStr = new Date(appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const notifTitle = i18n.t(`alarms.appointmentAlarmTitle_${category}`, {
      title,
      defaultValue: i18n.t('alarms.appointmentAlarmTitle', { title }),
    });

    let notifBody = '';
    if (category === 'medical') {
      notifBody = i18n.t('alarms.appointmentAlarmBody_medical', {
        doctor: doctorName || 'Doctor',
        time: dateStr,
        defaultValue: i18n.t('alarms.appointmentAlarmBody', { doctor: doctorName || 'Doctor', time: dateStr }),
      });
    } else {
      notifBody = i18n.t(`alarms.appointmentAlarmBody_${category}`, {
        time: dateStr,
        defaultValue: i18n.t('alarms.appointmentAlarmBody_other', { time: dateStr }),
      });
    }

    const notificationId = `appointment-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    try {
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: targetTime,
      };

      await notifee.createTriggerNotification(
        {
          id: notificationId,
          title: notifTitle,
          body: notifBody,
          data: {
            type: 'appointment',
            appointmentTime: String(appointmentTime),
            category,
          },
          android: {
            channelId: 'appointment-reminders',
            importance: AndroidImportance.HIGH,
            sound: 'default',
          },
        },
        trigger
      );

      return notificationId;
    } catch {
      return await Notifications.scheduleNotificationAsync({
        content: {
          title: notifTitle,
          body: notifBody,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          vibrate: [0, 250, 250, 250],
          data: { type: 'appointment', appointmentTime, category },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(targetTime),
          channelId: 'appointment-reminders',
        },
      });
    }
  },

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await notifee.cancelNotification(notificationId);
      await notifee.cancelTriggerNotification(notificationId);
    } catch {
      // Ignored
    }

    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch {
      // Ignored
    }
  },

  async cancelMedicationReAlerts(medicationId: string): Promise<void> {
    try {
      const triggerIds = await notifee.getTriggerNotificationIds();
      for (const id of triggerIds) {
        if (id.includes(medicationId)) {
          await this.cancelNotification(id);
        }
      }
      const displayed = await notifee.getDisplayedNotifications();
      for (const item of displayed) {
        if (
          (item.notification.id && item.notification.id.includes(medicationId)) ||
          item.notification.data?.medicationId === medicationId
        ) {
          if (item.notification.id) {
            await notifee.cancelNotification(item.notification.id);
          }
        }
      }
    } catch {
      // Ignored
    }
  },

  async cancelAllNotifications(): Promise<void> {
    try {
      await notifee.cancelAllNotifications();
      await notifee.cancelTriggerNotifications();
    } catch {
      // Ignored
    }

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch {
      // Ignored
    }
  },
};

function soundFileMapping(soundName?: string): string {
  if (!soundName || soundName === 'default') return 'default';
  return soundName;
}

