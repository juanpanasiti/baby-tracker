import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ALARM_SOUNDS = [
  { id: 'default', labelKey: 'settings.soundDefault', isSystem: true },
  { id: 'digital', labelKey: 'settings.soundDigital', file: 'alarm_digital.wav' },
  { id: 'chime', labelKey: 'settings.soundChime', file: 'alarm_chime.wav' },
  { id: 'bells', labelKey: 'settings.soundBells', file: 'alarm_bells.wav' },
  { id: 'gentle', labelKey: 'settings.soundGentle', file: 'alarm_gentle.wav' },
] as const;

export type AlarmSoundId = (typeof ALARM_SOUNDS)[number]['id'];

const ALARM_SOUND_STORAGE_KEY = '@baby_tracker_alarm_sound';
const SMART_NIGHT_MODE_KEY = '@baby_tracker_smart_night_mode';

interface PreferencesState {
  alarmSound: AlarmSoundId;
  smartNightMode: boolean;
  isLoaded: boolean;

  setAlarmSound: (sound: AlarmSoundId) => Promise<void>;
  setSmartNightMode: (enabled: boolean) => Promise<void>;
  loadPreferences: () => Promise<void>;
  isNightTime: (timestamp?: number) => boolean;
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  alarmSound: 'default',
  smartNightMode: false,
  isLoaded: false,

  setAlarmSound: async (sound: AlarmSoundId) => {
    await AsyncStorage.setItem(ALARM_SOUND_STORAGE_KEY, sound);
    set({ alarmSound: sound });
  },

  setSmartNightMode: async (enabled: boolean) => {
    await AsyncStorage.setItem(SMART_NIGHT_MODE_KEY, JSON.stringify(enabled));
    set({ smartNightMode: enabled });
  },

  loadPreferences: async () => {
    try {
      const [savedSound, savedNightMode] = await Promise.all([
        AsyncStorage.getItem(ALARM_SOUND_STORAGE_KEY),
        AsyncStorage.getItem(SMART_NIGHT_MODE_KEY),
      ]);

      set({
        alarmSound: (savedSound as AlarmSoundId) || 'default',
        smartNightMode: savedNightMode !== null ? JSON.parse(savedNightMode) : false,
        isLoaded: true,
      });
    } catch {
      set({ isLoaded: true });
    }
  },

  isNightTime: (timestamp = Date.now()) => {
    const hour = new Date(timestamp).getHours();
    // Night is defined from 22:00 (10 PM) to 07:00 (7 AM)
    return hour >= 22 || hour < 7;
  },
}));
