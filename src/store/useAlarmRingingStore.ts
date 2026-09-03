import { create } from 'zustand';
import notifee from '@notifee/react-native';
import { alarmAudioService } from '../services/alarmAudioService';
import { useFeedingStore } from './useFeedingStore';
import { useBabyStore } from './useBabyStore';
import { usePreferencesStore } from './usePreferencesStore';

export interface TriggerAlarmParams {
  babyId?: string;
  babyName?: string;
  soundName?: string;
  alarmType?: 'feeding' | 'medication';
  medicationId?: string;
  medicationName?: string;
  dosage?: string;
  isReAlert?: boolean;
  repeatCount?: number;
  originalTargetTime?: number;
}

interface AlarmRingingState {
  isAlarmRinging: boolean;
  ringingBabyId: string | null;
  ringingBabyName: string | null;
  ringingSound: string;
  ringingTimestamp: number;
  alarmType: 'feeding' | 'medication';
  medicationId?: string;
  medicationName?: string;
  dosage?: string;
  isReAlert: boolean;
  repeatCount: number;
  originalTargetTime?: number;

  triggerAlarm: (params?: TriggerAlarmParams | string, babyName?: string, soundName?: string) => Promise<void>;
  silenceAlarm: () => Promise<void>;
  snoozeAlarm: (minutes?: number) => Promise<void>;
  takeMedicationDose: () => Promise<void>;
  dismissAlarm: () => Promise<void>;
}

