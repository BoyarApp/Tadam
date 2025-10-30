import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS, CACHE_TIMES } from '@constants';
import * as districtsAPI from '../endpoints/districts';

// Get all districts
export const useDistricts = () => {
  return useQuery({
    queryKey: QUERY_KEYS.DISTRICTS,
    queryFn: districtsAPI.getDistricts,
    staleTime: CACHE_TIMES.DISTRICTS,
    gcTime: CACHE_TIMES.DISTRICTS * 2,
  });
};

// Get district by slug
export const useDistrict = (slug: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DISTRICTS, slug],
    queryFn: () => districtsAPI.getDistrict(slug),
    enabled: !!slug,
    staleTime: CACHE_TIMES.DISTRICTS,
  });
};

// Reverse geocode
export const useReverseGeocode = (latitude: number, longitude: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: [QUERY_KEYS.DISTRICTS, 'geocode', latitude, longitude],
    queryFn: () => districtsAPI.reverseGeocode(latitude, longitude),
    enabled: enabled && !!latitude && !!longitude,
    staleTime: CACHE_TIMES.DISTRICTS,
  });
};
