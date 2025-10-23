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
- `pages/articles/[slug].vue` – SSR article route wired to Strapi by slug with graceful error states.
- `components/shell/*` – App shell (header, district switcher, bottom nav).
- `components/feed/*` – feed sections/cards.
- `components/article/*` – article layout primitives.
- `composables/useArticles.ts` – Strapi-backed article fetchers + payload mapper.
- `composables/useFeed.ts` – mocked feed API (replace with real API integration later).
- `stores/preferences.ts` – persisted district/category/theme state (max 3 districts).
- `assets/styles/main.scss` – Mukta Malar font imports, Tailwind directives, Vuetify base styles.

## Testing & Quality

- `pnpm typecheck` – Nuxt type generation safety.
- `pnpm lint` / `lint:fix` – ESLint with Nuxt TS config.
- `pnpm test:unit` – Vitest (UI mode via `pnpm test:ui`).
- `pnpm format` / `format:write` – Prettier formatting guard.

## Article detail contract

`useArticles.fetchArticle(slug)` resolves `ArticlePayload`, a normalised view of the Strapi schema used by `ArticleLayout.vue`:

```ts
type ArticlePayload = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content: string; // rich-text HTML sanitised at render time
  categories: Array<{ id: number; name: string; slug?: string | null }>;
  districts: Array<{ id: number; name: string; slug?: string | null }>;
  heroImage?: { url: string; alternativeText?: string | null; caption?: string | null } | null;
  gallery: Array<{ url: string; alternativeText?: string | null; caption?: string | null }>;
  publishedAt?: string | null;
  factEntries: Array<{ label: string; value: string; sources: Array<{ label: string; url: string }> }>;
  sourceLinks: Array<{ label: string; url: string }>;
  explainers: Array<{ title: string; summary?: string; url?: string }>;
  entities: Array<{ id: number; name: string; type?: string | null }>;
  workflow: {
    lastStatus?: string;
    lastActionAt?: string;
    history: Array<{ toStatus: string; at: string; actor?: number; actorRole?: string }>;
  };
  related: ArticleListItem[];
};
```

Images resolve through `NUXT_PUBLIC_MEDIA_URL`, so set it to Strapi/MinIO during local runs. Related stories are served via `GET /api/articles/related?slug=<slug>`, which finds recent published articles sharing categories/districts.
The related card shape is defined by `ArticleListItem` in `types/articles.ts`.

## Production Build

```bash
pnpm build
pnpm preview
```

Deploy to Vercel/Netlify or custom Node SSR. Ensure `NUXT_PUBLIC_*` variables are injected at runtime.
