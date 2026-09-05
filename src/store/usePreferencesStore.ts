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

export const ALARM_NAGGING_INTERVALS = [2, 5, 10, 15] as const;
export type AlarmNaggingInterval = (typeof ALARM_NAGGING_INTERVALS)[number];

export const ALARM_NAGGING_MAX_REPEATS = [null, 3, 5, 10] as const;
export type AlarmNaggingMaxRepeats = (typeof ALARM_NAGGING_MAX_REPEATS)[number];

const ALARM_SOUND_STORAGE_KEY = '@baby_tracker_alarm_sound';
const SMART_NIGHT_MODE_KEY = '@baby_tracker_smart_night_mode';
const ALARM_NAGGING_ENABLED_KEY = '@baby_tracker_alarm_nagging_enabled';
const ALARM_NAGGING_INTERVAL_KEY = '@baby_tracker_alarm_nagging_interval';
const ALARM_NAGGING_MAX_REPEATS_KEY = '@baby_tracker_alarm_nagging_max_repeats';
const SHOW_GROWTH_IN_PROFILE_KEY = '@baby_tracker_show_growth_in_profile';
const SHOW_GROWTH_GAIN_KEY = '@baby_tracker_show_growth_gain';

interface PreferencesState {
  alarmSound: AlarmSoundId;
  smartNightMode: boolean;
  alarmNaggingEnabled: boolean;
  alarmNaggingInterval: AlarmNaggingInterval;
  alarmNaggingMaxRepeats: AlarmNaggingMaxRepeats;
  showGrowthInProfile: boolean;
  showGrowthGain: boolean;
  isLoaded: boolean;

  setAlarmSound: (sound: AlarmSoundId) => Promise<void>;
  setSmartNightMode: (enabled: boolean) => Promise<void>;
  setAlarmNaggingEnabled: (enabled: boolean) => Promise<void>;
  setAlarmNaggingInterval: (interval: AlarmNaggingInterval) => Promise<void>;
  setAlarmNaggingMaxRepeats: (maxRepeats: AlarmNaggingMaxRepeats) => Promise<void>;
  setShowGrowthInProfile: (enabled: boolean) => Promise<void>;
  setShowGrowthGain: (enabled: boolean) => Promise<void>;
  loadPreferences: () => Promise<void>;
  isNightTime: (timestamp?: number) => boolean;
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  alarmSound: 'default',
  smartNightMode: false,
  alarmNaggingEnabled: true,
  alarmNaggingInterval: 5,
  alarmNaggingMaxRepeats: null,
  showGrowthInProfile: true,
  showGrowthGain: true,
  isLoaded: false,

  setAlarmSound: async (sound: AlarmSoundId) => {
    await AsyncStorage.setItem(ALARM_SOUND_STORAGE_KEY, sound);
    set({ alarmSound: sound });
  },

  setSmartNightMode: async (enabled: boolean) => {
    await AsyncStorage.setItem(SMART_NIGHT_MODE_KEY, JSON.stringify(enabled));
    set({ smartNightMode: enabled });
  },

  setAlarmNaggingEnabled: async (enabled: boolean) => {
    await AsyncStorage.setItem(ALARM_NAGGING_ENABLED_KEY, JSON.stringify(enabled));
    set({ alarmNaggingEnabled: enabled });
  },

  setAlarmNaggingInterval: async (interval: AlarmNaggingInterval) => {
    await AsyncStorage.setItem(ALARM_NAGGING_INTERVAL_KEY, JSON.stringify(interval));
    set({ alarmNaggingInterval: interval });
  },

  setAlarmNaggingMaxRepeats: async (maxRepeats: AlarmNaggingMaxRepeats) => {
    await AsyncStorage.setItem(ALARM_NAGGING_MAX_REPEATS_KEY, JSON.stringify(maxRepeats));
    set({ alarmNaggingMaxRepeats: maxRepeats });
  },

  setShowGrowthInProfile: async (enabled: boolean) => {
    await AsyncStorage.setItem(SHOW_GROWTH_IN_PROFILE_KEY, JSON.stringify(enabled));
    set({ showGrowthInProfile: enabled });
  },

  setShowGrowthGain: async (enabled: boolean) => {
    await AsyncStorage.setItem(SHOW_GROWTH_GAIN_KEY, JSON.stringify(enabled));
    set({ showGrowthGain: enabled });
  },

  loadPreferences: async () => {
    try {
      const [
        savedSound,
        savedNightMode,
        savedNaggingEnabled,
        savedNaggingInterval,
        savedNaggingMaxRepeats,
        savedShowGrowthInProfile,
        savedShowGrowthGain,
      ] = await Promise.all([
        AsyncStorage.getItem(ALARM_SOUND_STORAGE_KEY),
        AsyncStorage.getItem(SMART_NIGHT_MODE_KEY),
        AsyncStorage.getItem(ALARM_NAGGING_ENABLED_KEY),
        AsyncStorage.getItem(ALARM_NAGGING_INTERVAL_KEY),
        AsyncStorage.getItem(ALARM_NAGGING_MAX_REPEATS_KEY),
        AsyncStorage.getItem(SHOW_GROWTH_IN_PROFILE_KEY),
        AsyncStorage.getItem(SHOW_GROWTH_GAIN_KEY),
      ]);

      set({
        alarmSound: (savedSound as AlarmSoundId) || 'default',
        smartNightMode: savedNightMode !== null ? JSON.parse(savedNightMode) : false,
        alarmNaggingEnabled: savedNaggingEnabled !== null ? JSON.parse(savedNaggingEnabled) : true,
        alarmNaggingInterval:
          savedNaggingInterval !== null ? (JSON.parse(savedNaggingInterval) as AlarmNaggingInterval) : 5,
        alarmNaggingMaxRepeats:
          savedNaggingMaxRepeats !== null ? (JSON.parse(savedNaggingMaxRepeats) as AlarmNaggingMaxRepeats) : null,
        showGrowthInProfile:
          savedShowGrowthInProfile !== null ? JSON.parse(savedShowGrowthInProfile) : true,
        showGrowthGain:
          savedShowGrowthGain !== null ? JSON.parse(savedShowGrowthGain) : true,
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
