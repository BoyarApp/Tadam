# Guidance for Coding Agents

This document defines how automated contributors (Codex, ChatGPT, etc.) should work within the Tadam repository. Treat these rules as non-negotiable unless the product or engineering lead provides a written exception.

## Operating Principles

1. **Human editorial control first** – never remove guardrails that keep editors in charge of publishing or ads in compliance.
2. **Respect the roadmap** – work only on tasks explicitly scheduled for the current sprint unless instructed otherwise.
3. **Preserve parity** – changes must keep local Docker Compose flow aligned with production topology.
4. **Document as you go** – update relevant `docs/` entries or create new ones when behaviour or contracts change.
5. **Security & privacy** – enforce DPDP compliance, sanitise inputs, never log secrets, and avoid accessing external services without approval.

## Workflow

1. **Create a branch** using the naming convention `feature/<area>-<short-description>` or `fix/<area>-<issue-id>`.
2. **Sync with main** before starting: `git pull origin main`.
3. **Implement** following conventions (see below). If you need to adjust architecture or libraries, open a proposal in Issues first.
4. **Tests & lint** – run workspace-specific commands (`pnpm --filter frontend lint`, `pnpm --filter frontend test:unit`, `pnpm --filter cms test`, etc.).
5. **Update docs** if APIs/configs change.
6. **Commit** with conventional message (`feat:`, `fix:`, `chore:`, `docs:`).
7. **Open PR** with summary, testing evidence, migration notes, and security/privacy considerations.

## Coding Conventions

- **Frontend** (Nuxt + Vuetify)
  - Vue SFCs with `<script setup lang="ts">`.
  - Prefer Vuetify components; use utility classes for spacing/layout.
  - Composables go under `frontend/composables`.
  - Vuetify plugin lives in `frontend/plugins/vuetify.ts`; update theme tokens there.
  - Keep bundle budget in mind (<70KB JS on critical routes).

- **Backend** (Strapi)
  - Plugins live in `cms/src/plugins/<plugin-name>`.
  - Use Strapi query builder, avoid raw SQL unless necessary.
  - Enforce DTO validation and sanitisation on controllers/services.
  - Log AI assist outputs to `AIAssist`; never auto-publish changes.
  - Add unit tests for services via Jest (Strapi test helpers).

- **Infrastructure**
  - Edit `infra/docker-compose.yml` and related env files for any service changes.
  - Keep service names stable; coordinate with frontend/backend if ports change.

## Tooling & Dependencies

- Package manager: `pnpm` for both frontend and CMS.
- Testing: Vitest (frontend), Jest (Strapi), Playwright (E2E).
- Linting: ESLint + Prettier (respect configs), Stylelint for CSS if introduced.
- Commit hooks: Husky (run automatically).

## AI-Specific Responsibilities

- Assume **no network access** unless explicitly allowed.
- Provide reasoning in PR descriptions for non-trivial decisions.
- Highlight trade-offs, edge cases, and follow-up tasks.
- If you encounter conflicting instructions, escalate via issue before proceeding.
- Do not attempt to bypass security linting or tests; fix root causes.

## Sensitive Areas

- **Authentication & OAuth**: keep flows aligned with Strapi providers; do not modify session handling without review.
- **Payments & Ads**: respect ledger invariants, Razorpay webhooks, and `/ads/serve` business rules.
- **AI Assist Services**: suggestions must remain reversible and auditable.
- **Multi-language support**: use glossary overrides, avoid hardcoded translations.

## Definition of Done Checklist

- [ ] Feature implemented with tests.
- [ ] No lint/type errors.
- [ ] Docs updated (`docs/` or inline).
- [ ] Docker Compose services still start (`docker compose up`).
- [ ] No secrets leaked; env vars documented.
- [ ] PR template filled with testing evidence.

If anything blocks progress (missing dependencies, unclear requirements), create an issue tagged `needs-spec` and wait for clarification.
