import type { Core } from '@strapi/strapi';
import { sanitizeEntityInput } from '../utils/sanitize';
import { callAssistProvider, callComplianceProvider } from './provider-client';

type AssistContext = {
  user?: { id?: number } | null;
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

type QualityArgs = AssistContext & {
  text: string;
  language?: string;
};

type LogAssistArgs = {
  operationType: string;
  inputText: string;
  outputText?: string;
  confidenceScore?: number;
  user: { id?: number } | null;
  articleId?: number;
  submissionId?: number;
  metadata?: Record<string, unknown>;
};

const cleanseToken = (token: string) =>
  token.replace(/^[^A-Za-z0-9\u0B80-\u0BFF]+|[^A-Za-z0-9\u0B80-\u0BFF]+$/g, '');

const buildHeuristicEntities = (text: string) => {
  const tokens = text
    .split(/\s+/)
    .map((token) => cleanseToken(token))
    .filter((token) => token.length >= 3);

  const unique = Array.from(new Set(tokens)).slice(0, 12);

  return unique.map((entity) => ({
    label: entity,
    type: 'keyword',
    confidence: Math.min(0.9, 0.45 + entity.length * 0.03),
  }));
};

const buildHeuristicSpellcheck = (text: string) => {
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

const buildHeuristicQuality = (text: string, language: string) => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const sentences = text
    .split(/[.!?]/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const wordCount = words.length;
  const avgSentenceLength = sentences.length ? wordCount / sentences.length : wordCount;
  const uniqueWords = new Set(words.map((word) => word.toLowerCase())).size;

  const toxicityLexicon = ['hate', 'kill', 'idiot', 'stupid', 'fake news', 'rumour'];
  const suspiciousLexicon = ['lorem ipsum', 'verify', 'unconfirmed', 'alleged', 'rumour'];

  const lowerContent = text.toLowerCase();
  const suspiciousPhrases = suspiciousLexicon.filter((phrase) => lowerContent.includes(phrase));

  const toxicityHits = toxicityLexicon.reduce(
    (count, term) => count + (lowerContent.includes(term) ? 1 : 0),
    0,
  );
  const toxicityScore = Math.min(1, toxicityHits / toxicityLexicon.length);

  const flags: Array<Record<string, unknown>> = [];

  if (toxicityScore > 0.4) {
    flags.push({
      type: 'toxicity',
      severity: toxicityScore,
      message: 'Potential toxic language detected.',
    });
  }

  if (suspiciousPhrases.length > 0) {
    flags.push({
      type: 'suspicious_language',
      severity: 0.6,
      message: 'Copy includes phrases requiring verification.',
      phrases: suspiciousPhrases,
    });
  }

  if (wordCount < 120) {
    flags.push({
      type: 'length',
      severity: 0.3,
      message: 'Story is shorter than typical desk guidelines.',
    });
  }

  const readability =
    avgSentenceLength <= 12 ? 'easy' : avgSentenceLength <= 18 ? 'moderate' : 'complex';

  return {
    summary: {
      status: flags.length ? 'review' : 'pass',
      recommendation: flags.length
        ? 'Editor review recommended before publishing.'
        : 'Meets baseline quality checks.',
    },
    metrics: {
      language,
      wordCount,
      avgSentenceLength,
      uniqueWords,
      readability,
      toxicityScore,
      suspiciousPhrases,
    },
    flags,
    metadata: {
      strategy: 'heuristic',
    },
  };
};

const nowIso = () => new Date().toISOString();

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
    const fallback = () => ({
      type: 'translate' as const,
      input: text,
      output: text,
      metadata: {
        sourceLanguage,
        targetLanguage,
        confidence: 0.6,
        provider: 'fallback',
        ...metadata,
      },
    });

    let result = fallback();

    try {
      const providerResult = (await callAssistProvider(strapi, 'translate', {
        text,
        sourceLanguage,
        targetLanguage,
        articleId,
        submissionId,
        metadata,
      })) as Record<string, any>;

      result = {
        type: 'translate' as const,
        input: text,
        output: providerResult.output ?? providerResult.translatedText ?? text,
        metadata: {
          sourceLanguage,
          targetLanguage,
          confidence: providerResult.confidence ?? providerResult.metadata?.confidence ?? 0.85,
          provider: 'external',
          ...metadata,
          ...providerResult.metadata,
        },
      };
    } catch (error) {
      strapi.log.warn('[editorial-workbench] translate provider fallback', error);
    }

    const logEntryId = await this.logAssist({
      operationType: 'translate',
      inputText: text,
      outputText: result.output,
      confidenceScore: (result.metadata.confidence as number) ?? undefined,
      user,
      articleId,
      submissionId,
      metadata: result.metadata,
    });

    return {
      ...result,
      logEntryId,
      loggedAt: nowIso(),
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
    const fallback = () => {
      const suggestions = buildHeuristicSpellcheck(text);
      const confidence = suggestions.length ? 0.75 : 0.5;
      return {
        type: 'spell_check' as const,
        input: text,
        suggestions,
        metadata: {
          language,
          confidence,
          totalSuggestions: suggestions.length,
          provider: 'fallback',
          ...metadata,
        },
      };
    };

    let result = fallback();

    try {
      const providerResult = (await callAssistProvider(strapi, 'spellcheck', {
        text,
        language,
        articleId,
        submissionId,
        metadata,
      })) as Record<string, any>;

      result = {
        type: 'spell_check' as const,
        input: text,
        suggestions: providerResult.suggestions ?? providerResult.updates ?? [],
        metadata: {
          language,
          confidence: providerResult.confidence ?? providerResult.metadata?.confidence ?? 0.9,
          totalSuggestions: (providerResult.suggestions ?? []).length,
          provider: 'external',
          ...metadata,
          ...providerResult.metadata,
        },
      };
    } catch (error) {
      strapi.log.warn('[editorial-workbench] spellcheck provider fallback', error);
    }

    const logEntryId = await this.logAssist({
      operationType: 'spell_check',
      inputText: text,
      outputText: JSON.stringify(result.suggestions),
      confidenceScore: (result.metadata.confidence as number) ?? undefined,
      user,
      articleId,
      submissionId,
      metadata: result.metadata,
    });

    return {
      ...result,
      logEntryId,
      loggedAt: nowIso(),
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
    const fallback = () => {
      const entities = buildHeuristicEntities(text);
      const confidence = entities.length ? 0.55 : 0.4;
      return {
        type: 'entity_tag' as const,
        input: text,
        entities,
        metadata: {
          language,
          confidence,
          totalEntities: entities.length,
          provider: 'fallback',
          ...metadata,
        },
      };
    };

    let result = fallback();

    try {
      const providerResult = (await callAssistProvider(strapi, 'entitySuggest', {
        text,
        language,
        articleId,
        submissionId,
        metadata,
      })) as Record<string, any>;

      result = {
        type: 'entity_tag' as const,
        input: text,
        entities: providerResult.entities ?? providerResult.suggestions ?? [],
        metadata: {
          language,
          confidence: providerResult.confidence ?? providerResult.metadata?.confidence ?? 0.8,
          totalEntities: (providerResult.entities ?? []).length,
          provider: 'external',
          ...metadata,
          ...providerResult.metadata,
        },
      };
    } catch (error) {
      strapi.log.warn('[editorial-workbench] entitySuggest provider fallback', error);
    }

    const logEntryId = await this.logAssist({
      operationType: 'entity_tag',
      inputText: text,
      outputText: JSON.stringify(result.entities),
      confidenceScore: (result.metadata.confidence as number) ?? undefined,
      user,
      articleId,
      submissionId,
      metadata: result.metadata,
    });

    return {
      ...result,
      logEntryId,
      loggedAt: nowIso(),
    };
  },

  async evaluateQuality({
    text,
    language = 'ta',
    articleId,
    submissionId,
    metadata,
  }: QualityArgs) {
    let result = buildHeuristicQuality(text, language);

    try {
      const providerResult = (await callComplianceProvider(strapi, {
        text,
        language,
        articleId,
        submissionId,
        metadata,
      })) as Record<string, any>;

      result = {
        summary: providerResult.summary ?? result.summary,
        metrics: {
          ...result.metrics,
          ...providerResult.metrics,
        },
        flags: providerResult.flags ?? result.flags,
        metadata: {
          provider: 'external',
          ...metadata,
          ...providerResult.metadata,
        },
      };
    } catch (error) {
      strapi.log.warn('[editorial-workbench] compliance provider fallback', error);
    }

    return {
      ...result,
      evaluatedAt: nowIso(),
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
  }: LogAssistArgs): Promise<number | null> {
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
