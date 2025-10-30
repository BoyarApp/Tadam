import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { QUERY_KEYS, CACHE_TIMES, PAGINATION } from '@constants';
import * as articlesAPI from '../endpoints/articles';
import type { FeedFilters } from '@types';

// Infinite scroll feed
export const useFeed = (filters: FeedFilters) => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.FEED, filters],
    queryFn: ({ pageParam = 0 }) =>
      articlesAPI.getFeed({
        ...filters,
        offset: pageParam,
        limit: PAGINATION.FEED_PAGE_SIZE,
      }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGINATION.FEED_PAGE_SIZE) {
        return undefined;
      }
      return allPages.length * PAGINATION.FEED_PAGE_SIZE;
    },
    staleTime: CACHE_TIMES.FEED,
    gcTime: CACHE_TIMES.FEED * 2,
  });
};

// Get article by slug
export const useArticle = (slug: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.ARTICLE, slug],
    queryFn: () => articlesAPI.getArticle(slug),
    enabled: !!slug,
    staleTime: CACHE_TIMES.ARTICLE,
  });
};

// Get related articles
export const useRelatedArticles = (articleId: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.ARTICLE, articleId, 'related'],
    queryFn: () => articlesAPI.getRelatedArticles(articleId),
    enabled: !!articleId,
    staleTime: CACHE_TIMES.ARTICLE,
  });
};

// Search articles
export const useSearchArticles = (query: string, filters?: FeedFilters) => {
  return useQuery({
    queryKey: [QUERY_KEYS.FEED, 'search', query, filters],
    queryFn: () => articlesAPI.searchArticles(query, filters),
    enabled: query.length > 2,
    staleTime: CACHE_TIMES.FEED,
  });
};
