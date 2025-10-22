import articleServiceFactory, {
  STATUS_TRANSITIONS,
  sanitizeSnapshot,
} from '../../src/api/article/services/article';

describe('article service helpers', () => {
  it('allows defined status transitions', () => {
    expect(STATUS_TRANSITIONS.draft).toContain('review');
    expect(STATUS_TRANSITIONS.review).toContain('approved');
    expect(STATUS_TRANSITIONS.approved).toContain('published');
  });

  it('sanitizes snapshot fields', () => {
    const snapshot = sanitizeSnapshot({
      id: 1,
      title: 'Test article',
      slug: 'test-article',
      status: 'draft',
      secret: 'should-not-exist',
    });

    expect(snapshot).toMatchObject({
      id: 1,
      title: 'Test article',
      slug: 'test-article',
    });

    expect(snapshot).not.toHaveProperty('secret');
  });

  it('merges workflow metadata during transitions', async () => {
    const update = jest.fn().mockResolvedValue({
      id: 7,
      status: 'review',
    });

    const service = articleServiceFactory({
      strapi: {
        requestContext: {
          get: jest.fn(),
        },
        contentType: jest.fn().mockReturnValue({
          uid: 'api::article.article',
          schema: { modelName: 'article' },
        }),
      } as any,
    }) as any;

    service.findOne = jest.fn().mockResolvedValue({
      id: 7,
      status: 'draft',
      meta: {
        workflow: {
          history: [],
        },
      },
    });

    service.update = update;

    await service.transitionWorkflow(7, 'review', {
      actor: { id: 5, role: { type: 'author' } },
      note: 'Ready for desk review',
      metadata: { checklist: ['facts', 'tone'] },
      assignEditor: true,
    });

    expect(update).toHaveBeenCalledWith({
      where: { id: 7 },
      data: expect.objectContaining({
        status: 'review',
        editor: 5,
        meta: expect.objectContaining({
          workflow: expect.objectContaining({
            lastStatus: 'review',
            lastActionBy: 5,
            lastActionRole: 'author',
            lastNote: 'Ready for desk review',
            lastMetadata: { checklist: ['facts', 'tone'] },
            history: expect.arrayContaining([
              expect.objectContaining({
                toStatus: 'review',
                actor: 5,
                actorRole: 'author',
                note: 'Ready for desk review',
                metadata: { checklist: ['facts', 'tone'] },
              }),
            ]),
          }),
        }),
      }),
    });
  });

  it('supports reverting to draft and clearing editor', async () => {
    const update = jest.fn().mockResolvedValue({
      id: 3,
      status: 'draft',
    });

    const service = articleServiceFactory({
      strapi: {
        requestContext: {
          get: jest.fn(),
        },
        contentType: jest.fn().mockReturnValue({
          uid: 'api::article.article',
          schema: { modelName: 'article' },
        }),
      } as any,
    }) as any;

    service.findOne = jest.fn().mockResolvedValue({
      id: 3,
      status: 'review',
      meta: null,
    });

    service.update = update;

    await service.transitionWorkflow(3, 'draft', {
      actor: { id: 9, role: { type: 'editor' } },
      note: 'Needs clarification on sourcing',
      metadata: { sections: ['intro', 'analysis'] },
      clearEditor: true,
    });

    expect(update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: expect.objectContaining({
        status: 'draft',
        editor: null,
        meta: expect.objectContaining({
          workflow: expect.objectContaining({
            lastStatus: 'draft',
            history: expect.any(Array),
          }),
        }),
      }),
    });
  });
});
