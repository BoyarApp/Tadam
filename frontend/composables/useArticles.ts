import {
  type ArticlePayload,
  type ArticleListItem,
  type ArticleMedia,
  type ArticleSourceLink,
  type ArticleFactEntry,
} from '~/types/articles';
import { useApi, ApiException } from './useApi';

type Maybe<T> = T | null | undefined;

type StrapiMediaAttributes = {
  url?: string | null;
  alternativeText?: string | null;
  caption?: string | null;
};

type StrapiMedia = {
  id?: number;
  attributes?: StrapiMediaAttributes | null;
};

type StrapiRelation<T> = {
  id: number;
  attributes?: T | null;
};

type StrapiRelationCollection<T> = {
  data?: Array<StrapiRelation<T>> | null;
} | null;

type StrapiCategoryAttributes = {
  name?: string | null;
  slug?: string | null;
};

type StrapiDistrictAttributes = {
  name?: string | null;
  slug?: string | null;
};

type StrapiEntityAttributes = {
  name?: string | null;
  entity_type?: string | null;
  type?: string | null;
};

type StrapiArticleAttributes = {
  slug: string;
  title: string;
  summary?: string | null;
  content?: string | null;
  categories?: StrapiRelationCollection<StrapiCategoryAttributes>;
  districts?: StrapiRelationCollection<StrapiDistrictAttributes>;
  hero_image?: { data?: StrapiMedia | null } | null;
  gallery?: { data?: StrapiMedia[] | null } | null;
  entities?: StrapiRelationCollection<StrapiEntityAttributes>;
  fact_box?: Array<{
    id?: number;
    label?: string | null;
    value?: string | null;
    sources?: Array<{ label?: string | null; url?: string | null }> | null;
  }> | null;
  source_links?: Array<{ id?: number; label?: string | null; url?: string | null }> | null;
  explainers?: Array<Record<string, unknown>> | null;
  publishedAt?: string | null;
  published_at?: string | null;
  updatedAt?: string | null;
  meta?: {
    workflow?: {
      lastStatus?: string;
      lastActionAt?: string;
      lastActionBy?: number;
      lastActionRole?: string;
      lastNote?: string;
      lastMetadata?: Record<string, unknown>;
      history?: Array<{
        toStatus?: string;
        at?: string;
        actor?: number;
        actorRole?: string;
        note?: string;
        metadata?: Record<string, unknown>;
      }>;
    };
  } | null;
};

type StrapiArticle = {
  id: number;
  attributes?: StrapiArticleAttributes | null;
};

type StrapiCollectionResponse<T> = {
  data: T[];
};

const MEDIA_RELATIONS = [
  'hero_image',
  'gallery',
];

const ARTICLE_POPULATE_RELATIONS = [
  'categories',
  'districts',
  'hero_image',
  'gallery',
  'entities',
  'fact_box',
  'source_links',
];

const RELATED_ARTICLE_FIELDS: Record<string, string[]> = {
  categories: ['name', 'slug'],
  districts: ['name', 'slug'],
};

const toAbsoluteMediaUrl = (mediaUrl: Maybe<string>, mediaBase: string): string | null => {
  if (!mediaUrl) {
    return null;
  }

  if (/^https?:\/\//i.test(mediaUrl)) {
    return mediaUrl;
  }

  const base = mediaBase.replace(/\/$/, '');
  const path = mediaUrl.startsWith('/') ? mediaUrl : `/${mediaUrl}`;
  return `${base}${path}`;
};

const mapMedia = (media: Maybe<StrapiMedia>, mediaBase: string): ArticleMedia | null => {
  if (!media) {
    return null;
  }

  const attributes = media.attributes ?? null;
  const url = toAbsoluteMediaUrl(attributes?.url ?? null, mediaBase);

  if (!url) {
    return null;
  }

  return {
    id: media.id,
    url,
    alternativeText: attributes?.alternativeText ?? null,
    caption: attributes?.caption ?? null,
  };
};

const mapMediaCollection = (collection: Maybe<{ data?: Maybe<StrapiMedia[]> }>, mediaBase: string): ArticleMedia[] => {
  const items = collection?.data ?? [];
  return (items ?? [])
    .map(item => mapMedia(item ?? null, mediaBase))
    .filter((item): item is ArticleMedia => Boolean(item));
};

