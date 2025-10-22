import accountControllerFactory from '../../src/api/account/controllers/account';

describe('account controller', () => {
  const sanitizeUserMock = jest.fn(async user => user);
  const getLedgerMock = jest.fn(async () => [
    {
      id: 1,
      amount: 249,
      entryType: 'debit',
      status: 'completed',
      externalReference: 'TX1',
      createdAt: '2024-01-01',
    },
  ]);
  const cancelMembershipMock = jest.fn(async () => ({
    refundRequestId: 'REF123',
    requestedAt: '2024-01-10T00:00:00.000Z',
  }));

  const ctxBase: any = {
    state: { user: { id: 42 }, auth: {} },
    body: null,
    unauthorized: jest.fn(() => {
      throw new Error('unauthorized');
    }),
    badRequest: jest.fn((message: string) => {
      throw new Error(message);
    }),
    forbidden: jest.fn((message: string) => {
      throw new Error(message);
    }),
    notFound: jest.fn((message: string) => {
      throw new Error(message);
    }),
  };

  const buildController = () => {
    const strapiMock: any = {
      entityService: {
        findOne: jest.fn().mockResolvedValue({
          id: 42,
          email: 'user@example.com',
          membership_status: 'active',
          membership_expires_at: '2025-01-01T00:00:00.000Z',
          membership_reminder_sent_at: '2024-12-15T00:00:00.000Z',
          membership_cancel_requested_at: null,
          membership_cancel_reason: null,
          districts: [{ id: 1, name: 'Chennai', slug: 'chennai' }],
          categories: [{ id: 1, name: 'Politics', slug: 'politics' }],
        }),
      },
      service: jest.fn(() => ({
        sanitizeUser: sanitizeUserMock,
        getLedger: getLedgerMock,
        requestMembershipCancellation: cancelMembershipMock,
      })),
    };

    return {
      controller: accountControllerFactory({ strapi: strapiMock } as any),
      strapiMock,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('responds with sanitized profile data', async () => {
    const { controller } = buildController();
    const ctx = { ...ctxBase };
    await controller.profile(ctx);
    expect(ctx.body.id).toBe(42);
    expect(ctx.body.membershipStatus).toBe('active');
    expect(ctx.body.membershipReminderSentAt).toBe('2024-12-15T00:00:00.000Z');
    expect(ctx.body.districts[0].slug).toBe('chennai');
    expect(ctx.body.categories[0].name).toBe('Politics');
  });

  it('returns ledger entries', async () => {
    const { controller } = buildController();
    const ctx = { ...ctxBase };
    await controller.ledger(ctx);
    expect(ctx.body.entries).toHaveLength(1);
    expect(ctx.body.entries[0].externalReference).toBe('TX1');
  });

  it('queues cancellation requests', async () => {
    const { controller } = buildController();
    const ctx = {
      ...ctxBase,
      request: { body: { merchantTransactionId: 'TX1', reason: 'Need refund' } },
    };
    await controller.cancelMembership(ctx);
    expect(cancelMembershipMock).toHaveBeenCalledWith(42, {
      merchantTransactionId: 'TX1',
      reason: 'Need refund',
    });
    expect(ctx.body.success).toBe(true);
    expect(ctx.body.refundRequestId).toBe('REF123');
  });
});
