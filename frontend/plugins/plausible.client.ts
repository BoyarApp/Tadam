/**
 * Plausible Analytics Plugin
 * Loads Plausible script for privacy-focused analytics
 */

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  // Skip if not configured
  if (!config.public.plausibleDomain || !config.public.plausibleScriptUrl) {
    if (import.meta.dev) {
      console.info('[Plausible] Analytics not configured, skipping...');
    }
    return;
  }

  // Load Plausible script
  if (process.client) {
    const script = document.createElement('script');
    script.defer = true;
    script.setAttribute('data-domain', config.public.plausibleDomain);
    script.src = config.public.plausibleScriptUrl;

    // Handle script load
    script.onload = () => {
      if (import.meta.dev) {
        console.info('[Plausible] Analytics initialized for domain:', config.public.plausibleDomain);
      }
    };

    script.onerror = () => {
      console.warn('[Plausible] Failed to load analytics script');
    };

    document.head.appendChild(script);
  }
});
