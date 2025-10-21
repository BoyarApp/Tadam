import type { Context } from 'koa';
import { sanitizeEntityInput } from '../utils/sanitize';

const MAX_TEXT_LENGTH = 5000;

const ensurePayload = (ctx: Context) => {
  const { text, language, targetLanguage } = ctx.request.body ?? {};

  if (typeof text !== 'string' || !text.trim()) {
    return ctx.badRequest('Text is required for AI assist operations.');
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return ctx.badRequest(`Text length exceeds ${MAX_TEXT_LENGTH} characters.`);
  }

  return { text, language, targetLanguage };
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
      });

    ctx.body = sanitizeEntityInput(result);
  },
});
