# Tadam Frontend (Nuxt 3 + Vuetify)

Nuxt 3 PWA shell with Vuetify 3, Tailwind utility classes, Pinia state, and Workbox caching. This app delivers the personalised feed, article experience, and offline support for the Tamil-first news platform.

## Quick Start

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm lint     # ESLint (Vue + TS)
pnpm test:unit
```

Make sure `pnpm install` is executed from the monorepo root so workspace dependencies resolve.

## Environment

Copy `.env.example` to `.env` and adjust for your stack:

```
NUXT_PUBLIC_API_URL=http://localhost:1337
NUXT_PUBLIC_MEILISEARCH_URL=http://localhost:7700
NUXT_PUBLIC_MEDIA_URL=http://localhost:9000/tadam-media
```

## Notable Modules

- `@nuxtjs/tailwindcss` for utility spacing, tuned with Mukta Malar font family.
- `vite-plugin-vuetify` + custom plugin (`plugins/vuetify.ts`) for theming, icons, and tree-shaken components.
- `@pinia/nuxt` houses persistent preference store (`stores/preferences.ts`).
- `@vite-pwa/nuxt` configures Workbox for API/image caching and offline fallback.
- `@vueuse/core` for network awareness (`useOnline`) and future reactive utilities.

## Project Structure

- `pages/index.vue` – personalised feed placeholders (alerts/hot/my mix/outside bubble).
- `pages/articles/[slug].vue` – article layout skeleton with fact box, related stories, Explain Briefly stub.
- `components/shell/*` – App shell (header, district switcher, bottom nav).
- `components/feed/*` – feed sections/cards.
- `components/article/*` – article layout primitives.
- `composables/useFeed.ts` – mocked feed API (replace with real API integration later).
- `stores/preferences.ts` – persisted district/category/theme state (max 3 districts).
- `app/assets/styles/main.scss` – Mukta Malar font imports, Tailwind directives, Vuetify base styles.

## Testing & Quality

- `pnpm typecheck` – Nuxt type generation safety.
- `pnpm lint` / `lint:fix` – ESLint with Nuxt TS config.
- `pnpm test:unit` – Vitest (UI mode via `pnpm test:ui`).
- `pnpm format` / `format:write` – Prettier formatting guard.

## Production Build

```bash
pnpm build
pnpm preview
```

Deploy to Vercel/Netlify or custom Node SSR. Ensure `NUXT_PUBLIC_*` variables are injected at runtime.