const mapSourceLink = (link: Maybe<{ id?: number; label?: string | null; url?: string | null }>): ArticleSourceLink | null => {
  if (!link?.label || !link.url) {
    return null;
  }

  return {
    id: link.id,
    label: link.label,
    url: link.url,
  };
};

const mapFactEntry = (entry: Maybe<{ id?: number; label?: string | null; value?: string | null; sources?: Maybe<ArticleSourceLink[]> }>): ArticleFactEntry | null => {
  if (!entry?.label || !entry.value) {
    return null;
  }

  const sources = Array.isArray(entry.sources)
    ? (entry.sources as Maybe<ArticleSourceLink>[])?.map(mapSourceLink).filter((item): item is ArticleSourceLink => Boolean(item))
    : [];

  return {
    id: entry.id,
    label: entry.label,
    value: entry.value,
    sources,
  };
};

const mapWorkflow = (attributes: Maybe<StrapiArticleAttributes>['meta']): ArticlePayload['workflow'] => {
  const workflow = attributes?.workflow ?? {};
  const historyEntries = Array.isArray(workflow?.history) ? workflow.history : [];

  return {
    lastStatus: workflow?.lastStatus,
    lastActionAt: workflow?.lastActionAt,
    lastActionBy: workflow?.lastActionBy,
    lastActionRole: workflow?.lastActionRole,
    lastNote: workflow?.lastNote,
    lastMetadata: workflow?.lastMetadata,
    history: historyEntries
      .filter((item): item is ArticlePayload['workflow']['history'][number] =>
        Boolean(item?.toStatus && item?.at),
      )
      .map(item => ({
        toStatus: String(item.toStatus),
        at: String(item.at),
        actor: item.actor,
        actorRole: item.actorRole,
        note: item.note,
        metadata: item.metadata,
      })),
  };
};

const mapCollection = <T extends Record<string, unknown>>(
  value: Maybe<StrapiRelationCollection<T>>,
) => {
  const records = value?.data ?? [];
  return (records ?? []).map(item => ({
    id: item?.id ?? 0,
    ...(item?.attributes ?? {}),
  }));
};

