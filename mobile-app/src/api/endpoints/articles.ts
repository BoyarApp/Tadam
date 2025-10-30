import { get, post } from '../client';
import type { Article, ArticleListItem, ArticleSubmission, APIResponse, FeedFilters } from '@types';

// Get personalized feed
export const getFeed = async (filters: FeedFilters): Promise<ArticleListItem[]> => {
  const params: any = {
    limit: filters.limit || 20,
    offset: filters.offset || 0,
  };

  if (filters.categories && filters.categories.length > 0) {
    params.categories = filters.categories.join(',');
  }

  if (filters.districts && filters.districts.length > 0) {
    params.districts = filters.districts.join(',');
  }

  const response = await get<APIResponse<ArticleListItem[]>>('/api/feed/latest', { params });
  return response.data;
};

// Get article by slug
export const getArticle = async (slug: string): Promise<Article> => {
  const response = await get<APIResponse<Article>>(`/api/articles/${slug}`);
  return response.data;
};

// Get related articles
export const getRelatedArticles = async (articleId: number): Promise<ArticleListItem[]> => {
  const response = await get<APIResponse<ArticleListItem[]>>(`/api/articles/${articleId}/related`);
  return response.data;
};

// Submit article (for contributors)
export const submitArticle = async (data: ArticleSubmission): Promise<Article> => {
  const response = await post<APIResponse<Article>>('/api/articles', { data });
  return response.data;
};

// Search articles
export const searchArticles = async (query: string, filters?: FeedFilters): Promise<ArticleListItem[]> => {
  const params: any = {
    query,
    limit: filters?.limit || 20,
    offset: filters?.offset || 0,
  };

  if (filters?.categories && filters.categories.length > 0) {
    params.categories = filters.categories.join(',');
  }

  if (filters?.districts && filters.districts.length > 0) {
    params.districts = filters.districts.join(',');
  }

  const response = await get<APIResponse<ArticleListItem[]>>('/api/articles/search', { params });
  return response.data;
};
