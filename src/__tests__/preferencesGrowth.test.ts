import { usePreferencesStore } from '../store/usePreferencesStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((key: string) => Promise.resolve(storage[key] ?? null)),
  setItem: jest.fn((key: string, value: string) => {
    storage[key] = value;
    return Promise.resolve();
  }),
  clear: jest.fn(() => {
    Object.keys(storage).forEach((k) => delete storage[k]);
    return Promise.resolve();
  }),
}));

describe('usePreferencesStore growth settings', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('defaults showGrowthInProfile and showGrowthGain to true', async () => {
    await usePreferencesStore.getState().loadPreferences();
    expect(usePreferencesStore.getState().showGrowthInProfile).toBe(true);
    expect(usePreferencesStore.getState().showGrowthGain).toBe(true);
  });

  it('persists and updates showGrowthInProfile toggle', async () => {
    await usePreferencesStore.getState().setShowGrowthInProfile(false);
    expect(usePreferencesStore.getState().showGrowthInProfile).toBe(false);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@baby_tracker_show_growth_in_profile',
      JSON.stringify(false)
    );

    // Re-load preferences to test restored value
    await usePreferencesStore.getState().loadPreferences();
    expect(usePreferencesStore.getState().showGrowthInProfile).toBe(false);
  });

  it('persists and updates showGrowthGain toggle', async () => {
    await usePreferencesStore.getState().setShowGrowthGain(false);
    expect(usePreferencesStore.getState().showGrowthGain).toBe(false);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@baby_tracker_show_growth_gain',
      JSON.stringify(false)
    );

    // Re-load preferences to test restored value
    await usePreferencesStore.getState().loadPreferences();
    expect(usePreferencesStore.getState().showGrowthGain).toBe(false);
  });
});
