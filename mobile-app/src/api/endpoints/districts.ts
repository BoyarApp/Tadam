import { get } from '../client';
import type { District, APIResponse, GeocodeResult } from '@types';

// Get all districts
export const getDistricts = async (): Promise<District[]> => {
  const response = await get<APIResponse<District[]>>('/api/districts', {
    params: {
      populate: '*',
      sort: 'name:asc',
    },
  });
  return response.data;
};

// Get district by slug
export const getDistrict = async (slug: string): Promise<District> => {
  const response = await get<APIResponse<District>>(`/api/districts/${slug}`);
  return response.data;
};

// Reverse geocode (lat/lng to district)
export const reverseGeocode = async (latitude: number, longitude: number): Promise<GeocodeResult> => {
  const response = await get<GeocodeResult>('/api/districts/reverse-geocode', {
    params: { latitude, longitude },
  });
  return response;
};
