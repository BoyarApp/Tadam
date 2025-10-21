import crypto from 'node:crypto';
import { createChecksum, createStatusChecksum } from '../utils/signature';

type CreateOrderInput = {
  amount: number;
  redirectUrl?: string;
  userId: number;
};

type RefundInput = {
  merchantTransactionId: string;
  amount: number;
  userId: number;
  reason?: string;
};

const PAY_ENDPOINT = '/pg/v1/pay';
const REFUND_ENDPOINT = '/pg/v1/refund';

const getConfig = () => {
  const merchantId = process.env.PHONEPE_MERCHANT_ID;
  const saltKey = process.env.PHONEPE_SALT_KEY;
  const saltIndex = process.env.PHONEPE_SALT_INDEX ?? '1';
  const baseUrl = process.env.PHONEPE_BASE_URL ?? 'https://api-preprod.phonepe.com/apis/hermes';
  const callbackUrl = process.env.PHONEPE_CALLBACK_URL;
  const defaultRedirectUrl = process.env.PHONEPE_REDIRECT_URL;

  if (!merchantId || !saltKey) {
    throw new Error('PhonePe merchant configuration is missing. Please set PHONEPE_MERCHANT_ID and PHONEPE_SALT_KEY.');
  }

  if (!callbackUrl) {
    throw new Error('PhonePe callback URL missing. Set PHONEPE_CALLBACK_URL.');
  }

  return {
    merchantId,
    saltKey,
    saltIndex,
    baseUrl,
    callbackUrl,
    defaultRedirectUrl,
  };
};

const generateTransactionId = () => crypto.randomUUID().replace(/-/g, '').slice(0, 35);

