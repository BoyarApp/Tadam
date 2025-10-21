import feedControllerFactory from '../../src/api/feed/controllers/feed';

const buildArticle = (id: number, overrides: Record<string, any> = {}) => ({
  id,
  title: `Article ${id}`,
  summary: 'Summary',
  slug: `article-${id}`,
  published_at: new Date().toISOString(),
  categories: [{ id: 1, name: 'Politics', slug: 'politics' }],
  districts: [{ id: 10, name: 'Chennai', slug: 'chennai' }],
  ...overrides,
});

describe('feed controller', () => {
  it('returns sections with unique articles', async () => {
    const featured = [buildArticle(1, { is_featured: true })];
    const trending = [buildArticle(2), buildArticle(1)];
    const myMix = [buildArticle(3)];
    const outside = [buildArticle(4, { is_national: true })];

    const findManyMock = jest
      .fn()
      .mockResolvedValueOnce(featured)
      .mockResolvedValueOnce(trending)
      .mockResolvedValueOnce(myMix)
      .mockResolvedValueOnce(outside);

    const ctx: any = { query: { categories: 'politics', districts: 'chennai' } };
    const controller = feedControllerFactory({
      strapi: {
        entityService: {
          findMany: findManyMock,
        },
      },
    } as any);

    await controller.find(ctx);

    expect(ctx.body.sections).toHaveLength(4);
    expect(ctx.body.sections[0].items).toHaveLength(1);
    expect(ctx.body.sections[1].items).toHaveLength(1); // article 2 only (article1 deduped)
    expect(ctx.body.sections[2].items[0].id).toBe('3');
    expect(ctx.body.sections[3].items[0].id).toBe('4');
  });
});