export const useAlarmRingingStore = create<AlarmRingingState>((set, get) => ({
  isAlarmRinging: false,
  ringingBabyId: null,
  ringingBabyName: null,
  ringingSound: 'default',
  ringingTimestamp: 0,
  alarmType: 'feeding',
  medicationId: undefined,
  medicationName: undefined,
  dosage: undefined,
  isReAlert: false,
  repeatCount: 0,
  originalTargetTime: undefined,

  triggerAlarm: async (params, babyName, soundName) => {
    let resolvedBabyId: string | undefined;
    let resolvedBabyName: string | undefined;
    let resolvedSound: string | undefined;
    let alarmType: 'feeding' | 'medication' = 'feeding';
    let medicationId: string | undefined;
    let medicationName: string | undefined;
    let dosage: string | undefined;
    let isReAlert = false;
    let repeatCount = 0;
    let originalTargetTime: number | undefined;

    if (typeof params === 'object' && params !== null) {
      resolvedBabyId = params.babyId;
      resolvedBabyName = params.babyName;
      resolvedSound = params.soundName;
      alarmType = params.alarmType || 'feeding';
      medicationId = params.medicationId;
      medicationName = params.medicationName;
      dosage = params.dosage;
      isReAlert = Boolean(params.isReAlert);
      repeatCount = params.repeatCount || 0;
      originalTargetTime = params.originalTargetTime;
    } else {
      resolvedBabyId = params;
      resolvedBabyName = babyName;
      resolvedSound = soundName;
    }

    const currentBaby = useBabyStore.getState().baby;
    const finalBabyId = resolvedBabyId || currentBaby?.id || 'default-baby';
    const finalBabyName = resolvedBabyName || currentBaby?.name || 'Baby';
    const finalSound = resolvedSound || usePreferencesStore.getState().alarmSound || 'default';

    set({
      isAlarmRinging: true,
      ringingBabyId: finalBabyId,
      ringingBabyName: finalBabyName,
      ringingSound: finalSound,
      ringingTimestamp: Date.now(),
      alarmType,
      medicationId,
      medicationName,
      dosage,
      isReAlert,
      repeatCount,
      originalTargetTime,
    });

    await alarmAudioService.startAlarm(finalSound);
  },

  silenceAlarm: async () => {
    const {
      ringingBabyId,
      ringingBabyName,
      ringingSound,
      alarmType,
      medicationId,
      medicationName,
      dosage,
      repeatCount,
      originalTargetTime,
    } = get();

    await alarmAudioService.stopAlarm();
    try {
      await notifee.stopForegroundService();
      const displayed = await notifee.getDisplayedNotifications();
      for (const item of displayed) {
        if (item.notification.id) {
          await notifee.cancelNotification(item.notification.id);
        }
      }
    } catch {
      // Ignored
    }

    set({
      isAlarmRinging: false,
    });

    // Schedule re-alert if nagging is enabled and within repeat limits
    try {
      const { notificationService } = require('../services/notificationService');
      const result = await notificationService.scheduleReAlertAlarm({
        type: alarmType,
        babyName: ringingBabyName || 'Baby',
        babyId: ringingBabyId || undefined,
        soundName: ringingSound,
        repeatCount,
        originalTargetTime: originalTargetTime || Date.now(),
        medicationId,
        medicationName,
        dosage,
      });

      if (result && alarmType === 'feeding' && ringingBabyId) {
        const { reminderRepository } = require('../db/repositories/reminderRepository');
        const activeReminder = await reminderRepository.getNextActiveFeedingReminder(ringingBabyId);
        if (activeReminder) {
          await reminderRepository.updateReminder(activeReminder.id, {
            targetTime: result.targetTime,
            notificationId: result.notificationId,
          });
          const updated = await reminderRepository.getNextActiveFeedingReminder(ringingBabyId);
          useFeedingStore.setState({ activeReminder: updated });
        } else {
          const newReminder = await reminderRepository.createReminder({
            babyId: ringingBabyId,
            type: 'feeding',
            targetTime: result.targetTime,
            notificationId: result.notificationId,
            alertMode: 'alarm',
            soundName: ringingSound,
            isActive: true,
          });
          useFeedingStore.setState({ activeReminder: newReminder });
        }
      }
    } catch (e) {
      console.warn('[useAlarmRingingStore] Failed to schedule re-alert on silence:', e);
    }
  },

  dismissAlarm: async () => {
    const { ringingBabyId, alarmType, medicationId } = get();
    await alarmAudioService.stopAlarm();
    try {
      await notifee.stopForegroundService();
      const displayed = await notifee.getDisplayedNotifications();
      for (const item of displayed) {
        if (item.notification.id) {
          await notifee.cancelNotification(item.notification.id);
        }
      }
    } catch {
      // Ignored
    }

    set({
      isAlarmRinging: false,
    });

    if (alarmType === 'feeding' && ringingBabyId) {
      await useFeedingStore.getState().cancelActiveReminder(ringingBabyId);
    } else if (alarmType === 'medication' && medicationId) {
      const { useMedicationStore } = require('./useMedicationStore');
      await useMedicationStore.getState().postponeReminder(medicationId, 60 * 24);
    }
  },

  snoozeAlarm: async (minutes = 15) => {
    const { ringingBabyId, ringingBabyName, alarmType, medicationId } = get();
    await alarmAudioService.stopAlarm();
    try {
      await notifee.stopForegroundService();
      const displayed = await notifee.getDisplayedNotifications();
      for (const item of displayed) {
        if (item.notification.id) {
          await notifee.cancelNotification(item.notification.id);
        }
      }
    } catch {
      // Ignored
    }

    set({
      isAlarmRinging: false,
    });

    if (alarmType === 'medication' && medicationId) {
      const { useMedicationStore } = require('./useMedicationStore');
      await useMedicationStore.getState().postponeReminder(medicationId, minutes);
    } else if (ringingBabyId && ringingBabyName) {
      await useFeedingStore.getState().postponeActiveReminder(ringingBabyId, ringingBabyName, minutes);
    }
  },

  takeMedicationDose: async () => {
    const { medicationId } = get();
    await alarmAudioService.stopAlarm();
    try {
      await notifee.stopForegroundService();
      const displayed = await notifee.getDisplayedNotifications();
      for (const item of displayed) {
        if (item.notification.id) {
          await notifee.cancelNotification(item.notification.id);
        }
      }
    } catch {
      // Ignored
    }

    set({
      isAlarmRinging: false,
    });

    if (medicationId) {
      const { useMedicationStore } = require('./useMedicationStore');
      await useMedicationStore.getState().logDose(medicationId);
    }
  },
}));


