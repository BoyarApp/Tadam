import aiAssistFactory from '../../../src/plugins/editorial-workbench/server/services/ai-assist';
import {
  callAssistProvider,
  callComplianceProvider,
} from '../../../src/plugins/editorial-workbench/server/services/provider-client';

jest.mock('../../../src/plugins/editorial-workbench/server/services/provider-client', () => ({
  callAssistProvider: jest.fn(),
  callComplianceProvider: jest.fn(),
}));

const buildStrapiMock = () => {
  const create = jest.fn().mockResolvedValue({ id: 42 });
  const logWarn = jest.fn();

  const strapi = {
    entityService: {
      create,
    },
    log: {
      warn: logWarn,
    },
  } as unknown as any;

  const service = aiAssistFactory({ strapi });

  return { service, create, logWarn };
};

const mockedAssist = callAssistProvider as jest.MockedFunction<typeof callAssistProvider>;
const mockedCompliance = callComplianceProvider as jest.MockedFunction<typeof callComplianceProvider>;

afterEach(() => {
  mockedAssist.mockReset();
  mockedCompliance.mockReset();
});

describe('editorial-workbench ai-assist service', () => {
  it('logs translate assists', async () => {
    mockedAssist.mockResolvedValueOnce({
      output: 'Hello',
      confidence: 0.92,
      metadata: {
        provider: 'mock',
      },
    });

    const { service, create } = buildStrapiMock();

    const result = await service.translate({
      text: 'வணக்கம்',
      sourceLanguage: 'ta',
      targetLanguage: 'en',
      user: { id: 1 },
      articleId: 9,
    });

    expect(result).toMatchObject({
      type: 'translate',
      output: 'Hello',
      metadata: expect.objectContaining({ targetLanguage: 'en' }),
      logEntryId: 42,
    });

    expect(create).toHaveBeenCalledWith(
      'api::ai-assist-log.ai-assist-log',
      expect.objectContaining({
        data: expect.objectContaining({
          operation_type: 'translate',
          editor: 1,
          article: 9,
          metadata: expect.objectContaining({
            targetLanguage: 'en',
          }),
        }),
      }),
    );
  });

  it('handles entity suggestions', async () => {
    mockedAssist.mockResolvedValueOnce({
      entities: [
        { label: 'சென்னை', type: 'place', confidence: 0.91 },
        { label: 'நிகழ்வு', type: 'keyword', confidence: 0.76 },
      ],
      confidence: 0.8,
      metadata: { provider: 'mock' },
    });

    const { service, create, logWarn } = buildStrapiMock();

    const result = await service.entitySuggest({
      text: 'சிறப்பான சென்னை நிகழ்வு',
      language: 'ta',
      user: { id: 2 },
    });

    expect(result).toMatchObject({
      type: 'entity_tag',
      entities: expect.any(Array),
      logEntryId: 42,
    });
    expect(result.entities.length).toBe(2);
    expect(logWarn).not.toHaveBeenCalled();

    expect(create).toHaveBeenCalledWith(
      'api::ai-assist-log.ai-assist-log',
      expect.objectContaining({
        data: expect.objectContaining({
          operation_type: 'entity_tag',
          editor: 2,
          metadata: expect.objectContaining({
            totalEntities: expect.any(Number),
          }),
        }),
      }),
    );
  });

  it('returns spellcheck suggestions and logs metadata', async () => {
    mockedAssist.mockResolvedValueOnce({
      suggestions: [
        { position: 4, length: 2, replacement: ' ', reason: 'Extra space detected' },
      ],
      confidence: 0.88,
      metadata: { provider: 'mock' },
    });

    const { service, create } = buildStrapiMock();

    const result = await service.spellcheck({
      text: 'Test  text...',
      language: 'en',
      user: null,
      submissionId: 4,
    });

    expect(result).toMatchObject({
      type: 'spell_check',
      metadata: expect.objectContaining({
        language: 'en',
        totalSuggestions: expect.any(Number),
      }),
      logEntryId: 42,
    });
    expect(result.suggestions).toEqual(
      expect.arrayContaining([expect.objectContaining({ reason: 'Extra space detected' })]),
    );

    expect(create).toHaveBeenCalledWith(
      'api::ai-assist-log.ai-assist-log',
      expect.objectContaining({
        data: expect.objectContaining({
          operation_type: 'spell_check',
          submission: 4,
          metadata: expect.objectContaining({ language: 'en' }),
        }),
      }),
    );
  });

  it('falls back to heuristics when provider fails', async () => {
    mockedAssist.mockRejectedValueOnce(new Error('provider unavailable'));

    const { service, logWarn } = buildStrapiMock();

    const result = await service.entitySuggest({
      text: 'Chennai Super Kings celebrate win',
      language: 'en',
      user: { id: 3 },
    });

    expect(result.metadata.provider).toBe('fallback');
    expect(result.entities.length).toBeGreaterThan(0);
    expect(logWarn).toHaveBeenCalledWith(
      '[editorial-workbench] entitySuggest provider fallback',
      expect.any(Error),
    );
  });

  it('evaluates quality via compliance provider', async () => {
    mockedCompliance.mockResolvedValueOnce({
      summary: { status: 'review', recommendation: 'Double-check sources.' },
      metrics: { toxicityScore: 0.2, wordCount: 420 },
      flags: [{ type: 'sources', message: 'Missing citations.' }],
      metadata: { provider: 'mock' },
    });

    const { service } = buildStrapiMock();

    const result = await service.evaluateQuality({
      text: 'Story content goes here',
      language: 'en',
      metadata: { draftId: 99 },
    });

    expect(result).toMatchObject({
      summary: expect.objectContaining({ status: 'review' }),
      metrics: expect.objectContaining({ wordCount: 420, toxicityScore: 0.2 }),
      flags: expect.arrayContaining([expect.objectContaining({ type: 'sources' })]),
      metadata: expect.objectContaining({ draftId: 99 }),
    });
  });
});
