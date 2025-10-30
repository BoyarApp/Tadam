import { Platform, Linking, Alert } from 'react-native';
import Share from 'react-native-share';
import Clipboard from '@react-native-clipboard/clipboard';
import { t } from '@i18n';

// Share article
export const shareArticle = async (title: string, url: string): Promise<void> => {
  try {
    await Share.open({
      title: t('article.shareArticle'),
      message: `${title}\n\n${url}`,
      url,
    });
  } catch (error: any) {
    if (error.message !== 'User did not share') {
      console.error('Error sharing:', error);
    }
  }
};

// Copy to clipboard
export const copyToClipboard = (text: string): void => {
  Clipboard.setString(text);
  // Show toast/snackbar (implement toast service)
  Alert.alert(t('common.success'), t('article.copied'));
};

// Open URL in browser
export const openURL = async (url: string): Promise<void> => {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert(t('errors.error'), t('errors.invalidUrl'));
    }
  } catch (error) {
    console.error('Error opening URL:', error);
    Alert.alert(t('errors.error'), t('errors.somethingWentWrong'));
  }
};

// Open app settings
export const openAppSettings = (): void => {
  Linking.openSettings();
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Get platform-specific value
export const getPlatformValue = <T>(ios: T, android: T): T => {
  return Platform.OS === 'ios' ? ios : android;
};

// Check if device is tablet
export const isTablet = (): boolean => {
  // This is a simple check, can be enhanced
  return Platform.isPad || (Platform.isTV && Platform.OS === 'android');
};

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Chunk array
export const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// Remove duplicates from array
export const uniqueArray = <T>(array: T[], key?: keyof T): T[] => {
  if (!key) {
    return [...new Set(array)];
  }

  const seen = new Set();
  return array.filter((item) => {
    const k = item[key];
    if (seen.has(k)) {
      return false;
    }
    seen.add(k);
    return true;
  });
};

// Sleep/delay
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Retry with exponential backoff
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await sleep(initialDelay * Math.pow(2, i));
      }
    }
  }

  throw lastError;
};

// Safe JSON parse
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
};
