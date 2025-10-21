# Tadam Platform

Tamil-first, mobile-optimised news network delivering trusted local, national, and international coverage with human-led editorial workflows and revenue via self-serve ads and memberships.

## Core Pillars

- **Lightning-fast reader UX**: Nuxt 3 PWA, offline cache tuned for low-end Android devices, Mukta Malar typography, multi-district personalisation with “outside bubble” injects.
- **Editorial control with AI assists**: Desk-curated stories enhanced by translation, spell-check, and entity tagging suggestions—never auto-publish.
- **Ad & membership revenue**: First-party ad server with PhonePe (initial) billing, ad-free supporter memberships enforced server-side.
- **Compliance and trust**: DPDP-ready consent logs, auditable AI suggestions, clear “Why you see this” explanations, structured data for SEO and LLM discoverability.

## Stack Overview

| Tier        | Technology                                                                               |
|-------------|-------------------------------------------------------------------------------------------|
| Frontend    | Nuxt 3 (Vue) + Vuetify 3 (Nuxt module), Tailwind utilities (PrimeFlex optional), Workbox, Plausible |
| Backend CMS | Strapi v5 with custom plugins for AI assists, ads, PhonePe billing, moderation            |
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
- PhonePe: `PHONEPE_MERCHANT_ID`, `PHONEPE_SALT_KEY`, `PHONEPE_SALT_INDEX`, `PHONEPE_BASE_URL`, `PHONEPE_REDIRECT_URL`, `PHONEPE_CALLBACK_URL`
- (Optional) Razorpay: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
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
   - If `.nuxt` has been cleaned, run `pnpm --filter frontend exec nuxt prepare` before executing Vitest.

### PhonePe Sandbox Setup

1. Obtain test credentials from the PhonePe developer portal (merchant ID, salt key, salt index). Use the provided sandbox account during development: `PHONEPE_MERCHANT_ID`, `PHONEPE_SALT_KEY`, `PHONEPE_SALT_INDEX`.
2. Configure environment variables in `cms/.env`:
   ```env
   PHONEPE_MERCHANT_ID=TEST-M23R1BQKNZR6J_25102
   PHONEPE_SALT_KEY=MzlkYjk5NDktOWRkNC00NWRmLWFlMWYtZmFkNWI2YTQyNzhh
   PHONEPE_SALT_INDEX=1
   PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/hermes
   PHONEPE_CALLBACK_URL=http://localhost:1337/api/phonepe/webhook
   PHONEPE_REDIRECT_URL=http://localhost:3000/account/membership/success
   ```
3. Restart the Strapi container after updating secrets: `docker compose up --build cms`.
4. Trigger a test order via `POST /api/phonepe/order` (authenticated request) and confirm that the ledger entry is created as `pending`.
5. Use the PhonePe staging dashboard or webhook replay to send a mocked completion payload; the webhook updates membership status and marks the ledger entry as `completed`.

### Analytics & Monitoring (optional)

1. Copy `frontend/.env.example` to `.env` and set:
   ```env
   NUXT_PUBLIC_PLAUSIBLE_DOMAIN=news.tadam.in
   NUXT_PUBLIC_PLAUSIBLE_SCRIPT_URL=https://plausible.io/js/script.js
   NUXT_PUBLIC_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
   NUXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.1
   ```
2. Plausible loads client-side via `plugins/analytics.client.ts`; verify page views appear in your Plausible dashboard after running `pnpm --filter frontend dev`.
3. Sentry initialises automatically when a DSN is present. Trigger a test error (`throw new Error('test')` in the console) to confirm ingestion.
4. Disable analytics locally by clearing the environment variables.

### Membership Flow (frontend)

1. Run the stack (`docker compose up`) and start the frontend (`pnpm --filter frontend dev`).
2. Sign in (or use an authenticated session) and visit `http://localhost:3000/account/membership`.
3. Click **Start secure payment**. The app calls `POST /api/phonepe/order`, stores the transaction ID locally, and redirects to the PhonePe sandbox page.
4. After completing or cancelling the payment, PhonePe redirects to `/account/membership/success`. Use **Refresh status** to hit `GET /api/phonepe/status/:merchantTransactionId` and confirm ledger + membership updates.

### Feed API

- `GET /feed?categories=politics,cinema&districts=chennai,madurai`
  - Returns an array of sections (`alerts`, `hot`, `my-mix`, `outside`) with deduplicated article cards.
  - When no parameters are provided, users see editor picks, trending stories, and national/international coverage.

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
