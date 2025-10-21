import aiAssistFactory from '../../../src/plugins/editorial-workbench/server/services/ai-assist';

const buildStrapiMock = () => {
  const create = jest.fn();
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
    });

    expect(result).toMatchObject({
      type: 'translate',
      metadata: expect.objectContaining({ targetLanguage: 'en' }),
    });

    expect(create).toHaveBeenCalledWith(
      'api::ai-assist-log.ai-assist-log',
      expect.objectContaining({
        data: expect.objectContaining({
          operation_type: 'translate',
          editor: 1,
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
      entities: [],
    });

    expect(create).toHaveBeenCalledWith(
      'api::ai-assist-log.ai-assist-log',
      expect.objectContaining({
        data: expect.objectContaining({
          operation_type: 'entity_tag',
          editor: 2,
        }),
      }),
    );
  });
});
