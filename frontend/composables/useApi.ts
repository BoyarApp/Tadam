/**
 * API service layer composable
 * Provides a centralized API client with error handling and mock fallback
 */

export type ApiError = {
  message: string;
  statusCode?: number;
  data?: unknown;
};

export class ApiException extends Error {
  statusCode?: number;
  data?: unknown;

  constructor (message: string, statusCode?: number, data?: unknown) {
    super(message);
    this.name = 'ApiException';
    this.statusCode = statusCode;
    this.data = data;
  }
}

export const useApi = () => {
  const config = useRuntimeConfig();
  const baseUrl = config.public.apiBase;

  /**
   * Generic fetch wrapper with error handling
   */
  const apiFetch = async <T>(
    endpoint: string,
    options?: RequestInit & { params?: Record<string, string> },
  ): Promise<T> => {
    try {
      let url = `${baseUrl}${endpoint}`;

      // Append query params if provided
      if (options?.params) {
        const searchParams = new URLSearchParams(options.params);
        url += `?${searchParams.toString()}`;
      }

      const response = await $fetch<T>(url, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      return response;
    } catch (error: any) {
      const statusCode = error?.response?.status ?? error?.statusCode;
      const message = error?.data?.error?.message ?? error?.message ?? 'API request failed';

      throw new ApiException(message, statusCode, error?.data);
    }
  };

  return {
    apiFetch,
  };
};
