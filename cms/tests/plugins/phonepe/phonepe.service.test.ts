import phonepeServiceFactory from '../../../src/plugins/phonepe/server/services/phonepe';

const originalEnv = process.env;

describe('PhonePe service', () => {
  beforeEach(() => {
    process.env = {
      ...originalEnv,
      PHONEPE_MERCHANT_ID: 'TEST-MERCHANT',
      PHONEPE_SALT_KEY: 'salt',
      PHONEPE_SALT_INDEX: '1',
      PHONEPE_BASE_URL: 'https://api-preprod.phonepe.com/apis/hermes',
      PHONEPE_CALLBACK_URL: 'http://localhost:1337/api/phonepe/webhook',
      PHONEPE_REDIRECT_URL: 'http://localhost:3000/account/membership/success',
    };

    global.fetch = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.resetAllMocks();
  });

  it('creates order and stores pending ledger entry', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          instrumentResponse: {
            redirectInfo: { url: 'https://phonepe.example/pay' },
          },
        },
      }),
    });

    const createMock = jest.fn();
    const service = phonepeServiceFactory({
      strapi: {
        entityService: {
          create: createMock,
        },
        log: {
          error: jest.fn(),
        },
      },
    } as any);

    const result = await service.createOrder({ amount: 299, userId: 42 });

    expect(result.paymentPageUrl).toContain('phonepe');
    expect(createMock).toHaveBeenCalledWith('api::payments-ledger.payments-ledger', expect.any(Object));
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain('/pg/v1/pay');
  });

  it('handles webhook success and updates membership', async () => {
    const updateMock = jest.fn();
    const findManyMock = jest
      .fn()
      .mockResolvedValueOnce([{ id: 5, metadata: { merchantTransactionId: 'TX123' } }])
      .mockResolvedValueOnce([{ id: 5, metadata: { merchantTransactionId: 'TX123' }, user: { id: 77 } }]);

    const serviceInstance = phonepeServiceFactory({
      strapi: {
        entityService: {
          findMany: findManyMock,
          update: updateMock,
        },
        log: {
          warn: jest.fn(),
          error: jest.fn(),
        },
      },
    } as any);

    serviceInstance.fetchStatus = jest.fn().mockResolvedValue({
      success: true,
      data: { state: 'COMPLETED' },
    });

    const response = await serviceInstance.handleWebhook({ merchantTransactionId: 'TX123' });

    expect(response.success).toBe(true);
    expect(updateMock).toHaveBeenCalledWith(
      'api::payments-ledger.payments-ledger',
      5,
      expect.objectContaining({ data: expect.objectContaining({ status: 'completed' }) }),
    );
    expect(updateMock).toHaveBeenCalledWith(
      'plugin::users-permissions.user',
      77,
      expect.objectContaining({ data: expect.objectContaining({ membership_status: 'active' }) }),
    );
  });
});
