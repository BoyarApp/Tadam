import type { Core } from '@strapi/strapi';
import { getPluginConfig, getProviderHeaders, assertProviderConfigured } from '../utils/config';
import { OpenRouterAdapter } from './openrouter-adapter';

type AssistOperation = 'translate' | 'spellcheck' | 'entitySuggest';

type AssistPayload = Record<string, unknown>;

type CompliancePayload = {
  text: string;
  language?: string;
  articleId?: number;
  submissionId?: number;
  metadata?: Record<string, unknown>;
};

let openrouterAdapter: OpenRouterAdapter | null = null;

const getOpenRouterAdapter = (strapi: Core.Strapi): OpenRouterAdapter | null => {
  const config = getPluginConfig(strapi);
  const provider = config.providers.ai;

  // Check if we're using OpenRouter
  if (provider.baseUrl && provider.baseUrl.includes('openrouter.ai')) {
    if (!openrouterAdapter) {
      const model = process.env.EDITORIAL_AI_MODEL || 'google/gemini-flash-1.5:free';
      openrouterAdapter = new OpenRouterAdapter({
        apiKey: provider.apiKey || '',
        baseUrl: provider.baseUrl,
        model,
        timeoutMs: provider.timeoutMs,
      });
    }
    return openrouterAdapter;
  }

  return null;
};

export const callAssistProvider = async (
  strapi: Core.Strapi,
  operation: AssistOperation,
  payload: AssistPayload,
) => {
  const adapter = getOpenRouterAdapter(strapi);

  // Use OpenRouter adapter if configured
  if (adapter) {
    const params = {
      text: payload.text as string,
      sourceLanguage: payload.sourceLanguage as string | undefined,
      targetLanguage: payload.targetLanguage as string | undefined,
      language: payload.language as string | undefined,
    };

    switch (operation) {
      case 'translate':
        return await adapter.translate(params);
      case 'spellcheck':
        return await adapter.spellcheck(params);
      case 'entitySuggest':
        return await adapter.entitySuggest(params);
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  }

  // Otherwise use direct provider API
  const config = getPluginConfig(strapi);
  const provider = config.providers.ai;
  assertProviderConfigured(provider, 'ai');

  const url = new URL(`/assist/${operation}`, provider.baseUrl).toString();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), provider.timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getProviderHeaders(provider),
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await safeJson(response);
      throw new Error(
        `AI provider error (${response.status}): ${body?.message ?? response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    throw new Error(`AI provider request failed: ${(error as Error).message}`);
  } finally {
    clearTimeout(timeout);
  }
};

export const callComplianceProvider = async (
  strapi: Core.Strapi,
  payload: CompliancePayload,
) => {
  const adapter = getOpenRouterAdapter(strapi);

  // Use OpenRouter adapter for quality evaluation too
  if (adapter) {
    return await adapter.evaluateQuality({
      text: payload.text,
      language: payload.language,
    });
  }

  // Otherwise use direct compliance provider API
  const config = getPluginConfig(strapi);
  const provider = config.providers.compliance;
  assertProviderConfigured(provider, 'compliance');

  const url = new URL('/quality/evaluate', provider.baseUrl).toString();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), provider.timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getProviderHeaders(provider),
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await safeJson(response);
      throw new Error(
        `Compliance provider error (${response.status}): ${body?.message ?? response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Compliance provider request failed: ${(error as Error).message}`);
  } finally {
    clearTimeout(timeout);
  }
};

interface ErrorBody {
  message?: string;
}

const safeJson = async (response: Response): Promise<ErrorBody | null> => {
  try {
    return await response.json() as ErrorBody;
  } catch {
    return null;
  }
};
