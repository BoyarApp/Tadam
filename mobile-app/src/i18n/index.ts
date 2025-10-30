import { I18n } from 'i18n-js';
import { getLocales } from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, DEFAULT_LANGUAGE } from '@constants';

import ta from './ta.json';
import en from './en.json';

// Initialize i18n
const i18n = new I18n({
  ta,
  en,
});

// Set default language
i18n.defaultLocale = DEFAULT_LANGUAGE;
i18n.enableFallback = true;

// Get device locale
export const getDeviceLocale = (): string => {
  const locales = getLocales();
  const deviceLocale = locales[0]?.languageCode || 'en';

  // Map device locale to our supported languages
  if (deviceLocale.startsWith('ta')) {
    return 'ta';
  }
  return 'en';
};

// Initialize language from storage or device locale
export const initializeLanguage = async (): Promise<string> => {
  try {
    const storedLanguage = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
    if (storedLanguage) {
      i18n.locale = storedLanguage;
      return storedLanguage;
    }

    const deviceLocale = getDeviceLocale();
    i18n.locale = deviceLocale;
    return deviceLocale;
  } catch (error) {
    i18n.locale = DEFAULT_LANGUAGE;
    return DEFAULT_LANGUAGE;
  }
};

// Change language
export const changeLanguage = async (language: 'ta' | 'en'): Promise<void> => {
  i18n.locale = language;
  await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
};

// Get current language
export const getCurrentLanguage = (): 'ta' | 'en' => {
  return (i18n.locale as 'ta' | 'en') || DEFAULT_LANGUAGE;
};

// Translation function
export const t = (key: string, options?: Record<string, any>): string => {
  return i18n.t(key, options);
};

// Check if current language is Tamil
export const isTamil = (): boolean => {
  return getCurrentLanguage() === 'ta';
};

// Check if current language is English
export const isEnglish = (): boolean => {
  return getCurrentLanguage() === 'en';
};

export default i18n;
export { i18n };
