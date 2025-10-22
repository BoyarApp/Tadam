import type { Core } from '@strapi/strapi';
import { getPluginConfig, getProviderHeaders, assertProviderConfigured } from '../utils/config';

type AssistOperation = 'translate' | 'spellcheck' | 'entitySuggest';

type AssistPayload = Record<string, unknown>;

type CompliancePayload = {
  text: string;
  language?: string;
  articleId?: number;
  submissionId?: number;
  metadata?: Record<string, unknown>;
};

export const callAssistProvider = async (
  strapi: Core.Strapi,
  operation: AssistOperation,
  payload: AssistPayload,
) => {
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

const safeJson = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};
