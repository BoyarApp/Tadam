/**
 * Sentry Error Monitoring Plugin
 * Captures and reports errors with context
 */

import * as Sentry from '@sentry/vue';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const router = useRouter();

  // Skip if not configured
  if (!config.public.sentryDsn) {
    if (import.meta.dev) {
      console.info('[Sentry] Error monitoring not configured, skipping...');
    }
    return;
  }

  // Initialize Sentry
  Sentry.init({
    app: nuxtApp.vueApp,
    dsn: config.public.sentryDsn,
    environment: import.meta.dev ? 'development' : 'production',
    integrations: [
      Sentry.browserTracingIntegration({ router }),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],

    // Performance monitoring
    tracesSampleRate: parseFloat(config.public.sentryTracesSampleRate) || 0.1,

    // Session replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

    // Ignore common non-critical errors
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      /Loading chunk \d+ failed/,
    ],

    // Add context to all events
    beforeSend (event) {
      // Add user context if available
      const sessionStore = useSessionStore();
      if (sessionStore.user) {
        event.user = {
          id: String(sessionStore.user.id),
          email: sessionStore.user.email,
        };
      }

      // Add preferences context
      const preferencesStore = usePreferencesStore();
      event.contexts = {
        ...event.contexts,
        preferences: {
          districts: preferencesStore.selectedDistricts,
          categories: preferencesStore.selectedCategories,
          theme: preferencesStore.theme,
        },
      };

      return event;
    },
  });

  // Add global error handler
  nuxtApp.vueApp.config.errorHandler = (error, context) => {
    Sentry.captureException(error, {
      contexts: {
        vue: {
          componentName: context?.$options?.name || 'Unknown',
        },
      },
    });

    // Log to console in dev
    if (import.meta.dev) {
      console.error('[Sentry] Error captured:', error, context);
    }
  };

  // Provide Sentry instance
  return {
    provide: {
      sentry: Sentry,
    },
  };
});
