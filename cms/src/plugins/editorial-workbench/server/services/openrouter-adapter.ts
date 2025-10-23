import type { Core } from '@strapi/strapi';

type OpenRouterMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type OpenRouterRequest = {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
};

type OpenRouterResponse = {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
};

/**
 * OpenRouter adapter for editorial AI operations
 * Converts our editorial workbench API calls to OpenRouter's chat completion format
 */
export class OpenRouterAdapter {
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private timeoutMs: number;

  constructor(config: { apiKey: string; baseUrl: string; model: string; timeoutMs: number }) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl;
    this.model = config.model;
    this.timeoutMs = config.timeoutMs;
  }

  private async callOpenRouter(messages: OpenRouterMessage[], temperature = 0.3): Promise<string> {
    const url = `${this.baseUrl}/chat/completions`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://tadam.news',
          'X-Title': 'Tadam Editorial Workbench',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature,
        } as OpenRouterRequest),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await this.safeJson(response);
        throw new Error(
          `OpenRouter error (${response.status}): ${errorBody?.error?.message ?? response.statusText}`,
        );
      }

      const data = (await response.json()) as OpenRouterResponse;
      return data.choices[0]?.message?.content ?? '';
    } catch (error) {
      throw new Error(`OpenRouter request failed: ${(error as Error).message}`);
    } finally {
      clearTimeout(timeout);
    }
  }

  private async safeJson(response: Response) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  async translate(params: {
    text: string;
    sourceLanguage?: string;
    targetLanguage?: string;
  }): Promise<{ translatedText: string; detectedLanguage?: string }> {
    const sourceLang = params.sourceLanguage ?? 'auto-detect';
    const targetLang = params.targetLanguage ?? 'English';

    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: `You are a professional Tamil-English translator. Translate accurately while preserving meaning, tone, and cultural context. Only output the translated text, no explanations.`,
      },
      {
        role: 'user',
        content: `Translate the following text from ${sourceLang} to ${targetLang}:\n\n${params.text}`,
      },
    ];

    const translatedText = await this.callOpenRouter(messages, 0.3);

    return {
      translatedText: translatedText.trim(),
      detectedLanguage: sourceLang === 'auto-detect' ? undefined : sourceLang,
    };
  }

  async spellcheck(params: {
    text: string;
    language?: string;
  }): Promise<{ correctedText: string; corrections: Array<{ original: string; suggestion: string }> }> {
    const lang = params.language ?? 'Tamil';

    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: `You are a ${lang} language expert. Check spelling and grammar, then output ONLY a JSON object with this structure:
{
  "correctedText": "the corrected text",
  "corrections": [
    {"original": "wrong word", "suggestion": "correct word"}
  ]
}

If no corrections are needed, return {"correctedText": "<same text>", "corrections": []}`,
      },
      {
        role: 'user',
        content: params.text,
      },
    ];

    const result = await this.callOpenRouter(messages, 0.2);

    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = result.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) ?? result.match(/(\{[\s\S]*\})/);
      const jsonStr = jsonMatch ? jsonMatch[1] : result;

      return JSON.parse(jsonStr);
    } catch (error) {
      // Fallback if JSON parsing fails
      return {
        correctedText: params.text,
        corrections: [],
      };
    }
  }

  async entitySuggest(params: {
    text: string;
    language?: string;
  }): Promise<{ entities: Array<{ text: string; type: string; confidence: number }> }> {
    const lang = params.language ?? 'Tamil';

    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: `You are a ${lang} named entity recognition expert. Extract entities from the text and output ONLY a JSON object:
{
  "entities": [
    {"text": "entity name", "type": "PERSON|LOCATION|ORGANIZATION|DATE|EVENT", "confidence": 0.0-1.0}
  ]
}

Focus on entities relevant for news articles: people, places, organizations, dates, and events.`,
      },
      {
        role: 'user',
        content: params.text,
      },
    ];

    const result = await this.callOpenRouter(messages, 0.2);

    try {
      const jsonMatch = result.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) ?? result.match(/(\{[\s\S]*\})/);
      const jsonStr = jsonMatch ? jsonMatch[1] : result;

      return JSON.parse(jsonStr);
    } catch (error) {
      return { entities: [] };
    }
  }

  async evaluateQuality(params: {
    text: string;
    language?: string;
  }): Promise<{
    score: number;
    flags: Array<{ category: string; severity: string; message: string }>;
    metrics: {
      readability?: number;
      clarity?: number;
      factAccuracy?: number;
    };
  }> {
    const lang = params.language ?? 'Tamil';

    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: `You are a ${lang} content quality evaluator for news articles. Analyze the text and output ONLY a JSON object:
{
  "score": 0-100,
  "flags": [
    {"category": "grammar|clarity|bias|factual", "severity": "low|medium|high", "message": "description"}
  ],
  "metrics": {
    "readability": 0-100,
    "clarity": 0-100,
    "factAccuracy": 0-100
  }
}

Check for: grammar, clarity, potential bias, factual consistency, and readability.`,
      },
      {
        role: 'user',
        content: params.text,
      },
    ];

    const result = await this.callOpenRouter(messages, 0.3);

    try {
      const jsonMatch = result.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) ?? result.match(/(\{[\s\S]*\})/);
      const jsonStr = jsonMatch ? jsonMatch[1] : result;

      return JSON.parse(jsonStr);
    } catch (error) {
      return {
        score: 50,
        flags: [],
        metrics: {
          readability: 50,
          clarity: 50,
          factAccuracy: 50,
        },
      };
    }
  }
}
