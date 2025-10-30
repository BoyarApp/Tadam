import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppStackParamList, AppTabsParamList } from '@types';
import { HomeScreen, ArticleDetailScreen, ProfileScreen } from '@screens/app';
import {
  SubmitContentScreen,
  SubmitArticleScreen,
  SubmitAdScreen,
} from '@screens/submissions';
import { theme } from '@theme';
import { t } from '@i18n';

const Tab = createBottomTabNavigator<AppTabsParamList>();
const Stack = createNativeStackNavigator<AppStackParamList>();

// Tab Navigator (Home, Profile, etc.)
const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color }) => <span style={{ color }}>🏠</span>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color }) => <span style={{ color }}>👤</span>,
        }}
      />
    </Tab.Navigator>
  );
};

// Main App Stack Navigator
export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.textPrimary,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      {/* Tabs */}
      <Stack.Screen
        name="Tabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />

      {/* Article Detail */}
      <Stack.Screen
        name="ArticleDetail"
        component={ArticleDetailScreen}
        options={{ title: t('article.title') }}
      />

      {/* Submit Content */}
      <Stack.Screen
        name="SubmitContent"
        component={SubmitContentScreen}
        options={{ title: t('submit.title') }}
      />
      <Stack.Screen
        name="SubmitArticle"
        component={SubmitArticleScreen}
        options={{ title: t('submit.article') }}
      />
      <Stack.Screen
        name="SubmitAd"
        component={SubmitAdScreen}
        options={{ title: t('submit.ad') }}
      />

      {/* Other screens */}
      {/* TODO: Add Preferences, SubmissionsList, Settings, NotificationSettings, LanguageSettings */}
    </Stack.Navigator>
  );
};
