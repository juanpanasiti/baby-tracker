import { create } from 'zustand';
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

  triggerAlarm: (params?: TriggerAlarmParams | string, babyName?: string, soundName?: string) => Promise<void>;
  silenceAlarm: () => Promise<void>;
  snoozeAlarm: (minutes?: number) => Promise<void>;
  takeMedicationDose: () => Promise<void>;
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

  triggerAlarm: async (params, babyName, soundName) => {
    let resolvedBabyId: string | undefined;
    let resolvedBabyName: string | undefined;
    let resolvedSound: string | undefined;
    let alarmType: 'feeding' | 'medication' = 'feeding';
    let medicationId: string | undefined;
    let medicationName: string | undefined;
    let dosage: string | undefined;

    if (typeof params === 'object' && params !== null) {
      resolvedBabyId = params.babyId;
      resolvedBabyName = params.babyName;
      resolvedSound = params.soundName;
      alarmType = params.alarmType || 'feeding';
      medicationId = params.medicationId;
      medicationName = params.medicationName;
      dosage = params.dosage;
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
    });

    await alarmAudioService.startAlarm(finalSound);
  },

  silenceAlarm: async () => {
    await alarmAudioService.stopAlarm();
    set({
      isAlarmRinging: false,
    });
  },

  snoozeAlarm: async (minutes = 15) => {
    const { ringingBabyId, ringingBabyName, alarmType, medicationId } = get();
    await alarmAudioService.stopAlarm();
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
    set({
      isAlarmRinging: false,
    });

    if (medicationId) {
      const { useMedicationStore } = require('./useMedicationStore');
      await useMedicationStore.getState().logDose(medicationId);
    }
  },
}));

