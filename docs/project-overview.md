# Tadam Project Overview

## Vision at a Glance

Deliver a Tamil-first news platform that is fast on low-end phones, builds trust through transparent personalisation, and monetises via self-serve ads and supporter memberships. Editorial control stays human-led with AI as an assistive layer.

## Architecture Summary

| Layer        | Components                                                                                     |
|--------------|------------------------------------------------------------------------------------------------|
| Frontend     | Nuxt 3 SSR/PWA, Vuetify 3 (Nuxt module), Tailwind utilities, Workbox, Plausible analytics    |
| Backend CMS  | Strapi v5, custom plugins (AI assists, ad decisioning, PhonePe integration, moderation)        |
| Data         | PostgreSQL (primary store), Redis (session/cache/rate limit), Meilisearch (Tamil search)       |
| Media        | Cloudflare R2/S3 (production), MinIO (local parity), image CDN for optimisation                |
| Auth         | Strapi users-permissions with Google & Apple OAuth providers, optional email/password fallback |
| Payments     | PhonePe for memberships and advertiser billing (Razorpay optional), ledger-backed accounting   |
| Infra        | Docker Compose (dev/prod parity), Vercel (frontend), Fly/Render (Strapi), Cloudflare edge      |

## Domain Models (Key Collections)

- **User**: profile, districts (≤3), interests, membership status (`active/grace/expired/cancelled`), roles (reader → admin), OAuth identifiers.
- **Article**: title, summary, content, media, districts, categories, entities, status (draft/review/published), fact box, sources.
- **Entity**: type (person/place/org/film/event), Tamil/English names, aliases, wiki link, districts.
- **AIAssist**: operation, input, output suggestion, confidence score, editor decision.
- **ArticleVersion**: snapshot for audit/rollback.
- **AdCampaign / AdCreative**: targeting, pacing, pricing, creative variants.
- **PaymentsLedger**: double-entry records for advertiser/member transactions.
- **Consent**: personalisation/analytics/marketing preferences with timestamps.
- **Festival / GovtScheme**: structured data for special sections and targeting.

## Platform Capabilities

- Nuxt PWA with offline cache, LQIP images, service worker retries, Mukta Malar typography.
- Personalised feeds (alerts, hot, My Mix, outside bubble) with “Why you see this”.
- Editorial desk: manual curation with AI suggestions (translate, spell-check, entity tagging, style rewrite, fact extract).
  - Workbench prototype includes fact box/source managers, media tracker, quality heuristics, and workflow controls tied to Strapi endpoints.
- Ad server: `/ads/serve` with targeting, pacing, frequency caps, blocker resilience.
- PhonePe integration: memberships + advertiser billing, ledger reconciliation, GST invoices (Razorpay optional later).
- Analytics & monitoring: Plausible page analytics, Sentry error tracking, custom event hooks.
- Feed API: `/feed` aggregates editor picks, trending stories, preference-matched articles, and national/international coverage.
- Account API: `/account(profile|ledger|membership/cancel)` exposes membership status, expiry, supporter ledger, and a refund workflow tied to PhonePe.
- Membership reminders: daily Strapi cron nudges supporters whose passes expire within 3 days and logs lifecycle events.
- Redis caching on feed responses (anonymous mixes TTL configurable) with personalised bypass.
- Search: Meilisearch tuned for Tamil (ICU, transliteration, synonyms).
- SEO/LLM readiness: structured data, News/Discover sitemaps, optional RSS/Atom.
- UI stack: Vuetify 3 selected over Nuxt UI for its enterprise component coverage (data tables, form wizardry, admin dashboards) and Nuxt module support; Nuxt UI remains a future option for lightweight micro-sites if needed.

## Roadmap & Tasks

### Phase 0 (Weeks 1–3) – Launchable PWA

**Sprint P0.1 – Core Backend Setup**
- Scaffold Strapi project (`cms/`), configure Docker Compose services (Postgres, Redis, Meilisearch, MinIO).
- Implement core models and relations (User, Article, Category, District, Entity, Consent, PaymentsLedger, ArticleVersion, AIAssist, Festival, GovtScheme).
- Add seeds for Tamil Nadu districts, categories, glossary entries.
- Configure JWT/auth secrets, rate limiting, admin panel customisation.

**Sprint P0.2 – Editorial Desk Prototype**
- Scaffolded `cms/src/plugins/editorial-workbench` with translate/spellcheck/entity endpoints logging to `ai-assist-log` and pluggable AI providers (fallback heuristics when unset).
- Added `/editorial-workbench/quality/evaluate` compliance endpoint plus article workflow actions (`submit`, `approve`, `publish`, `request-changes`) with role gating, history capture, and version snapshots.
- Built Nuxt workbench page featuring rich-text editor, AI assists, source/fact box managers, media tracker, entity tagging UI, a provider-backed quality panel, and workflow timeline.
- Wrapped `/editorial/workbench` in session/role middleware and surfaced a login hand-off page for Strapi authentication.

**Sprint P0.3 – Nuxt Shell & Personalisation Basics** ✅ Complete
- ✅ Scaffolded Nuxt 3 + Vuetify app with theming (light/dark), Mukta Malar fonts, and responsive layout
- ✅ Implemented home feed with Alerts/Hot/My Mix/Outside bubble sections with real-time feed composable
- ✅ Built article detail page with share controls (native share, WhatsApp, Twitter, copy link)
- ✅ Created district picker overlay (3-district limit), category rail component, AppShell with header/bottom nav
- ✅ Configured service worker with PWA offline cache strategies (API, images, documents, fonts)
- ✅ Implemented API service layer (`useApi`, `useArticles`) with proper error handling and mock fallbacks
- ✅ Added proper navigation throughout the app with Vue Router integration

