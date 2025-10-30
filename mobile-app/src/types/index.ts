// User Types
export interface User {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  confirmed: boolean;
  blocked: boolean;
  role?: Role;
  profile?: UserProfile;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: number;
  fullName?: string;
  avatar?: Media;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  categories: string[];
  districts: string[];
  language: 'ta' | 'en';
  notificationsEnabled: boolean;
  categoryNotifications: Record<string, boolean>;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  type: 'reader' | 'contributor' | 'author' | 'editor' | 'admin';
}

// Article Types
export interface Article {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  featuredImage?: Media;
  images?: Media[];
  categories: Category[];
  districts: District[];
  author?: User;
  status: 'draft' | 'review' | 'approved' | 'published' | 'rejected';
  is_featured: boolean;
  is_breaking: boolean;
  published_at?: string;
  views?: number;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleListItem {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  featuredImage?: Media;
  category?: string;
  categories: string[];
  districts: string[];
  publishedAt: string;
  reason?: string;
}

// Category & District Types
export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  emoji?: string;
  description?: string;
  order?: number;
}

export interface District {
  id: number;
  name: string;
  slug: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

// Media Types
export interface Media {
  id: number;
  name: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: {
    thumbnail?: MediaFormat;
    small?: MediaFormat;
    medium?: MediaFormat;
    large?: MediaFormat;
  };
  url: string;
  previewUrl?: string;
  provider: string;
  mime: string;
  size: number;
}

export interface MediaFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  url: string;
}

// Feed Types
export interface FeedItem {
  id: string;
  title: string;
  summary?: string;
  slug: string;
  category?: string;
  categories: string[];
  districts: string[];
  publishedAt: string;
  reason: string;
  featuredImage?: Media;
}

export interface FeedFilters {
  categories?: string[];
  districts?: string[];
  limit?: number;
  offset?: number;
}

// Auth Types
export interface AuthResponse {
  jwt: string;
  user: User;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface PhoneAuthRequest {
  phone: string;
  countryCode: string;
}

export interface OTPVerifyRequest {
  phone: string;
  code: string;
  countryCode: string;
}

export interface SocialAuthRequest {
  provider: 'google' | 'apple' | 'truecaller';
  accessToken: string;
  idToken?: string;
}

// Submission Types
export interface Submission {
  id: number;
  title: string;
  content: string;
  category?: Category;
  district?: District;
  images?: Media[];
  status: 'pending' | 'approved' | 'rejected' | 'published';
  rejectionReason?: string;
  submittedBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleSubmission {
  title: string;
  content: string;
  summary?: string;
  categoryId: number;
  districtId: number;
  imageIds?: number[];
  source?: string;
}

// Ad Types
export interface AdCampaign {
  id: number;
  name: string;
  description?: string;
  creativeUrl?: string;
  targetUrl?: string;
  categories?: Category[];
  districts?: District[];
  status: 'pending' | 'active' | 'paused' | 'completed' | 'rejected';
  budget?: number;
  impressions?: number;
  clicks?: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdSubmission {
  name: string;
  description?: string;
  creativeUrl: string;
  targetUrl: string;
  categoryIds: number[];
  districtIds: number[];
  budget: number;
  startDate: string;
  endDate: string;
}

// Notification Types
export interface PushNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  imageUrl?: string;
  action?: string;
  category?: string;
  timestamp: number;
}

export interface FCMTokenRequest {
  token: string;
  platform: 'ios' | 'android';
  deviceId: string;
}

// Location Types
export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface GeocodeResult {
  district?: string;
  city?: string;
  state?: string;
  country?: string;
  formattedAddress?: string;
}

// API Response Types
export interface APIResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface APIError {
  status: number;
  name: string;
  message: string;
  details?: Record<string, any>;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  App: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  PhoneLogin: undefined;
  OTPVerify: { phone: string; countryCode: string };
};

export type OnboardingStackParamList = {
  LocationPermission: undefined;
  DistrictSelection: { autoDetected?: District };
  CategorySelection: { selectedDistricts: District[] };
  NotificationPermission: undefined;
};

export type AppTabsParamList = {
  Home: undefined;
  Search: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  ArticleDetail: { slug: string };
  SubmitContent: undefined;
  SubmitArticle: undefined;
  SubmitAd: undefined;
  Preferences: undefined;
  SubmissionsList: undefined;
  Settings: undefined;
  NotificationSettings: undefined;
  LanguageSettings: undefined;
};

// Component Props Types
export interface FeedCardProps {
  item: FeedItem;
  onPress: (slug: string) => void;
}

export interface CategoryChipProps {
  category: Category;
  selected?: boolean;
  onPress?: (category: Category) => void;
}

export interface DistrictCheckboxProps {
  district: District;
  selected?: boolean;
  onToggle?: (district: District) => void;
}

export interface ErrorStateProps {
  error?: Error | APIError;
  onRetry?: () => void;
  message?: string;
}

export interface EmptyStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  illustration?: React.ReactNode;
}

export interface LoadingStateProps {
  size?: 'small' | 'large';
  text?: string;
}

// Form Types
export interface LoginFormData {
  identifier: string;
  password: string;
}

export interface PhoneLoginFormData {
  phone: string;
}

export interface ArticleFormData {
  title: string;
  summary?: string;
  content: string;
  categoryId: number;
  districtId: number;
  source?: string;
  images?: string[];
}

export interface AdFormData {
  name: string;
  description?: string;
  targetUrl: string;
  categoryIds: number[];
  districtIds: number[];
  budget: number;
  startDate: Date;
  endDate: Date;
  creative?: string;
}

// Utility Types
export type Language = 'ta' | 'en';
export type ThemeMode = 'light' | 'dark';
export type AuthProvider = 'google' | 'apple' | 'truecaller' | 'phone';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'published';
export type ArticleStatus = 'draft' | 'review' | 'approved' | 'published' | 'rejected';
