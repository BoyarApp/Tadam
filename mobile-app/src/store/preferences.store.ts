import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, DEFAULT_PREFERENCES } from '@constants';
import { changeLanguage } from '@i18n';
import type { UserPreferences } from '@types';

interface PreferencesState extends UserPreferences {
  isOnboarded: boolean;

  // Actions
  setCategories: (categories: string[]) => Promise<void>;
  setDistricts: (districts: string[]) => Promise<void>;
  setLanguage: (language: 'ta' | 'en') => Promise<void>;
  toggleNotifications: (enabled: boolean) => Promise<void>;
  setCategoryNotification: (category: string, enabled: boolean) => Promise<void>;
  setQuietHours: (start?: string, end?: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  hydrate: () => Promise<void>;
  persist: () => Promise<void>;
  reset: () => Promise<void>;
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  ...DEFAULT_PREFERENCES,
  isOnboarded: false,

  // Set selected categories
  setCategories: async (categories: string[]) => {
    set({ categories });
    await get().persist();
  },

  // Set selected districts
  setDistricts: async (districts: string[]) => {
    set({ districts });
    await get().persist();
  },

  // Set language
  setLanguage: async (language: 'ta' | 'en') => {
    await changeLanguage(language);
    set({ language });
    await get().persist();
  },

  // Toggle all notifications
  toggleNotifications: async (enabled: boolean) => {
    set({ notificationsEnabled: enabled });
    await get().persist();
  },

  // Set per-category notification
  setCategoryNotification: async (category: string, enabled: boolean) => {
    const { categoryNotifications } = get();
    set({
      categoryNotifications: {
        ...categoryNotifications,
        [category]: enabled,
      },
    });
    await get().persist();
  },

  // Set quiet hours
  setQuietHours: async (start?: string, end?: string) => {
    set({
      quietHoursStart: start,
      quietHoursEnd: end,
    });
    await get().persist();
  },

  // Complete onboarding
  completeOnboarding: async () => {
    set({ isOnboarded: true });
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    await get().persist();
  },

  // Persist to storage
  persist: async () => {
    try {
      const state = get();
      const preferences: UserPreferences = {
        categories: state.categories,
        districts: state.districts,
        language: state.language,
        notificationsEnabled: state.notificationsEnabled,
        categoryNotifications: state.categoryNotifications,
        quietHoursStart: state.quietHoursStart,
        quietHoursEnd: state.quietHoursEnd,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error persisting preferences:', error);
    }
  },

  // Hydrate from storage
  hydrate: async () => {
    try {
      const [preferencesString, onboardingString] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PREFERENCES),
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED),
      ]);

      if (preferencesString) {
        const preferences = JSON.parse(preferencesString);
        set({ ...preferences });
      }

      if (onboardingString) {
        set({ isOnboarded: true });
      }
    } catch (error) {
      console.error('Error hydrating preferences:', error);
    }
  },

  // Reset to defaults
  reset: async () => {
    set({ ...DEFAULT_PREFERENCES, isOnboarded: false });
    await AsyncStorage.removeItem(STORAGE_KEYS.PREFERENCES);
    await AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
  },
}));
