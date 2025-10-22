import { sanitize } from '@strapi/utils';

const { contentAPI } = sanitize as any;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export default ({ strapi }) => ({
  async sanitizeUser(user, ctx) {
    const schema = strapi.getModel('plugin::users-permissions.user');
    return contentAPI.output(user, schema, { auth: ctx.state.auth });
  },

  async getLedger(userId: number, limit = 10) {
    const entries = await strapi.entityService.findMany('api::payments-ledger.payments-ledger', {
      filters: { user: userId },
      sort: { createdAt: 'desc' },
      limit,
    });

    return entries.map((entry: any) => ({
      id: entry.id,
      amount: Number(entry.amount ?? 0),
      entryType: entry.entry_type,
      status: entry.status,
      currency: entry.currency ?? 'INR',
      externalReference: entry.external_reference ?? entry.metadata?.merchantTransactionId ?? null,
      createdAt: entry.createdAt ?? entry.created_at,
      metadata: entry.metadata ?? null,
    }));
  },

  async sendMembershipExpiryReminders(windowDays = 3) {
    const now = new Date();
    const windowEnd = new Date(now.getTime() + windowDays * DAY_IN_MS);
    const reminderCutoff = now.toISOString();
    const expiresBefore = windowEnd.toISOString();

    const users = await strapi.entityService.findMany('plugin::users-permissions.user', {
      filters: {
        membership_status: 'active',
        membership_expires_at: {
          $gte: reminderCutoff,
          $lte: expiresBefore,
        },
        $or: [
          {
            membership_reminder_sent_at: {
              $null: true,
            },
          },
          {
            membership_reminder_sent_at: {
              $lt: reminderCutoff,
            },
          },
        ],
      },
      fields: ['id', 'email', 'name', 'membership_expires_at'],
    });

    if (!users?.length) {
      return { sent: 0, userIds: [] };
    }

    const reminderSentAt = now.toISOString();
    const notifiedIds: number[] = [];

    for (const user of users) {
      try {
        await strapi.entityService.update('plugin::users-permissions.user', user.id, {
          data: {
            membership_reminder_sent_at: reminderSentAt,
          },
        });

        if (strapi.eventHub?.emit) {
          strapi.eventHub.emit('membership.reminder', {
            userId: user.id,
            email: user.email,
            name: user.name,
            membershipExpiresAt: user.membership_expires_at,
          });
        }

        notifiedIds.push(user.id);
      } catch (error) {
        strapi.log?.warn?.('Failed to queue membership reminder', {
          userId: user.id,
          error: error?.message ?? error,
        });
      }
    }

    return {
      sent: notifiedIds.length,
      userIds: notifiedIds,
      reminderSentAt,
    };
  },

  async requestMembershipCancellation(userId: number, { merchantTransactionId, reason }: { merchantTransactionId: string; reason?: string }) {
    if (!merchantTransactionId) {
      throw new Error('Merchant transaction ID is required.');
    }

    const entries = await strapi.entityService.findMany('api::payments-ledger.payments-ledger', {
      filters: {
        external_reference: merchantTransactionId,
      },
      populate: { user: true },
      limit: 1,
    });

    if (!entries?.length) {
      const error = new Error('Transaction not found.');
      (error as any).status = 404;
      throw error;
    }

    const entry = entries[0];
    if (entry.user?.id && entry.user.id !== userId) {
      const error = new Error('Forbidden');
      (error as any).status = 403;
      throw error;
    }

    if (entry.status !== 'completed') {
      const error = new Error('Only completed payments can be cancelled.');
      (error as any).status = 400;
      throw error;
    }

    const sanitizedReason =
      typeof reason === 'string'
        ? reason.trim().slice(0, 500)
        : null;

    const existingRefunds = await strapi.entityService.findMany('api::payments-ledger.payments-ledger', {
      filters: {
        entry_type: 'refund',
        external_reference: merchantTransactionId,
        user: userId,
        status: 'pending',
      },
      limit: 1,
    });

    if (existingRefunds?.length) {
      const error = new Error('A refund is already pending for this transaction.');
      (error as any).status = 409;
      throw error;
    }

    const refundRequest = await strapi.plugin('phonepe').service('phonepe').initiateRefund({
      merchantTransactionId,
      amount: Number(entry.amount ?? 0),
      userId,
      reason: sanitizedReason ?? undefined,
    });

    const requestTimestamp = new Date().toISOString();

    await strapi.entityService.create('api::payments-ledger.payments-ledger', {
      data: {
        entry_type: 'refund',
        amount: entry.amount,
        currency: entry.currency ?? 'INR',
        status: 'pending',
        user: userId,
        external_reference: merchantTransactionId,
        notes: sanitizedReason ?? undefined,
        metadata: {
          merchantTransactionId,
          originalLedgerId: entry.id,
          refundRequestId: refundRequest?.refundRequestId ?? null,
          refundPayload: refundRequest ?? null,
        },
      },
    });

    await strapi.entityService.update('plugin::users-permissions.user', userId, {
      data: {
        membership_status: 'grace',
        membership_cancel_requested_at: requestTimestamp,
        membership_cancel_reason: sanitizedReason ?? null,
      },
    });

    if (strapi.eventHub?.emit) {
      strapi.eventHub.emit('membership.cancel.requested', {
        userId,
        merchantTransactionId,
        amount: Number(entry.amount ?? 0),
        reason: sanitizedReason,
        refundRequestId: refundRequest?.refundRequestId ?? null,
      });
    }

    return {
      refundRequestId: refundRequest?.refundRequestId ?? null,
      requestedAt: requestTimestamp,
    };
  },
});
