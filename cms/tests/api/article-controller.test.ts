import articleControllerFactory from '../../src/api/article/controllers/article';

const createCtx = (overrides: Record<string, unknown> = {}) => {
  const ctx: any = {
    params: { id: '12' },
    request: { body: {} },
    state: { user: { id: 7, role: { type: 'author' } } },
    status: 200,
    body: undefined,
    badRequest(message: string) {
      this.status = 400;
      this.body = { error: message };
      return this;
    },
    forbidden(message: string) {
      this.status = 403;
      this.body = { error: message };
      return this;
    },
    ...overrides,
  };

  return ctx;
};

const buildController = (transitionWorkflow = jest.fn()) => {
  const strapi = {
    service: jest.fn().mockReturnValue({
      transitionWorkflow,
    }),
    contentType: jest.fn().mockReturnValue({
      uid: 'api::article.article',
      schema: { modelName: 'article' },
    }),
  } as any;

  const controller: any = articleControllerFactory({ strapi });
  controller.sanitizeOutput = jest.fn().mockImplementation(async (value: unknown) => value);
  controller.transformResponse = jest.fn((value: unknown) => value);

  return { controller, transitionWorkflow, strapi };
};

describe('article controller workflow actions', () => {
  it('submits articles for review with metadata', async () => {
    const { controller, transitionWorkflow } = buildController(
      jest.fn().mockResolvedValue({ id: 12 }),
    );

    const ctx = createCtx({
      request: {
        body: {
          note: 'Ready for editorial eyes',
          metadata: { desk: 'politics' },
        },
      },
    });

    await controller.submitForReview(ctx);

    expect(transitionWorkflow).toHaveBeenCalledWith(
      12,
      'review',
      expect.objectContaining({
        actor: ctx.state.user,
        note: 'Ready for editorial eyes',
        metadata: { action: 'submit_for_review', desk: 'politics' },
        assignEditor: true,
      }),
    );

    expect(controller.transformResponse).toHaveBeenCalledWith({ id: 12 });
  });

  it('prevents contributors from submitting articles for review', async () => {
    const { controller, transitionWorkflow } = buildController();

    const ctx = createCtx({
      state: { user: { id: 9, role: { type: 'contributor' } } },
    });

    await controller.submitForReview(ctx);

    expect(ctx.status).toBe(403);
    expect(transitionWorkflow).not.toHaveBeenCalled();
  });

  it('requires editor role for publish and clears editor on request changes', async () => {
    const transitionWorkflow = jest.fn().mockResolvedValue({ id: 5 });
    const { controller } = buildController(transitionWorkflow);

    const editorCtx = createCtx({
      params: { id: '5' },
      state: { user: { id: 3, role: { type: 'editor' } } },
      request: { body: { note: 'Go live now' } },
    });

    await controller.publish(editorCtx);

    expect(transitionWorkflow).toHaveBeenCalledWith(
      5,
      'published',
      expect.objectContaining({
        metadata: { action: 'publish' },
        assignEditor: true,
      }),
    );

    const requestChangesCtx = createCtx({
      params: { id: '5' },
      state: { user: { id: 3, role: { type: 'editor' } } },
      request: { body: { note: 'Needs better sourcing' } },
    });

    await controller.requestChanges(requestChangesCtx);

    expect(transitionWorkflow).toHaveBeenLastCalledWith(
      5,
      'draft',
      expect.objectContaining({
        metadata: { action: 'request_changes' },
        clearEditor: true,
      }),
    );
  });
});
