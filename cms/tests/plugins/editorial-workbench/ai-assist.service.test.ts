import aiAssistFactory from '../../../src/plugins/editorial-workbench/server/services/ai-assist';

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

  return { service, create };
};

describe('editorial-workbench ai-assist service', () => {
  it('logs translate assists', async () => {
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
    const { service, create } = buildStrapiMock();

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
    expect(result.entities.length).toBeGreaterThan(0);

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
        totalSuggestions: 2,
      }),
      logEntryId: 42,
    });
    expect(result.suggestions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ reason: 'Extra space detected' }),
        expect.objectContaining({ reason: 'Ellipsis should use a single glyph' }),
      ]),
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
});
