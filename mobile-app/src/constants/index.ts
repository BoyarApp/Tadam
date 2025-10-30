export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:1337';
export const API_TIMEOUT = parseInt(process.env.API_TIMEOUT || '30000', 10);

export const APP_NAME = 'Tadam';
export const APP_VERSION = '1.0.0';

export const DEFAULT_LANGUAGE = 'ta';
export const SUPPORTED_LANGUAGES = ['ta', 'en'] as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@tadam:auth_token',
  USER_DATA: '@tadam:user_data',
  PREFERENCES: '@tadam:preferences',
  ONBOARDING_COMPLETED: '@tadam:onboarding_completed',
  LANGUAGE: '@tadam:language',
  FCM_TOKEN: '@tadam:fcm_token',
} as const;

export const QUERY_KEYS = {
  AUTH: ['auth'],
  USER: ['user'],
  FEED: 'feed',
  ARTICLE: 'article',
  CATEGORIES: ['categories'],
  DISTRICTS: ['districts'],
  SUBMISSIONS: ['submissions'],
  USER_PREFERENCES: ['user', 'preferences'],
  AD_CAMPAIGNS: ['ad-campaigns'],
} as const;

export const ROUTES = {
  // Auth Stack
  WELCOME: 'Welcome',
  LOGIN: 'Login',
  PHONE_LOGIN: 'PhoneLogin',
  OTP_VERIFY: 'OTPVerify',

  // Onboarding Stack
  LOCATION_PERMISSION: 'LocationPermission',
  DISTRICT_SELECTION: 'DistrictSelection',
  CATEGORY_SELECTION: 'CategorySelection',
  NOTIFICATION_PERMISSION: 'NotificationPermission',

  // App Tabs
  HOME: 'Home',
  SEARCH: 'Search',
  PROFILE: 'Profile',

  // Screens
  ARTICLE_DETAIL: 'ArticleDetail',
  SUBMIT_CONTENT: 'SubmitContent',
  SUBMIT_ARTICLE: 'SubmitArticle',
  SUBMIT_AD: 'SubmitAd',
  PREFERENCES: 'Preferences',
  SUBMISSIONS_LIST: 'SubmissionsList',
  SETTINGS: 'Settings',
  NOTIFICATION_SETTINGS: 'NotificationSettings',
  LANGUAGE_SETTINGS: 'LanguageSettings',
} as const;

export const AUTH_PROVIDERS = {
  GOOGLE: 'google',
  APPLE: 'apple',
  TRUECALLER: 'truecaller',
  PHONE: 'phone',
} as const;

export const ARTICLE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PUBLISHED: 'published',
} as const;

export const DEFAULT_PREFERENCES = {
  categories: [],
  districts: [],
  language: 'ta',
  notificationsEnabled: false,
  categoryNotifications: {},
};

export const PAGINATION = {
  FEED_PAGE_SIZE: 20,
  INFINITE_SCROLL_THRESHOLD: 0.5,
};

export const CACHE_TIMES = {
  FEED: 5 * 60 * 1000, // 5 minutes
  ARTICLE: 15 * 60 * 1000, // 15 minutes
  CATEGORIES: 24 * 60 * 60 * 1000, // 24 hours
  DISTRICTS: 24 * 60 * 60 * 1000, // 24 hours
  USER: 5 * 60 * 1000, // 5 minutes
};

export const LOCATION_PERMISSIONS = {
  GRANTED: 'granted',
  DENIED: 'denied',
  BLOCKED: 'blocked',
} as const;

export const IMAGE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGES: 5,
  QUALITY: 0.8,
  ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
};

export const NOTIFICATION_CHANNELS = {
  DEFAULT: 'default',
  ARTICLES: 'articles',
  ALERTS: 'alerts',
  SUBMISSIONS: 'submissions',
};

export const EXTERNAL_LINKS = {
  PRIVACY_POLICY: 'https://yourdomain.com/privacy',
  TERMS_OF_SERVICE: 'https://yourdomain.com/terms',
  SUPPORT_EMAIL: 'support@yourdomain.com',
  HELP_CENTER: 'https://yourdomain.com/help',
};
