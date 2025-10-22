import { factories } from '@strapi/strapi';

const ROLE_RANK: Record<string, number> = {
  reader: 0,
  contributor: 1,
  author: 2,
  editor: 3,
  admin: 4,
};

const parseArticleId = (value: unknown) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const extractNote = (value: unknown) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

const extractMetadata = (value: unknown) => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return { ...(value as Record<string, unknown>) };
  }

  return {};
};

const getRoleRank = (user: any) => {
  const roleType = user?.role?.type ?? '';
  return ROLE_RANK[roleType] ?? -1;
};

const getRequestBody = (ctx: any) =>
  ((ctx?.request as Record<string, unknown>)?.['body'] ?? {}) as Record<string, unknown>;

export default factories.createCoreController('api::article.article', ({ strapi }) => ({
  async submitForReview(ctx) {
    const user = ctx.state?.user;
    if (!user) {
      return ctx.forbidden('Authentication required.');
    }

    const articleId = parseArticleId(ctx.params?.id);
    if (!articleId) {
      return ctx.badRequest('A valid article id is required.');
    }

    if (getRoleRank(user) < ROLE_RANK.author) {
      return ctx.forbidden('You are not permitted to submit articles for review.');
    }

    const body = getRequestBody(ctx);
    const note = extractNote(body.note);
    const metadata = {
      action: 'submit_for_review',
      ...extractMetadata(body.metadata),
    };

    const updatedArticle = await strapi
      .service('api::article.article')
      .transitionWorkflow(articleId, 'review', {
        actor: user,
        note,
        metadata,
        assignEditor: true,
      });

    const sanitized = await this.sanitizeOutput(updatedArticle, ctx);
    return this.transformResponse(sanitized);
  },

  async approve(ctx) {
    const user = ctx.state?.user;
    if (!user) {
      return ctx.forbidden('Authentication required.');
    }

    if (getRoleRank(user) < ROLE_RANK.editor) {
      return ctx.forbidden('Only editors can approve articles.');
    }

    const articleId = parseArticleId(ctx.params?.id);
    if (!articleId) {
      return ctx.badRequest('A valid article id is required.');
    }

    const body = getRequestBody(ctx);
    const note = extractNote(body.note);
    const metadata = {
      action: 'approve',
      ...extractMetadata(body.metadata),
    };

    const updatedArticle = await strapi
      .service('api::article.article')
      .transitionWorkflow(articleId, 'approved', {
        actor: user,
        note,
        metadata,
        assignEditor: true,
      });

    const sanitized = await this.sanitizeOutput(updatedArticle, ctx);
    return this.transformResponse(sanitized);
  },

  async publish(ctx) {
    const user = ctx.state?.user;
    if (!user) {
      return ctx.forbidden('Authentication required.');
    }

    if (getRoleRank(user) < ROLE_RANK.editor) {
      return ctx.forbidden('Only editors can publish articles.');
    }

    const articleId = parseArticleId(ctx.params?.id);
    if (!articleId) {
      return ctx.badRequest('A valid article id is required.');
    }

    const body = getRequestBody(ctx);
    const note = extractNote(body.note);
    const metadata = {
      action: 'publish',
      ...extractMetadata(body.metadata),
    };

    const updatedArticle = await strapi
      .service('api::article.article')
      .transitionWorkflow(articleId, 'published', {
        actor: user,
        note,
        metadata,
        assignEditor: true,
      });

    const sanitized = await this.sanitizeOutput(updatedArticle, ctx);
    return this.transformResponse(sanitized);
  },

  async requestChanges(ctx) {
    const user = ctx.state?.user;
    if (!user) {
      return ctx.forbidden('Authentication required.');
    }

    if (getRoleRank(user) < ROLE_RANK.editor) {
      return ctx.forbidden('Only editors can request changes.');
    }

    const articleId = parseArticleId(ctx.params?.id);
    if (!articleId) {
      return ctx.badRequest('A valid article id is required.');
    }

    const body = getRequestBody(ctx);
    const note = extractNote(body.note);
    const metadata = {
      action: 'request_changes',
      ...extractMetadata(body.metadata),
    };

    const updatedArticle = await strapi
      .service('api::article.article')
      .transitionWorkflow(articleId, 'draft', {
        actor: user,
        note,
        metadata,
        clearEditor: true,
      });

    const sanitized = await this.sanitizeOutput(updatedArticle, ctx);
    return this.transformResponse(sanitized);
  },
}));
