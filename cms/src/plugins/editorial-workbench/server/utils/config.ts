import type { Core } from '@strapi/strapi';

type ProviderConfig = {
  baseUrl: string;
  apiKey?: string;
  timeoutMs: number;
};

type PluginConfig = {
  throttling: {
    windowInSeconds: number;
    maxRequests: number;
  };
  providers: {
    ai: ProviderConfig;
    compliance: ProviderConfig;
  };
};

export const getPluginConfig = (strapi: Core.Strapi): PluginConfig =>
  strapi.config.get('plugin::editorial-workbench') as PluginConfig;

export const assertProviderConfigured = (
  provider: ProviderConfig,
  providerName: 'ai' | 'compliance',
) => {
  if (!provider.baseUrl) {
    throw new Error(
      `editorial-workbench ${providerName} provider not configured. Set EDITORIAL_${providerName.toUpperCase()}_BASE_URL.`,
    );
  }
};

export const getProviderHeaders = (provider: ProviderConfig) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (provider.apiKey) {
    headers.Authorization = `Bearer ${provider.apiKey}`;
  }

  return headers;
};
