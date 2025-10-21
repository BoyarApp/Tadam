const DEFAULT_LIMIT = 6;

const normalizeArticle = (article: any, reason: string) => ({
  id: article.id?.toString(),
  title: article.title,
  summary: article.summary,
  slug: article.slug,
  category: article.categories?.[0]?.name ?? null,
  categories: article.categories?.map((c: any) => c.slug ?? c.name).filter(Boolean) ?? [],
  districts: article.districts?.map((d: any) => d.slug ?? d.name).filter(Boolean) ?? [],
  publishedAt: article.published_at ?? article.updatedAt ?? article.createdAt,
  reason,
});

const uniqueArticles = (items: any[], reason: string, seen: Set<string>) => {
  const result: any[] = [];
  for (const item of items) {
    const id = item.id?.toString();
    if (!id) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    result.push(normalizeArticle(item, reason));
  }
  return result;
};

const buildFiltersFromArray = (field: string, values: string[]) => {
  if (!values?.length) return undefined;
  return {
    [field]: {
      slug: {
        $in: values,
      },
    },
  };
};

export default ({ strapi }) => ({
  async find(ctx) {
    const categoriesParam = ctx.query.categories as string | undefined;
    const districtsParam = ctx.query.districts as string | undefined;

    const categories = categoriesParam
      ? categoriesParam.split(',').map((item) => item.trim()).filter(Boolean)
      : [];
    const districts = districtsParam
      ? districtsParam.split(',').map((item) => item.trim()).filter(Boolean)
      : [];

    const seen = new Set<string>();
    const populate = {
      categories: { fields: ['id', 'name', 'slug'] },
      districts: { fields: ['id', 'name', 'slug'] },
    };

    const [featured, trending] = await Promise.all([
      strapi.entityService.findMany('api::article.article', {
        filters: { is_featured: true, status: 'published' },
        sort: { published_at: 'desc' },
        populate,
        limit: 4,
      }),
      strapi.entityService.findMany('api::article.article', {
        filters: { status: 'published' },
        sort: { updated_at: 'desc' },
        populate,
        limit: DEFAULT_LIMIT,
      }),
    ]);

    const categoryFilter = buildFiltersFromArray('categories', categories);
    const districtFilter = buildFiltersFromArray('districts', districts);

    const preferenceFilters: any = { status: 'published' };
    if (categoryFilter && districtFilter) {
      preferenceFilters.$or = [categoryFilter, districtFilter];
    } else if (categoryFilter) {
      Object.assign(preferenceFilters, categoryFilter);
    } else if (districtFilter) {
      Object.assign(preferenceFilters, districtFilter);
    }

    const preferences = categoryFilter || districtFilter
      ? await strapi.entityService.findMany('api::article.article', {
          filters: preferenceFilters,
          sort: { published_at: 'desc' },
          populate,
          limit: DEFAULT_LIMIT,
        })
      : [];

    const outside = await strapi.entityService.findMany('api::article.article', {
      filters: {
        status: 'published',
        $or: [{ is_national: true }, { is_international: true }],
      },
      sort: { published_at: 'desc' },
      populate,
      limit: DEFAULT_LIMIT,
    });

    const sections: any[] = [
      {
        slot: 'alerts',
        title: 'Editor Picks',
        items: featured.length
          ? uniqueArticles(featured, 'Editor curated stories.', seen)
          : [],
      },
      {
        slot: 'hot',
        title: 'Trending in Tamil Nadu',
        items: uniqueArticles(trending, 'Trending across the state.', seen),
      },
    ];

    if (preferences.length) {
      sections.push({
        slot: 'my-mix',
        title: 'My Mix',
        items: uniqueArticles(preferences, 'Matches your selected districts & interests.', seen),
      });
    }

    sections.push({
      slot: 'outside',
      title: 'Beyond My District',
      items: uniqueArticles(outside, 'Broader national & international coverage.', seen),
    });

    ctx.body = {
      sections,
    };
  },
});