const mapArticleAttributes = (article: StrapiArticle, mediaBase: string): ArticlePayload => {
  const attributes = article.attributes ?? ({} as StrapiArticleAttributes);
  const categories = mapCollection(attributes.categories).map(category => ({
    id: category.id,
    name: String(category.name ?? ''),
    slug: (category as any).slug ?? null,
  }));

  const districts = mapCollection(attributes.districts).map(district => ({
    id: district.id,
    name: String(district.name ?? ''),
    slug: (district as any).slug ?? null,
  }));

  const entities = mapCollection(attributes.entities).map(entity => ({
    id: entity.id,
    name: String(entity.name ?? ''),
    type: (entity as any).entity_type ?? (entity as any).type ?? null,
  }));

  const heroImage = mapMedia(attributes.hero_image?.data ?? null, mediaBase);
  const gallery = mapMediaCollection(attributes.gallery, mediaBase);

  const factEntries = Array.isArray(attributes.fact_box)
    ? attributes.fact_box.map(mapFactEntry).filter((item): item is ArticleFactEntry => Boolean(item))
    : [];

  const sourceLinks = Array.isArray(attributes.source_links)
    ? attributes.source_links.map(mapSourceLink).filter((item): item is ArticleSourceLink => Boolean(item))
    : [];

  const explainers = Array.isArray(attributes.explainers)
    ? attributes.explainers
        .map((item, index) => {
          if (!item || typeof item !== 'object') {
            return null;
          }

          const title = 'title' in item ? (item.title as Maybe<string>) : null;
          const summary = 'summary' in item ? (item.summary as Maybe<string>) : null;
          const url = 'url' in item ? (item.url as Maybe<string>) : null;

          if (!title) {
            return null;
          }

          return {
            id: (item as any).id ?? index,
            title,
            summary: summary ?? undefined,
            url: url ?? undefined,
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
    : [];

  const publishedAt = attributes.publishedAt ?? attributes.published_at ?? null;

  return {
    id: article.id,
    slug: attributes.slug,
    title: attributes.title,
    summary: attributes.summary ?? '',
    content: attributes.content ?? '',
    categories,
    districts,
    heroImage,
    gallery,
    publishedAt,
    updatedAt: attributes.updatedAt ?? null,
    factEntries,
    sourceLinks,
    explainers,
    entities,
    workflow: mapWorkflow(attributes.meta ?? null),
    related: [],
  };
};

const mapArticleListItem = (article: StrapiArticle, mediaBase: string): ArticleListItem => {
  const attributes = article.attributes ?? ({} as StrapiArticleAttributes);
  const categories = mapCollection(attributes.categories).map(category => ({
    id: category.id,
    name: String(category.name ?? ''),
    slug: (category as any).slug ?? null,
  }));

  const districts = mapCollection(attributes.districts).map(district => ({
    id: district.id,
    name: String(district.name ?? ''),
    slug: (district as any).slug ?? null,
  }));

  const heroImage = mapMedia(attributes.hero_image?.data ?? null, mediaBase);

  return {
    id: article.id,
    slug: attributes.slug,
    title: attributes.title,
    summary: attributes.summary ?? '',
    categories,
    districts,
    publishedAt: attributes.publishedAt ?? attributes.published_at ?? null,
    heroImage,
  };
};

const buildPopulateParams = (relations: string[]): Record<string, string> => {
  return relations.reduce((acc, relation, index) => {
    acc[`populate[${index}]`] = relation;
    return acc;
  }, {} as Record<string, string>);
};

const buildFieldParams = (fields: Record<string, string[]>): Record<string, string> => {
  const params: Record<string, string> = {};

  Object.entries(fields).forEach(([relation, relationFields]) => {
    relationFields.forEach((field, fieldIndex) => {
      params[`populate[${relation}][fields][${fieldIndex}]`] = field;
    });
  });

  return params;
};

export const useArticles = () => {
  const { apiFetch } = useApi();
  const config = useRuntimeConfig();
  const mediaBase = config.public.imageCdn || config.public.apiBase || '';

  const buildArticleRequestParams = (slug: string) => ({
    ...buildPopulateParams(ARTICLE_POPULATE_RELATIONS),
    ...buildFieldParams(RELATED_ARTICLE_FIELDS),
    'filters[slug][$eq]': slug,
    publicationState: 'live',
  });

  /**
   * Fetch a single article by slug
   */
  const fetchArticle = async (slug: string): Promise<ArticlePayload> => {
    try {
      const response = await apiFetch<StrapiCollectionResponse<StrapiArticle>>('/api/articles', {
        params: buildArticleRequestParams(slug),
      });

      const [rawArticle] = response.data ?? [];

      if (!rawArticle) {
        throw new ApiException(`Article with slug "${slug}" was not found.`, 404);
      }

      const article = mapArticleAttributes(rawArticle, mediaBase);

      try {
        const relatedResponse = await apiFetch<StrapiCollectionResponse<StrapiArticle>>(
          '/api/articles/related',
          {
            params: {
              slug,
              limit: '6',
            },
          },
        );

        article.related = (relatedResponse.data ?? []).map(item => mapArticleListItem(item, mediaBase));
      } catch (relatedError) {
        console.warn(`Failed to load related articles for ${slug}:`, relatedError);
        article.related = [];
      }

      return article;
    } catch (error) {
      if (error instanceof ApiException) {
        console.warn(`Failed to fetch article ${slug}:`, error.message);
      }
      throw error;
    }
  };

  /**
   * Fetch articles list with filters
   */
  const fetchArticles = async (params?: {
    category?: string;
    district?: string;
    limit?: number;
  }): Promise<ArticleListItem[]> => {
    try {
      const queryParams: Record<string, string> = {
        ...buildPopulateParams(MEDIA_RELATIONS),
        ...buildFieldParams(RELATED_ARTICLE_FIELDS),
        publicationState: 'live',
        sort: 'publishedAt:desc',
      };

      if (params?.category) {
        queryParams['filters[categories][slug][$eq]'] = params.category;
      }

      if (params?.district) {
        queryParams['filters[districts][slug][$eq]'] = params.district;
      }

      if (params?.limit) {
        queryParams['pagination[pageSize]'] = String(params.limit);
      }

      const response = await apiFetch<StrapiCollectionResponse<StrapiArticle>>('/api/articles', {
        params: queryParams,
      });

      return (response.data ?? []).map(article => mapArticleListItem(article, mediaBase));
    } catch (error) {
      if (error instanceof ApiException) {
        console.warn('Failed to fetch articles:', error.message);
      }
      throw error;
    }
  };

  return {
    fetchArticle,
    fetchArticles,
  };
};

export const __test__ = {
  mapArticleAttributes,
  mapArticleListItem,
};
