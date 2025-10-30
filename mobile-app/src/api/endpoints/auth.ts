import { post, get } from '../client';
import type {
  AuthResponse,
  LoginCredentials,
  PhoneAuthRequest,
  OTPVerifyRequest,
  SocialAuthRequest,
  User,
  FCMTokenRequest,
} from '@types';

// Register new user
export const register = async (data: {
  username: string;
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  return post<AuthResponse>('/api/auth/local/register', data);
};

// Login with email/password
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  return post<AuthResponse>('/api/auth/local', credentials);
};

// Send OTP to phone number
export const sendOTP = async (data: PhoneAuthRequest): Promise<{ success: boolean }> => {
  return post('/api/auth/send-otp', data);
};

// Verify OTP
export const verifyOTP = async (data: OTPVerifyRequest): Promise<AuthResponse> => {
  return post<AuthResponse>('/api/auth/verify-otp', data);
};

// Social auth (Google, Apple, Truecaller)
export const socialAuth = async (data: SocialAuthRequest): Promise<AuthResponse> => {
  const { provider, accessToken, idToken } = data;
  return post<AuthResponse>(`/api/auth/${provider}/callback`, {
    access_token: accessToken,
    id_token: idToken,
  });
};

// Get current user
export const getMe = async (): Promise<User> => {
  return get<User>('/api/users/me');
};

// Update user profile
export const updateProfile = async (userId: number, data: any): Promise<User> => {
  return post<User>(`/api/users/${userId}`, data);
};

// Register FCM token for push notifications
export const registerFCMToken = async (data: FCMTokenRequest): Promise<{ success: boolean }> => {
  return post('/api/account/fcm-token', data);
};

// Logout (client-side only, clear token)
export const logout = async (): Promise<void> => {
  // No API call needed, just clear local storage
  // This is handled by auth store
};
