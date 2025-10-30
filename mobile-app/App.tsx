import React, { useEffect } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from '@navigation';
import { theme } from '@theme';
import { initializeLanguage } from '@i18n';
import NotificationService from '@services/notification.service';
import AnalyticsService from '@services/analytics.service';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  useEffect(() => {
    // Initialize app
    const initializeApp = async () => {
      try {
        // Initialize language
        await initializeLanguage();

        // Initialize notifications
        await NotificationService.initialize();

        // Initialize analytics
        AnalyticsService.setEnabled(true);
        AnalyticsService.logEvent('app_open');
      } catch (error) {
        console.error('App initialization error:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <StatusBar
            barStyle="light-content"
            backgroundColor={theme.colors.background}
          />
          <RootNavigator />
        </NavigationContainer>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
};

export default App;
