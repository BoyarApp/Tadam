import { reactive } from 'vue';
import type {
  EntityAssistResponse,
  SpellcheckAssistResponse,
  TranslateAssistResponse,
  QualityEvaluation,
} from '~/types/editorial';

type AssistPayload = {
  text: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  language?: string;
  articleId?: number | null;
  submissionId?: number | null;
  metadata?: Record<string, unknown>;
};

type AssistError = {
  message: string;
  details?: unknown;
};

export const useEditorialAssist = () => {
  const config = useRuntimeConfig();
  const baseUrl = config.public.apiBase ?? '';

  const loading = reactive({
    translate: false,
    spellcheck: false,
    entity: false,
    quality: false,
  });

  const buildBody = (payload: AssistPayload) => {
    const body: Record<string, unknown> = {
      text: payload.text,
    };

    if (payload.sourceLanguage) {
      body.language = payload.sourceLanguage;
    }

    if (payload.targetLanguage) {
      body.targetLanguage = payload.targetLanguage;
    }

    if (payload.language) {
      body.language = payload.language;
    }

    if (payload.articleId) {
      body.articleId = payload.articleId;
    }

    if (payload.submissionId) {
      body.submissionId = payload.submissionId;
    }

    if (payload.metadata) {
      body.metadata = payload.metadata;
    }

    return body;
  };

  const callAssist = async <T>(endpoint: string, payload: AssistPayload) => {
    const url = `${baseUrl}/${endpoint}`;

    try {
      return await $fetch<T>(url, {
        method: 'POST',
        body: buildBody(payload),
        credentials: 'include',
      });
    } catch (error: any) {
      const err: AssistError = {
        message: error?.data?.error?.message ?? error?.message ?? 'Unable to reach editorial assist service.',
        details: error?.data ?? error,
      };

      throw err;
    }
  };

  const translate = async (payload: AssistPayload): Promise<TranslateAssistResponse> => {
    loading.translate = true;
    try {
      return await callAssist<TranslateAssistResponse>('editorial-workbench/ai/translate', payload);
    } finally {
      loading.translate = false;
    }
  };

  const spellcheck = async (payload: AssistPayload): Promise<SpellcheckAssistResponse> => {
    loading.spellcheck = true;
    try {
      return await callAssist<SpellcheckAssistResponse>('editorial-workbench/ai/spellcheck', payload);
    } finally {
      loading.spellcheck = false;
    }
  };

  const entitySuggest = async (payload: AssistPayload): Promise<EntityAssistResponse> => {
    loading.entity = true;
    try {
      return await callAssist<EntityAssistResponse>('editorial-workbench/ai/entity-suggest', payload);
    } finally {
      loading.entity = false;
    }
  };

  const evaluateQuality = async (payload: AssistPayload): Promise<QualityEvaluation> => {
    loading.quality = true;
    try {
      return await callAssist<QualityEvaluation>('editorial-workbench/quality/evaluate', payload);
    } finally {
      loading.quality = false;
    }
  };

  return {
    loading,
    translate,
    spellcheck,
    entitySuggest,
    evaluateQuality,
  };
};
