import { get } from '../client';
import type { Category, APIResponse } from '@types';

// Get all categories
export const getCategories = async (): Promise<Category[]> => {
  const response = await get<APIResponse<Category[]>>('/api/categories', {
    params: {
      populate: '*',
      sort: ['order:asc', 'name:asc'],
    },
  });
  return response.data;
};

// Get category by slug
export const getCategory = async (slug: string): Promise<Category> => {
  const response = await get<APIResponse<Category>>(`/api/categories/${slug}`);
  return response.data;
};
