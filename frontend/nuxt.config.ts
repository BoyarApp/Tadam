import vuetify from 'vite-plugin-vuetify';

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@vite-pwa/nuxt'],
  css: ['~/assets/styles/main.scss', '@mdi/font/css/materialdesignicons.min.css'],
  components: [{ path: '~/components', pathPrefix: false }],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_URL ?? 'http://localhost:1337',
      imageCdn: process.env.NUXT_PUBLIC_MEDIA_URL ?? '',
      searchBase: process.env.NUXT_PUBLIC_MEILISEARCH_URL ?? 'http://localhost:7700',
      plausibleDomain: process.env.NUXT_PUBLIC_PLAUSIBLE_DOMAIN ?? '',
      plausibleScriptUrl: process.env.NUXT_PUBLIC_PLAUSIBLE_SCRIPT_URL ?? '',
      sentryDsn: process.env.NUXT_PUBLIC_SENTRY_DSN ?? '',
      sentryTracesSampleRate: process.env.NUXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? '0.1',
    },
  },
  app: {
    head: {
      titleTemplate: '%s | Tadam',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=5' },
        { name: 'description', content: 'Tamil-first, hyperlocal news with district intelligence.' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      ],
    },
  },
  build: {
    transpile: ['vuetify'],
  },
  hooks: {
    'vite:extendConfig': (config) => {
      // @ts-ignore - Vuetify plugin types conflict with Vite versions
      config.plugins?.push(
        vuetify({
          autoImport: true,
        }),
      );
    },
  },
  vite: {
    ssr: {
      noExternal: ['vuetify'],
    },
  },
  tailwindcss: {
    cssPath: '~/assets/styles/main.scss',
    configPath: 'tailwind.config.ts',
    viewer: false,
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Tadam',
      short_name: 'Tadam',
      theme_color: '#C52233',
      background_color: '#0F172A',
      display: 'standalone',
      start_url: '/',
      lang: 'ta-IN',
      icons: [
        {
          src: '/pwa-icon.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,webp,woff2}'],
      runtimeCaching: [
        {
          urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            networkTimeoutSeconds: 5,
            expiration: { maxEntries: 60, maxAgeSeconds: 60 * 15 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          urlPattern: ({ request }) => request.destination === 'image',
          handler: 'CacheFirst',
          options: {
            cacheName: 'image-cache',
            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          urlPattern: ({ request }) => request.destination === 'document',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'document-cache',
            networkTimeoutSeconds: 3,
            expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
          },
        },
        {
          urlPattern: ({ request }) =>
            request.destination === 'font' || request.url.includes('fontsource'),
          handler: 'CacheFirst',
          options: {
            cacheName: 'font-cache',
            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
          },
        },
      ],
    },
  },
});