export default ({ strapi }) => ({
  async createOrder({ amount, redirectUrl, userId }: CreateOrderInput) {
    const config = getConfig();
    const paiseAmount = Math.round(amount * 100);

    if (Number.isNaN(paiseAmount) || paiseAmount <= 0) {
      throw new Error('Invalid amount provided for PhonePe order.');
    }

    const merchantTransactionId = generateTransactionId();
    const payload = {
      merchantId: config.merchantId,
      merchantTransactionId,
      merchantUserId: `user-${userId}`,
      amount: paiseAmount,
      redirectUrl: redirectUrl ?? config.defaultRedirectUrl,
      redirectMode: 'REDIRECT',
      callbackUrl: config.callbackUrl,
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };

    if (!payload.redirectUrl) {
      throw new Error('Redirect URL required. Provide redirectUrl in request body or configure PHONEPE_REDIRECT_URL.');
    }

    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');
    const checksum = createChecksum(payloadBase64, PAY_ENDPOINT, config.saltKey, config.saltIndex);

    const response = await fetch(`${config.baseUrl}${PAY_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-CLIENT-ID': config.merchantId,
      },
      body: JSON.stringify({ request: payloadBase64 }),
    });

    const data = (await response.json()) as any;

    if (!response.ok || data?.success !== true) {
      strapi.log.error('PhonePe order create failed', data);
      throw new Error(data?.message ?? 'Unable to create PhonePe order.');
    }

    const paymentPageUrl =
      data?.data?.instrumentResponse?.redirectInfo?.url ?? data?.data?.redirectUrl ?? null;

    await strapi.entityService.create('api::payments-ledger.payments-ledger', {
      data: {
        entry_type: 'debit',
        amount,
        status: 'pending',
        user: userId,
        external_reference: merchantTransactionId,
        metadata: {
          merchantTransactionId,
          paymentPageUrl,
          provider: 'phonepe',
          raw: data?.data ?? null,
        },
      },
    });

    return {
      merchantTransactionId,
      paymentPageUrl,
    };
  },

  async handleWebhook(payload: any) {
    if (!payload?.merchantTransactionId) {
      return { success: false };
    }

    const merchantTransactionId = payload.merchantTransactionId;
    const status = (await this.fetchStatus(merchantTransactionId)) as any;
    const syncSuccess = await this.syncFromStatus(merchantTransactionId, status);

    return {
      success: syncSuccess,
      status,
    };
  },

  async syncFromStatus(merchantTransactionId: string, status: any) {
    if (!status?.success) {
      strapi.log.warn('PhonePe status lookup failed', status);
      await this.updateLedgerStatus(merchantTransactionId, 'failed', status);
      return false;
    }

    const state = status?.data?.state;
    if (state === 'COMPLETED') {
      await this.updateLedgerStatus(merchantTransactionId, 'completed', status);
      await this.activateMembership(merchantTransactionId);
      return true;
    }

    if (state === 'FAILED' || state === 'DECLINED') {
      await this.updateLedgerStatus(merchantTransactionId, 'failed', status);
      return false;
    }

    return true;
  },

  async fetchStatus(merchantTransactionId: string) {
    const config = getConfig();
    const path = `/pg/v1/status/${config.merchantId}/${merchantTransactionId}`;
    const checksum = createStatusChecksum(path, config.saltKey, config.saltIndex);

    const response = await fetch(`${config.baseUrl}${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-CLIENT-ID': config.merchantId,
      },
    });

    return (await response.json()) as any;
  },

  async updateLedgerStatus(merchantTransactionId: string, status: 'completed' | 'failed', metadata: any) {
    const entries = await strapi.entityService.findMany('api::payments-ledger.payments-ledger', {
      filters: { external_reference: merchantTransactionId },
      limit: 1,
    });

    if (!entries || entries.length === 0) {
      strapi.log.warn(`Payments ledger missing for transaction ${merchantTransactionId}`);
      return;
    }

    const entry = entries[0];

    await strapi.entityService.update('api::payments-ledger.payments-ledger', entry.id, {
      data: {
        status,
        metadata: {
          ...(entry.metadata ?? {}),
          statusPayload: metadata,
        },
      },
    });
  },

  async activateMembership(merchantTransactionId: string) {
    const entries = await strapi.entityService.findMany('api::payments-ledger.payments-ledger', {
      filters: { external_reference: merchantTransactionId },
      populate: ['user'],
      limit: 1,
    });

    if (!entries || entries.length === 0) {
      return;
    }

    const entry = entries[0];
    if (!entry.user?.id) {
      return;
    }

    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await strapi.entityService.update('plugin::users-permissions.user', entry.user.id, {
      data: {
        membership_status: 'active',
        membership_expires_at: nextMonth,
      },
    });
  },

  async initiateRefund({ merchantTransactionId, amount, userId, reason }: RefundInput) {
    const config = getConfig();
    const paiseAmount = Math.round(amount * 100);

    if (!merchantTransactionId) {
      throw new Error('Merchant transaction reference is required for refunds.');
    }

    if (Number.isNaN(paiseAmount) || paiseAmount <= 0) {
      throw new Error('Invalid amount supplied for refund.');
    }

    const refundTransactionId = generateTransactionId();
    const payload = {
      merchantId: config.merchantId,
      originalTransactionId: merchantTransactionId,
      merchantTransactionId: refundTransactionId,
      amount: paiseAmount,
      callbackUrl: config.callbackUrl,
      reason,
    };

    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64');
    const checksum = createChecksum(payloadBase64, REFUND_ENDPOINT, config.saltKey, config.saltIndex);

    const response = await fetch(`${config.baseUrl}${REFUND_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-CLIENT-ID': config.merchantId,
      },
      body: JSON.stringify({ request: payloadBase64 }),
    });

    const data = (await response.json()) as any;

    if (!response.ok || data?.success !== true) {
      strapi.log.error('PhonePe refund request failed', data);
      throw new Error(data?.message ?? 'Unable to initiate refund with PhonePe.');
    }

    strapi.log.info('PhonePe refund initiated', {
      userId,
      merchantTransactionId,
      refundTransactionId,
    });

    return {
      refundRequestId: data?.data?.merchantTransactionId ?? refundTransactionId,
      raw: data?.data ?? null,
      payload,
    };
  },
});
