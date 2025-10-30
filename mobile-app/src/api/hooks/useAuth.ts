import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@constants';
import * as authAPI from '../endpoints/auth';
import { setAuthToken, clearAuthToken } from '../client';
import { useAuthStore } from '@store/auth.store';
import type {
  LoginCredentials,
  PhoneAuthRequest,
  OTPVerifyRequest,
  SocialAuthRequest,
} from '@types';

// Get current user
export const useMe = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: QUERY_KEYS.USER,
    queryFn: authAPI.getMe,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Login with email/password
export const useLogin = () => {
  const queryClient = useQueryClient();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authAPI.login(credentials),
    onSuccess: async (data) => {
      await setAuthToken(data.jwt);
      setAuth(data.user, data.jwt);
      queryClient.setQueryData(QUERY_KEYS.USER, data.user);
    },
  });
};

// Send OTP
export const useSendOTP = () => {
  return useMutation({
    mutationFn: (data: PhoneAuthRequest) => authAPI.sendOTP(data),
  });
};

// Verify OTP
export const useVerifyOTP = () => {
  const queryClient = useQueryClient();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: OTPVerifyRequest) => authAPI.verifyOTP(data),
    onSuccess: async (data) => {
      await setAuthToken(data.jwt);
      setAuth(data.user, data.jwt);
      queryClient.setQueryData(QUERY_KEYS.USER, data.user);
    },
  });
};

// Social auth (Google, Apple, Truecaller)
export const useSocialAuth = () => {
  const queryClient = useQueryClient();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: SocialAuthRequest) => authAPI.socialAuth(data),
    onSuccess: async (data) => {
      await setAuthToken(data.jwt);
      setAuth(data.user, data.jwt);
      queryClient.setQueryData(QUERY_KEYS.USER, data.user);
    },
  });
};

// Logout
export const useLogout = () => {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      await clearAuthToken();
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
  });
};

// Register FCM token
export const useRegisterFCMToken = () => {
  return useMutation({
    mutationFn: authAPI.registerFCMToken,
  });
};
