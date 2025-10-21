import vuetify from 'vite-plugin-vuetify';

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@vite-pwa/nuxt'],
  css: ['@/assets/styles/main.scss', '@mdi/font/css/materialdesignicons.min.css'],
  components: [{ path: '~/components', pathPrefix: false }],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_URL ?? 'http://localhost:1337',
      imageCdn: process.env.NUXT_PUBLIC_MEDIA_URL ?? '',
      searchBase: process.env.NUXT_PUBLIC_MEILISEARCH_URL ?? 'http://localhost:7700',
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
    cssPath: false,
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
          urlPattern: ({ url }) => url.origin.includes('localhost'),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: { maxEntries: 60, maxAgeSeconds: 60 * 15 },
          },
        },
        {
          urlPattern: ({ request }) => request.destination === 'image',
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'image-cache',
            expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 7 },
          },
        },
      ],
    },
  },
});
