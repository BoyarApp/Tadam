import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '@types';
import { AuthNavigator } from './AuthNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';
import { AppNavigator } from './AppNavigator';
import { useAuthStore } from '@store/auth.store';
import { usePreferencesStore } from '@store/preferences.store';
import { LoadingState } from '@components/common';
import { t } from '@i18n';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, hydrate } = useAuthStore();
  const { isOnboarded, isLoading: prefsLoading, hydrate: hydratePrefs } = usePreferencesStore();

  // Hydrate stores on mount
  useEffect(() => {
    hydrate();
    hydratePrefs();
  }, []);

  // Show loading while hydrating
  if (authLoading || prefsLoading) {
    return <LoadingState fullScreen text={t('common.loading')} />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Not authenticated - show auth flow
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : !isOnboarded ? (
        // Authenticated but not onboarded - show onboarding
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      ) : (
        // Authenticated and onboarded - show main app
        <Stack.Screen name="App" component={AppNavigator} />
      )}
    </Stack.Navigator>
  );
};
