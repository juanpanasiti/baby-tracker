import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

const LOCALE_STORAGE_KEY = '@baby_tracker_locale';

export type LanguageCode = 'en' | 'es';

interface LocaleState {
  language: LanguageCode;
  isLoading: boolean;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  loadSavedLanguage: () => Promise<void>;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  language: 'en',
  isLoading: true,

  setLanguage: async (lang: LanguageCode) => {
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem(LOCALE_STORAGE_KEY, lang);
    set({ language: lang });
  },

  loadSavedLanguage: async () => {
    try {
      const saved = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
      if (saved === 'en' || saved === 'es') {
        await i18n.changeLanguage(saved);
        set({ language: saved, isLoading: false });
      } else {
        await i18n.changeLanguage('en');
        set({ language: 'en', isLoading: false });
      }
    } catch {
      set({ language: 'en', isLoading: false });
    }
  },
}));
