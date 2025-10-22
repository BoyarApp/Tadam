import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import type { Core } from '@strapi/strapi';

export const STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ['draft', 'review'],
  review: ['draft', 'review', 'approved'],
  approved: ['review', 'approved', 'published'],
  published: ['published', 'review'],
};

const getRequestUser = (strapi: Core.Strapi) =>
  strapi.requestContext.get()?.state?.user ?? null;

export const sanitizeSnapshot = (article: any) => {
  if (!article) return null;

  const fields = [
    'id',
    'title',
    'slug',
    'summary',
    'content',
    'status',
    'is_national',
    'is_international',
    'is_featured',
    'tags',
    'published_at',
    'updatedAt',
    'createdAt',
  ];

  return fields.reduce((acc, key) => {
    if (typeof article[key] !== 'undefined') {
      acc[key] = article[key];
    }

    return acc;
  }, {} as Record<string, unknown>);
};

export default factories.createCoreService('api::article.article', ({ strapi }) => ({
  async create(params) {
    const data = params.data ?? {};
    data.status = data.status ?? 'draft';

    if (data.status !== 'draft') {
      throw new errors.ValidationError('New articles must start in draft status.');
    }

    params.data = data;

    const created = await super.create(params);
    await this.createVersion(created.id, 'draft', sanitizeSnapshot(created));
    return created;
  },

  async update(params) {
    const articleId = params.where?.id;
    if (!articleId) {
      return super.update(params);
    }

    const existing = await super.findOne(articleId, {});
    if (!existing) {
      throw new errors.NotFoundError('Article not found.');
    }

    const currentStatus = existing.status ?? 'draft';
    const nextStatus = params.data?.status ?? currentStatus;

    if (!STATUS_TRANSITIONS[currentStatus]?.includes(nextStatus)) {
      throw new errors.ValidationError(
        `Invalid status transition from "${currentStatus}" to "${nextStatus}".`,
      );
    }

    params.data = {
      ...params.data,
      status: nextStatus,
    };

    if (nextStatus === 'published' && !params.data.published_at_override) {
      params.data.published_at = new Date();
    }

    const updated = await super.update(params);
    const changeType =
      nextStatus === 'published'
        ? 'publish'
        : nextStatus === 'review'
          ? 'review'
          : 'other';

    await this.createVersion(updated.id, changeType, sanitizeSnapshot(updated));
    return updated;
  },

  async createVersion(
    articleId: number,
    changeType: 'draft' | 'review' | 'publish' | 'rollback' | 'other',
    snapshot: Record<string, unknown> | null,
  ) {
    const user = getRequestUser(strapi);

    const results = (await strapi.entityService.findMany(
      'api::article-version.article-version',
      {
        filters: { article: { id: articleId } },
        sort: { version_number: 'desc' },
        limit: 1,
        populate: [],
      },
    )) as any[];

    const [latest] = results;

    const nextVersionNumber = (latest?.version_number ?? 0) + 1;

    await strapi.entityService.create('api::article-version.article-version', {
      data: {
        article: articleId,
        change_type: changeType,
        version_number: nextVersionNumber,
        snapshot: snapshot as any,
        changed_by: user?.id,
      },
    });
  },
}));
