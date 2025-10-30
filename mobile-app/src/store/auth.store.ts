import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@constants';
import { clearAuthToken, setAuthToken as setToken } from '@api/client';
import type { User } from '@types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;

  // Actions
  setAuth: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: true,

  // Set authentication
  setAuth: async (user: User, token: string) => {
    try {
      await setToken(token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      set({ user, token, isAuthenticated: true });
    } catch (error) {
      console.error('Error setting auth:', error);
    }
  },

  // Logout
  logout: async () => {
    try {
      await clearAuthToken();
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      set({ user: null, token: null, isAuthenticated: false });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  },

  // Update user data
  updateUser: async (userData: Partial<User>) => {
    const { user } = get();
    if (!user) return;

    const updatedUser = { ...user, ...userData };
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      set({ user: updatedUser });
    } catch (error) {
      console.error('Error updating user:', error);
    }
  },

  // Hydrate from storage
  hydrate: async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const userDataString = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);

      if (token && userDataString) {
        const user = JSON.parse(userDataString);
        set({ token, user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error hydrating auth:', error);
      set({ isLoading: false });
    }
  },
}));
