import type { Core } from '@strapi/strapi';

type TranslateArgs = {
  text: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  user: any;
};

type SpellcheckArgs = {
  text: string;
  language?: string;
  user: any;
};

type EntitySuggestArgs = {
  text: string;
  language?: string;
  user: any;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async translate({ text, sourceLanguage = 'auto', targetLanguage = 'ta', user }: TranslateArgs) {
    await sleep(50); // Simulate latency / stub

    const confidence = 0.6;

    const suggestion = {
      type: 'translate' as const,
      input: text,
      output: text, // Placeholder until real provider wired
      metadata: {
        sourceLanguage,
        targetLanguage,
        confidence,
      },
    };

    await this.logAssist({
      operationType: 'translate',
      inputText: text,
      outputText: text,
      confidenceScore: confidence,
      user,
    });

    return suggestion;
  },

  async spellcheck({ text, language = 'ta', user }: SpellcheckArgs) {
    await sleep(30);

    const result = {
      type: 'spell_check' as const,
      input: text,
      suggestions: [],
      metadata: {
        language,
        confidence: 0.7,
      },
    };

    await this.logAssist({
      operationType: 'spell_check',
      inputText: text,
      outputText: text,
      confidenceScore: 0.7,
      user,
    });

    return result;
  },

  async entitySuggest({ text, language = 'ta', user }: EntitySuggestArgs) {
    await sleep(40);

    const result = {
      type: 'entity_tag' as const,
      input: text,
      entities: [],
      metadata: {
        language,
        confidence: 0.5,
      },
    };

    await this.logAssist({
      operationType: 'entity_tag',
      inputText: text,
      outputText: JSON.stringify(result.entities),
      confidenceScore: 0.5,
      user,
    });

    return result;
  },

  async logAssist({
    operationType,
    inputText,
    outputText,
    confidenceScore,
    user,
  }: {
    operationType: string;
    inputText: string;
    outputText?: string;
    confidenceScore?: number;
    user: any;
  }) {
    try {
      await strapi.entityService.create('api::ai-assist-log.ai-assist-log', {
        data: {
          operation_type: operationType,
          input_text: inputText,
          output_text: outputText,
          confidence_score: confidenceScore,
          editor: user?.id,
        },
      });
    } catch (error) {
      strapi.log.warn('Failed to log AI assist event', error);
    }
  },
});
