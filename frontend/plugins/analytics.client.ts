import * as Sentry from '@sentry/vue';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig().public;

  if (process.client && config.plausibleDomain) {
    if (!document.querySelector('script[data-plausible]')) {
      const script = document.createElement('script');
      script.setAttribute('defer', '');
      script.setAttribute('data-domain', config.plausibleDomain);
      script.setAttribute('data-plausible', 'true');
      script.src = config.plausibleScriptUrl ?? 'https://plausible.io/js/script.js';
      document.head.appendChild(script);
    }
  }

  if (process.client && config.sentryDsn) {
    const { vueApp } = nuxtApp;
    Sentry.init({
      app: vueApp,
      dsn: config.sentryDsn,
      integrations: [],
      tracesSampleRate: Number(config.sentryTracesSampleRate ?? 0.1),
    });
  }
});
