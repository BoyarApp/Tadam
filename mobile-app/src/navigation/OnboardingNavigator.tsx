import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@types';
import {
  LocationPermissionScreen,
  DistrictSelectionScreen,
  CategorySelectionScreen,
  NotificationPermissionScreen,
} from '@screens/onboarding';
import { theme } from '@theme';
import { t } from '@i18n';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="LocationPermission"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.textPrimary,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen
        name="LocationPermission"
        component={LocationPermissionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DistrictSelection"
        component={DistrictSelectionScreen}
        options={{ title: t('onboarding.selectDistricts') }}
      />
      <Stack.Screen
        name="CategorySelection"
        component={CategorySelectionScreen}
        options={{ title: t('onboarding.selectCategories') }}
      />
      <Stack.Screen
        name="NotificationPermission"
        component={NotificationPermissionScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
