import type { ArticlePayload } from '~/components/article/ArticleLayout.vue';
import { useApi, ApiException } from './useApi';

export type ArticleListItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  districts: string[];
  publishedAt: string;
  heroImage?: string;
};

export const useArticles = () => {
  const { apiFetch } = useApi();

  /**
   * Fetch a single article by slug
   */
  const fetchArticle = async (slug: string): Promise<ArticlePayload> => {
    try {
      const response = await apiFetch<{ data: any }>(`/api/articles/${slug}`);
      const article = response.data;

      return {
        title: article.title,
        summary: article.summary,
        category: article.category?.name ?? 'Uncategorized',
        content: article.content?.split('\n\n') ?? [],
        heroImage: article.heroImage?.url,
        publishedAt: article.publishedAt,
        districts: article.districts?.map((d: any) => d.name) ?? [],
        facts: article.facts ?? [],
        sources: article.sources ?? [],
        related: article.related ?? [],
      };
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
      const response = await apiFetch<{ data: any[] }>('/api/articles', {
        params: params as Record<string, string>,
      });

      return response.data.map(article => ({
        id: String(article.id),
        slug: article.slug,
        title: article.title,
        summary: article.summary,
        category: article.category?.name ?? 'Uncategorized',
        districts: article.districts?.map((d: any) => d.name) ?? [],
        publishedAt: article.publishedAt,
        heroImage: article.heroImage?.url,
      }));
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
