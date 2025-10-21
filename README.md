# Tadam Platform

Tamil-first, mobile-optimised news network delivering trusted local, national, and international coverage with human-led editorial workflows and revenue via self-serve ads and memberships.

## Core Pillars

- **Lightning-fast reader UX**: Nuxt 3 PWA, offline cache tuned for low-end Android devices, Mukta Malar typography, multi-district personalisation with “outside bubble” injects.
- **Editorial control with AI assists**: Desk-curated stories enhanced by translation, spell-check, and entity tagging suggestions—never auto-publish.
- **Ad & membership revenue**: First-party ad server with Razorpay billing, ad-free supporter memberships enforced server-side.
- **Compliance and trust**: DPDP-ready consent logs, auditable AI suggestions, clear “Why you see this” explanations, structured data for SEO and LLM discoverability.

## Stack Overview

| Tier        | Technology                                                                               |
|-------------|-------------------------------------------------------------------------------------------|
| Frontend    | Nuxt 3 (Vue) + Vuetify 3 (Nuxt module), Tailwind utilities (PrimeFlex optional), Workbox, Plausible |
| Backend CMS | Strapi v5 with custom plugins for AI assists, ads, Razorpay, moderation                   |
| Data        | PostgreSQL, Redis (session/cache), Meilisearch (Tamil search), Cloudflare R2/S3 media     |
| Infra       | Docker Compose (local ≈ production), Vercel (Nuxt), Fly/Render (Strapi), Cloudflare edge |

Local development uses the same container stack as production to avoid environment drift.

## Repository Layout

```
README.md
AGENTS.md
docs/
  project-overview.md
frontend/            # Nuxt 3 + Vuetify app (to be scaffolded)
cms/                 # Strapi instance (to be scaffolded)
infra/
  docker-compose.yml # Single source of truth for services
  env/               # Sample environment files
```

> `frontend/`, `cms/`, and `infra/` stubs will be created in the corresponding sprints.

## Environment & Secrets

Copy the provided samples before running any service:

```bash
cp infra/env/.env.example infra/env/.env
cp frontend/.env.example frontend/.env
cp cms/.env.example cms/.env
```

Populate secrets:

- `NUXT_PUBLIC_API_URL`, `NUXT_PUBLIC_MEILISEARCH_URL`
- `STRAPI_ADMIN_JWT_SECRET`, `APP_KEYS`, `API_TOKEN_SALT`
- `DATABASE_URL` (Postgres), `REDIS_URL`, `MEILISEARCH_MASTER_KEY`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY`

Use separate credentials per environment. Never commit secrets.

## Local Development

1. **Install prerequisites**
   - Docker Desktop 24+
   - Node.js 22.x (matches production container runtime)
   - pnpm 9+ (preferred package manager)

2. **Install dependencies**

   ```bash
   pnpm install --frozen-lockfile
   ```

3. **Start the stack**

   ```bash
   docker compose -f infra/docker-compose.yml up --build
   ```

   Services:
   - `frontend`: Nuxt dev server (SSR/PWA)
   - `cms`: Strapi in watch mode
   - `db`: PostgreSQL 15
   - `cache`: Redis 7
   - `search`: Meilisearch 1.7+
   - `storage`: MinIO (S3-compatible) for media proxying

4. **Bootstrap Strapi**

   - Visit `http://localhost:1337/admin`, create the admin user.
   - Run provided seed scripts (to be added) for categories, districts, etc.

5. **Access the frontend**

   - `http://localhost:3000` serves the Nuxt PWA (via Docker or `pnpm --filter frontend dev`).
   - Service worker & offline cache run in dev via mock strategies; run `pnpm --filter frontend build && pnpm --filter frontend preview` for production behaviour.

6. **Testing**

   - Frontend: `pnpm --filter frontend lint`, `pnpm --filter frontend typecheck`, `pnpm --filter frontend test:unit`.
   - CMS: `pnpm --filter cms test` for plugin/unit tests; use `test:watch` for rapid feedback.
   - Integration tests (Playwright) run via `pnpm test:e2e` against the compose stack.

## Authentication Strategy

- Strapi `users-permissions` handles the canonical user store.
- OAuth providers:
  - Google Sign-In (Android/Play Store users)
  - Apple Sign-In (iOS/App Store users)
- Sessions via HTTP-only JWT cookies. Optional OTP flow can be layered later.
- Membership status (`active`, `grace`, `expired`, `cancelled`) stored on the user record, checked by `/ads/serve`.

## Deployment Parity

The Docker Compose stack mirrors production topology:

| Service   | Local Container             | Production Equivalent            |
|-----------|-----------------------------|----------------------------------|
| frontend  | Nuxt SSR container          | Vercel build output / Node SSR   |
| cms       | Strapi container            | Fly.io/Railway/Render            |
| db        | PostgreSQL 15 container     | Managed PostgreSQL (Supabase/RDS)|
| cache     | Redis 7 container           | Managed Redis (Upstash/Elasticache) |
| search    | Meilisearch container       | Managed Meilisearch/ElasticSearch |
| storage   | MinIO (S3 compatible)       | Cloudflare R2 / AWS S3           |

Docker compose profiles allow running subsets (e.g. `docker compose --profile frontend up`) but default behaviour starts everything for parity.

## Coding Conventions

- Vue single-file components with `<script setup>` and Typescript.
- Vuetify theming via `theme.ts`; prefer Vuetify components over raw HTML for consistency.
- Tailwind/PrimeFlex utility classes allowed for layout tweaks, avoid inline styles.
- Strapi plugins live under `cms/src/plugins`. Write unit tests for business logic, ensure controllers sanitise input. `editorial-workbench` houses AI assist endpoints and workflow helpers.
- Use feature flags and `.env` toggles; never hardcode secrets.

## Testing & Quality Gates

- **Unit tests**: required for new utilities, Strapi services, and Vue composables.
- **Integration tests**: cover critical flows (login, article publish, ad serve).
- **Performance checks**: run `pnpm lighthouse` script before release.
- **Accessibility**: pa11y/axe checks on key pages.

CI/CD (to be configured) will run lint, typecheck, unit, integration, and build steps before allowing PR merge.

## Documentation

- `AGENTS.md`: guidelines for AI coding assistants.
- `docs/project-overview.md`: high-level architecture, roadmap, and sprint breakdown.
- Additional specs (API contracts, data models, editorial workbench behaviour) will live under `docs/`.

## Support & Contacts

- Product & Editorial: <product@tadam.example>
- Engineering: <eng@tadam.example>
- Security disclosures: <security@tadam.example>

Please open issues or discussions in the repository for feature proposals or architecture changes before implementation.
### UI Framework Decision

- **Chosen**: Vuetify 3 with the official Nuxt module (`@vuetify/nuxt`). Provides enterprise-ready components (data tables, forms, dashboards) and proven accessibility.
- **Evaluated**: Nuxt UI was considered for its lighter footprint, but lacked the complex components needed for editorial and advertiser tooling; it would require significant custom work and risk inconsistent UX.
- Tailwind/PrimeFlex remain available for utility spacing tweaks, but Vuetify governs core component styling. Custom theming (fonts, color tokens) will be applied via Vuetify’s theme system.
