import { create } from 'zustand';
import { alarmAudioService } from '../services/alarmAudioService';
import { useFeedingStore } from './useFeedingStore';
import { useBabyStore } from './useBabyStore';
import { usePreferencesStore } from './usePreferencesStore';

interface AlarmRingingState {
  isAlarmRinging: boolean;
  ringingBabyId: string | null;
  ringingBabyName: string | null;
  ringingSound: string;
  ringingTimestamp: number;

  triggerAlarm: (babyId?: string, babyName?: string, soundName?: string) => Promise<void>;
  silenceAlarm: () => Promise<void>;
  snoozeAlarm: (minutes?: number) => Promise<void>;
}

export const useAlarmRingingStore = create<AlarmRingingState>((set, get) => ({
  isAlarmRinging: false,
  ringingBabyId: null,
  ringingBabyName: null,
  ringingSound: 'default',
  ringingTimestamp: 0,

  triggerAlarm: async (babyId, babyName, soundName) => {
    const currentBaby = useBabyStore.getState().baby;
    const resolvedBabyId = babyId || currentBaby?.id || 'default-baby';
    const resolvedBabyName = babyName || currentBaby?.name || 'Baby';
    const resolvedSound = soundName || usePreferencesStore.getState().alarmSound || 'default';

    set({
      isAlarmRinging: true,
      ringingBabyId: resolvedBabyId,
      ringingBabyName: resolvedBabyName,
      ringingSound: resolvedSound,
      ringingTimestamp: Date.now(),
    });

    await alarmAudioService.startAlarm(resolvedSound);
  },

  silenceAlarm: async () => {
    await alarmAudioService.stopAlarm();
    set({
      isAlarmRinging: false,
    });
  },

  snoozeAlarm: async (minutes = 15) => {
    const { ringingBabyId, ringingBabyName } = get();
    await alarmAudioService.stopAlarm();
    set({
      isAlarmRinging: false,
    });

    if (ringingBabyId && ringingBabyName) {
      await useFeedingStore.getState().postponeActiveReminder(ringingBabyId, ringingBabyName, minutes);
    }
  },
}));