**Sprint P0.4 – Payments & Analytics** ✅ Complete
- ✅ PhonePe membership flow integrated (checkout UI with analytics tracking)
- ✅ Payment status polling and verification on success/failure pages
- ✅ Membership status transitions implemented (active/grace/expired/cancelled)
- ✅ Ledger audit logs and payment history display
- ✅ Plausible analytics client-side tracking with useAnalytics composable
- ✅ Sentry error monitoring with context enrichment (user, preferences)
- ✅ Ad gating logic wired to membership status with expiry checks
- ✅ Membership expiry notifications via AppShell supporter banner
- ✅ Analytics tracking throughout: membership events, ad impressions, page views
- ✅ Docker Compose stack configured with all services (Postgres, Redis, Meilisearch, MinIO, CMS, Frontend)

**Exit Criteria**
- ✅ Editors can create, review, and publish articles using AI assist suggestions (P0.2)
- ✅ Editorial roles seeded (reader/contributor/author/editor) and enforced in workflow (P0.2)
- ✅ Readers can browse Nuxt PWA with personalisation and offline support (P0.3)
- ✅ Membership flow complete with analytics; ad gating enforces supporter status (P0.4)

### Phase 1 (Weeks 4–7) – Monetisation & Personalisation

**Sprint P1.1 – Ad Server MVP**
- Build `/ads/serve` endpoint with targeting (district/category/device/festival), pacing, frequency caps (salted fingerprint), membership-aware enforcement.
- Implement PaymentsLedger-backed budget handling, PhonePe webhook reconciliation, GST invoice storage.
- Log impressions/clicks via Redis streams -> Postgres batches.

**Sprint P1.2 – Advertiser & Reporting UI**
- Create advertiser dashboard (campaign CRUD, creative upload, budget controls).
- Expose basic reporting (impressions, clicks, blocked-slot rate) with CSV export.
- Add admin tools for creative approval and brand safety rules.

**Sprint P1.3 – Meilisearch & “Why This”**
- Configure Meilisearch for Tamil tokenisation, synonyms, transliteration.
- Implement personalised feed API returning explanation metadata per card.
- Nightly index health checks and trending query analytics.

**Sprint P1.4 – Editorial QA Enhancements**
- Integrate plagiarism checker, compliance checklist, entity disambiguation workflow.
- Manage terminology glossary (political titles, scheme names) for translation overrides.
- Add basic contributor metric dashboard (views, shares).

**Exit Criteria**
- Self-serve ads live with reporting and billing.
- Personalised feeds powered by real data, with “Why you see this”.
- Editorial checks robust enough for production launch in target districts.

### Phase 2 (Weeks 8–14) – Growth & Resilience

**Sprint P2.1 – Ad Resilience & Optimisation**
- Implement blocker detection, skeleton sponsor cards, shadow DOM fallback only on detection.
- Add creative A/B testing (ε-greedy), blocked-slot analytics dashboard.
- Harden payload signing, replay prevention, contr-aversion logging.

**Sprint P2.2 – Engagement Channels**
- Build editor-triggered push/email/WhatsApp digest tooling with templated sections.
- Enhance contributor metrics (leaderboard-lite, payout formula transparency), schedule payouts once thresholds met.
- Add retention experiments (notify for follow-up updates, saved articles).

**Sprint P2.3 – Mobile Wrapper Feasibility**
- Prototype Capacitor/React Native wrapper consuming existing APIs.
- Evaluate performance, offline behaviour, authentication flows; produce go/no-go doc for native app launch.

**Sprint P2.4 – Moderation & Structured Hubs**
- Implement sensitive content flags, election-mode toggles, escalation workflows.
- Build festival and government scheme hubs with structured schema markup and integration into targeting.
- Use Cloudflare Worker (or equivalent) to inject breaking alerts into cached feeds.

**Exit Criteria**
- Ads resilient to blockers; optimisation loops (A/B) functioning.
- Engagement channels active; contributor incentives transparent.
- Moderation workflows compliant with regional regulations; structured hubs live.

## Success Metrics

- **Performance**: p95 TTFB < 500 ms (India), p95 LCP < 2.5 s, `/ads/serve` median < 120 ms.
- **Engagement**: Day-7 retention ≥ 25 %, average session ≥ 3 minutes, 60 % of readers with at least one district selected.
- **Revenue**: Ad fill rate ≥ 70 %, average RPM ≥ ₹15, membership churn < 5 % monthly.
- **Editorial**: Article production time < 15 minutes with AI assist; plagiarism incidents = 0; entity tagging accuracy ≥ 90 %.
- **Operational**: Docker Compose up-to-date, tests passing in CI, incidents resolved within SLO.

## Documentation Index

- `README.md` – quick start, local environment, stack summary.
- `AGENTS.md` – coding agent rules and workflows.
- `docs/project-overview.md` – this file.
- Planned additions:
  - `docs/data-models.md`
  - `docs/api-contracts.md`
  - `docs/ai-assist-guide.md`
  - `docs/ad-server-spec.md`
  - `docs/security-compliance.md`

Keep documentation current with every PR. Outdated docs are considered defects.
