import type { Context } from 'koa';
import { sanitizeEntityInput } from '../utils/sanitize';

const MAX_TEXT_LENGTH = 5000;

interface RequestBody {
  text?: string;
  language?: string;
  targetLanguage?: string;
  articleId?: unknown;
  submissionId?: unknown;
  metadata?: unknown;
}

const ensurePayload = (ctx: Context) => {
  const {
    text,
    language,
    targetLanguage,
    articleId,
    submissionId,
    metadata,
  } = (ctx.request as any).body as RequestBody ?? {} as RequestBody;

  if (typeof text !== 'string' || !text.trim()) {
    return ctx.badRequest('Text is required for AI assist operations.');
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return ctx.badRequest(`Text length exceeds ${MAX_TEXT_LENGTH} characters.`);
  }

  const parseRelationId = (value: unknown) => {
    if (typeof value === 'number' && Number.isInteger(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = Number.parseInt(value, 10);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }

    return undefined;
  };

  return {
    text: text.trim(),
    language,
    targetLanguage,
    articleId: parseRelationId(articleId),
    submissionId: parseRelationId(submissionId),
    metadata:
      typeof metadata === 'object' && metadata !== null ? (metadata as Record<string, unknown>) : undefined,
  };
};

export default ({ strapi }) => ({
  async translate(ctx: Context) {
    const payload = ensurePayload(ctx);
    if (!payload) return;

    const result = await strapi
      .plugin('editorial-workbench')
      .service('ai-assist')
      .translate({
        text: payload.text,
        sourceLanguage: payload.language,
        targetLanguage: payload.targetLanguage,
        user: ctx.state.user,
        articleId: payload.articleId,
        submissionId: payload.submissionId,
        metadata: payload.metadata,
      });

    ctx.body = sanitizeEntityInput(result);
  },

  async spellcheck(ctx: Context) {
    const payload = ensurePayload(ctx);
    if (!payload) return;

    const result = await strapi
      .plugin('editorial-workbench')
      .service('ai-assist')
      .spellcheck({
        text: payload.text,
        language: payload.language,
        user: ctx.state.user,
        articleId: payload.articleId,
        submissionId: payload.submissionId,
        metadata: payload.metadata,
      });

    ctx.body = sanitizeEntityInput(result);
  },

  async entitySuggest(ctx: Context) {
    const payload = ensurePayload(ctx);
    if (!payload) return;

    const result = await strapi
      .plugin('editorial-workbench')
      .service('ai-assist')
      .entitySuggest({
        text: payload.text,
        language: payload.language,
        user: ctx.state.user,
        articleId: payload.articleId,
        submissionId: payload.submissionId,
        metadata: payload.metadata,
      });

    ctx.body = sanitizeEntityInput(result);
  },

  async quality(ctx: Context) {
    const payload = ensurePayload(ctx);
    if (!payload) return;

    const result = await strapi
      .plugin('editorial-workbench')
      .service('ai-assist')
      .evaluateQuality({
        text: payload.text,
        language: payload.language,
        articleId: payload.articleId,
        submissionId: payload.submissionId,
        metadata: payload.metadata,
      });

    ctx.body = sanitizeEntityInput(result);
  },
});
