import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS, CACHE_TIMES } from '@constants';
import * as categoriesAPI from '../endpoints/categories';

// Get all categories
export const useCategories = () => {
  return useQuery({
    queryKey: QUERY_KEYS.CATEGORIES,
    queryFn: categoriesAPI.getCategories,
    staleTime: CACHE_TIMES.CATEGORIES,
    gcTime: CACHE_TIMES.CATEGORIES * 2,
  });
};

// Get category by slug
export const useCategory = (slug: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES, slug],
    queryFn: () => categoriesAPI.getCategory(slug),
    enabled: !!slug,
    staleTime: CACHE_TIMES.CATEGORIES,
  });
};
