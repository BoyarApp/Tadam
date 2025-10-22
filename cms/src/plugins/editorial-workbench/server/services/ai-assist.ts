import type { Core } from '@strapi/strapi';
import { sanitizeEntityInput } from '../utils/sanitize';

type AssistContext = {
  user: { id?: number } | null;
  articleId?: number;
  submissionId?: number;
  metadata?: Record<string, unknown>;
};

type TranslateArgs = AssistContext & {
  text: string;
  sourceLanguage?: string;
  targetLanguage?: string;
};

type SpellcheckArgs = AssistContext & {
  text: string;
  language?: string;
};

type EntitySuggestArgs = AssistContext & {
  text: string;
  language?: string;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const cleanseToken = (token: string) =>
  token.replace(/^[^A-Za-z0-9\u0B80-\u0BFF]+|[^A-Za-z0-9\u0B80-\u0BFF]+$/g, '');

const buildEntitySuggestions = (text: string) => {
  const tokens = text
    .split(/\s+/)
    .map((token) => cleanseToken(token))
    .filter((token) => token.length >= 3);

  const unique = Array.from(new Set(tokens)).slice(0, 8);

  return unique.map((entity) => ({
    label: entity,
    type: 'keyword',
    confidence: Math.min(0.9, 0.4 + entity.length * 0.03),
  }));
};

const buildSpellcheckSuggestions = (text: string) => {
  const suggestions: Array<{ position: number; length: number; replacement: string; reason: string }> = [];

  const doubleSpaceIndex = text.indexOf('  ');
  if (doubleSpaceIndex >= 0) {
    suggestions.push({
      position: doubleSpaceIndex,
      length: 2,
      replacement: ' ',
      reason: 'Extra space detected',
    });
  }

  const tripleDotIndex = text.indexOf('...');
  if (tripleDotIndex >= 0) {
    suggestions.push({
      position: tripleDotIndex,
      length: 3,
      replacement: '…',
      reason: 'Ellipsis should use a single glyph',
    });
  }

  return suggestions;
};

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async translate({
    text,
    sourceLanguage = 'auto',
    targetLanguage = 'ta',
    user,
    articleId,
    submissionId,
    metadata,
  }: TranslateArgs) {
    await sleep(50); // Simulate latency / stub

    const confidence = 0.6;
    const output = text; // Placeholder until real provider wired
    const hydratedMetadata = {
      sourceLanguage,
      targetLanguage,
      confidence,
      strategy: 'noop',
      ...metadata,
    };

    const logEntryId = await this.logAssist({
      operationType: 'translate',
      inputText: text,
      outputText: output,
      confidenceScore: confidence,
      user,
      articleId,
      submissionId,
      metadata: hydratedMetadata,
    });

    return {
      type: 'translate' as const,
      input: text,
      output,
      metadata: hydratedMetadata,
      logEntryId,
      loggedAt: new Date().toISOString(),
    };
  },

  async spellcheck({
    text,
    language = 'ta',
    user,
    articleId,
    submissionId,
    metadata,
  }: SpellcheckArgs) {
    await sleep(30);

    const suggestions = buildSpellcheckSuggestions(text);
    const confidence = suggestions.length ? 0.75 : 0.5;
    const hydratedMetadata = {
      language,
      confidence,
      totalSuggestions: suggestions.length,
      ...metadata,
    };

    const logEntryId = await this.logAssist({
      operationType: 'spell_check',
      inputText: text,
      outputText: JSON.stringify(suggestions),
      confidenceScore: confidence,
      user,
      articleId,
      submissionId,
      metadata: hydratedMetadata,
    });

    return {
      type: 'spell_check' as const,
      input: text,
      suggestions,
      metadata: hydratedMetadata,
      logEntryId,
      loggedAt: new Date().toISOString(),
    };
  },

  async entitySuggest({
    text,
    language = 'ta',
    user,
    articleId,
    submissionId,
    metadata,
  }: EntitySuggestArgs) {
    await sleep(40);

    const entities = buildEntitySuggestions(text);
    const confidence = entities.length ? 0.55 : 0.4;
    const hydratedMetadata = {
      language,
      confidence,
      totalEntities: entities.length,
      ...metadata,
    };

    const logEntryId = await this.logAssist({
      operationType: 'entity_tag',
      inputText: text,
      outputText: JSON.stringify(entities),
      confidenceScore: confidence,
      user,
      articleId,
      submissionId,
      metadata: hydratedMetadata,
    });

    return {
      type: 'entity_tag' as const,
      input: text,
      entities,
      metadata: hydratedMetadata,
      logEntryId,
      loggedAt: new Date().toISOString(),
    };
  },

  async logAssist({
    operationType,
    inputText,
    outputText,
    confidenceScore,
    user,
    articleId,
    submissionId,
    metadata,
  }: {
    operationType: string;
    inputText: string;
    outputText?: string;
    confidenceScore?: number;
    user: { id?: number } | null;
    articleId?: number;
    submissionId?: number;
    metadata?: Record<string, unknown>;
  }): Promise<number | null> {
    const data: Record<string, unknown> = {
      operation_type: operationType,
      input_text: inputText,
      output_text: outputText,
      confidence_score: confidenceScore,
      metadata,
      editor: user?.id,
    };

    if (typeof articleId === 'number') {
      data.article = articleId;
    }

    if (typeof submissionId === 'number') {
      data.submission = submissionId;
    }

    try {
      const logEntry = await strapi.entityService.create('api::ai-assist-log.ai-assist-log', {
        data: sanitizeEntityInput(data),
      });

      const entryId = logEntry?.id;

      if (typeof entryId === 'number') {
        return entryId;
      }

      if (typeof entryId === 'string') {
        const parsed = Number.parseInt(entryId, 10);
        return Number.isNaN(parsed) ? null : parsed;
      }

      return null;
    } catch (error) {
      strapi.log.warn('Failed to log AI assist event', error);
      return null;
    }
  },
});
