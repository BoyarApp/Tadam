# Editorial Workbench Prototype (Sprint P0.2)

The P0.2 sprint delivers the first-cut editorial tooling that keeps humans in control while giving them lightweight AI assists. This document summarises the capabilities shipped across Strapi and the Nuxt workbench page.

## Backend: `editorial-workbench` Plugin

### AI Assist Endpoints

| Route | Method | Description | Notes |
|-------|--------|-------------|-------|
| `/editorial-workbench/ai/translate` | `POST` | Calls the configured AI provider for Tamil↔English suggestions with fallback heuristics. | Accepts `{ text, language, targetLanguage, articleId?, submissionId?, metadata? }`. |
| `/editorial-workbench/ai/spellcheck` | `POST` | Invokes provider spell/grammar checks and falls back to local spacing/ellipsis heuristics. | Returns structured suggestions with offsets and reasons. |
| `/editorial-workbench/ai/entity-suggest` | `POST` | Uses provider NER suggestions when available, otherwise emits heuristic tokens. | Includes per-entity confidence and metadata. |
| `/editorial-workbench/quality/evaluate` | `POST` | Sends copy to the compliance provider for toxicity/plagiarism heuristics with local fallback. | Response includes `summary`, `metrics`, `flags`, `metadata`, and `evaluatedAt`. |

All assist responses are logged to `api::ai-assist-log.ai-assist-log` with:

- `operation_type` (`translate`, `spell_check`, `entity_tag`)
- Input/output text snapshots
- Confidence score + metadata (languages, suggestion counts)
- Optional article/submission linkage
- Editor id (from request context)

Failures are swallowed to avoid blocking the UI; warnings are pushed to Strapi logs.

### Provider Configuration

Set the following environment variables (or `.env`) to point the plugin at real services:

- `EDITORIAL_AI_BASE_URL` / `EDITORIAL_AI_API_KEY` / `EDITORIAL_AI_TIMEOUT_MS`
- `EDITORIAL_COMPLIANCE_BASE_URL` / `EDITORIAL_COMPLIANCE_API_KEY` / `EDITORIAL_COMPLIANCE_TIMEOUT_MS`

If a provider is unreachable or unset, the service falls back to the heuristic implementations and emits a warning.

### Workflow Helpers

`api::article.article` gained a `transitionWorkflow` service helper that:

- Validates article existence
- Appends transition metadata into `article.meta.workflow.history` (capped at 25 entries)
- Tracks `lastStatus`, `lastActionBy`, `lastActionRole`, `lastNote`, and arbitrary metadata payloads
- Optionally assigns or clears the `editor` field during transitions
- Re-uses the custom `update` logic so ArticleVersion snapshots continue to be generated

Four controller actions expose the workflow:

- `POST /api/articles/:id/submit` → Author-or-above can move draft → review
- `POST /api/articles/:id/approve` → Editors confirm review → approved
- `POST /api/articles/:id/publish` → Editors ship approved → published
- `POST /api/articles/:id/request-changes` → Editors send content back to draft (clears `editor`)

All routes enforce `global::ensure-authenticated` and role gating (`author` for submit, `editor` for the rest).

## Frontend: Nuxt Workbench Page

Route: `/editorial/workbench` (now wrapped in `editorial-auth` middleware; requires a valid Strapi session with `author`/`editor` role and redirects to `/login` when missing).

### Core Features

- **Rich Text Editor**: Vuetify textarea with AI assist actions (translate, spell check, entity suggestions). Translation results can replace the working draft; spellcheck suggestions auto-fix repeated spaces and ellipsis misuse.
- **Source Manager**: Manages repeatable label/URL pairs aligned with the `common.source-link` component.
- **Fact Box Builder**: Creates fact entries with optional per-fact source URLs mirroring the `article.fact-entry` component.
- **Media Manager**: Tracks hero image URL plus gallery/supporting assets (URL based stub until upload APIs land).
- **Entity Tagging**: Shows AI suggestions, allows manual tagging, and emits the selected entity list.
- **Quality Checks**: Server-driven evaluation (provider + fallback heuristics) for readability, toxicity, suspicious phrasing, and custom flags. Results refresh on content/language changes with optimistic loading states.
- **Workflow Panel**: Triggers the new CMS endpoints, bubbles up success/error alerts, and displays a reverse-chronological timeline built from `meta.workflow.history`.

### Assist Integration

`useEditorialAssist` composable centralises API calls (translate/spell/entity/quality), handles loading state, and normalises error messages. All requests include optional `articleId` and metadata payloads so the backend can relate assists to content.

## Testing

- Jest unit tests added for:
  - AI assist service logging + metadata coverage
  - Article workflow transition helper (meta merge / editor assignment)
  - Article controller role gating and payload wiring
- Vitest/ESLint should be run via `pnpm --filter frontend test:unit` / `pnpm --filter frontend lint` before shipping.

## Next Steps

- Extend provider integration with additional operations (rewrite, fact extraction) and structured metadata merging.
- Integrate plagiarism/compliance sub-flags into the workflow approval UI (highlight affected paragraphs, remediation playbooks).
- Wire media manager to Strapi upload endpoints + asset picker.
- Add session-aware toast feedback (e.g. when provider unavailable) and allow manual re-run of quality evaluation.
