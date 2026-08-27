import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkTheme, lightTheme, type ThemeColors } from '../theme/colors';

const THEME_STORAGE_KEY = '@baby_tracker_theme_mode';

export type ThemeMode = 'dark' | 'light';

interface ThemeState {
  themeMode: ThemeMode;
  colors: ThemeColors;
  isLoading: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  loadSavedTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  themeMode: 'dark', // Default theme is Dark as per requirements
  colors: darkTheme,
  isLoading: true,

  setThemeMode: async (mode: ThemeMode) => {
    const colors = mode === 'dark' ? darkTheme : lightTheme;
    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    set({ themeMode: mode, colors });
  },

  toggleTheme: async () => {
    const nextMode = get().themeMode === 'dark' ? 'light' : 'dark';
    await get().setThemeMode(nextMode);
  },

  loadSavedTheme: async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') {
        const colors = saved === 'dark' ? darkTheme : lightTheme;
        set({ themeMode: saved, colors, isLoading: false });
      } else {
        set({ themeMode: 'dark', colors: darkTheme, isLoading: false });
      }
    } catch {
      set({ themeMode: 'dark', colors: darkTheme, isLoading: false });
    }
  },
}));
