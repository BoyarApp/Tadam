import accountServiceFactory from '../../src/api/account/services/account';

describe('account service', () => {
  it('sends membership expiry reminders', async () => {
    const upcomingUser = {
      id: 1,
      email: 'soon@example.com',
      name: 'Soon Expiring',
      membership_expires_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const findManyMock = jest.fn().mockResolvedValue([upcomingUser]);
    const updateMock = jest.fn();
    const emitMock = jest.fn();

    const service = accountServiceFactory({
      strapi: {
        entityService: {
          findMany: findManyMock,
          update: updateMock,
        },
        eventHub: {
          emit: emitMock,
        },
        log: {
          warn: jest.fn(),
        },
      },
    } as any);

    const result = await service.sendMembershipExpiryReminders();

    expect(result.sent).toBe(1);
    expect(updateMock).toHaveBeenCalledWith(
      'plugin::users-permissions.user',
      1,
      expect.objectContaining({
        data: expect.objectContaining({
          membership_reminder_sent_at: expect.any(String),
        }),
      }),
    );
    expect(emitMock).toHaveBeenCalledWith(
      'membership.reminder',
      expect.objectContaining({ userId: 1, email: 'soon@example.com' }),
    );
  });

  it('queues cancellation requests and triggers refund', async () => {
    const findManyMock = jest
      .fn()
      .mockResolvedValueOnce([
        {
          id: 99,
          amount: 299,
          status: 'completed',
          currency: 'INR',
          user: { id: 42 },
        },
      ])
      .mockResolvedValueOnce([]);
    const createMock = jest.fn();
    const updateMock = jest.fn();
    const emitMock = jest.fn();
    const initiateRefundMock = jest.fn().mockResolvedValue({ refundRequestId: 'REF-42' });

    const service = accountServiceFactory({
      strapi: {
        entityService: {
          findMany: findManyMock,
          create: createMock,
          update: updateMock,
        },
        eventHub: {
          emit: emitMock,
        },
        log: {
          warn: jest.fn(),
        },
        plugin: jest.fn(() => ({
          service: jest.fn(() => ({
            initiateRefund: initiateRefundMock,
          })),
        })),
      },
    } as any);

    const result = await service.requestMembershipCancellation(42, {
      merchantTransactionId: 'TX-COMPLETE',
      reason: 'Need to cancel',
    });

    expect(initiateRefundMock).toHaveBeenCalledWith(
      expect.objectContaining({ merchantTransactionId: 'TX-COMPLETE', amount: 299 }),
    );
    expect(createMock).toHaveBeenCalledWith(
      'api::payments-ledger.payments-ledger',
      expect.objectContaining({
        data: expect.objectContaining({
          entry_type: 'refund',
          status: 'pending',
        }),
      }),
    );
    expect(updateMock).toHaveBeenCalledWith(
      'plugin::users-permissions.user',
      42,
      expect.objectContaining({
        data: expect.objectContaining({
          membership_status: 'grace',
          membership_cancel_reason: 'Need to cancel',
        }),
      }),
    );
    expect(emitMock).toHaveBeenCalledWith(
      'membership.cancel.requested',
      expect.objectContaining({ userId: 42, refundRequestId: 'REF-42' }),
    );
    expect(result.refundRequestId).toBe('REF-42');
  });
});
