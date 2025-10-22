export default ({ strapi }) => ({
  async profile(ctx) {
    const userId = ctx.state.user?.id;
    if (!userId) {
      return ctx.unauthorized('Authentication required');
    }

    const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId, {
      populate: ['districts', 'categories'],
    });

    const sanitized = await strapi.service('api::account.account').sanitizeUser(user, ctx);

    ctx.body = {
      id: sanitized.id,
      email: sanitized.email,
      name: sanitized.name ?? sanitized.username ?? null,
      membershipStatus: sanitized.membership_status ?? 'free',
      membershipExpiresAt: sanitized.membership_expires_at ?? null,
      membershipReminderSentAt: sanitized.membership_reminder_sent_at ?? null,
      membershipCancelRequestedAt: sanitized.membership_cancel_requested_at ?? null,
      membershipCancelReason: sanitized.membership_cancel_reason ?? null,
      districts: sanitized.districts?.map((district: any) => ({
        id: district.slug ?? district.id,
        name: district.name,
        slug: district.slug ?? null,
      })) ?? [],
      categories: sanitized.categories?.map((category: any) => ({
        id: category.slug ?? category.id,
        name: category.name,
        slug: category.slug ?? null,
      })) ?? [],
    };
  },

  async ledger(ctx) {
    const userId = ctx.state.user?.id;
    if (!userId) {
      return ctx.unauthorized('Authentication required');
    }

    const entries = await strapi.service('api::account.account').getLedger(userId, 20);

    ctx.body = {
      entries,
    };
  },

  async cancelMembership(ctx) {
    const userId = ctx.state.user?.id;
    if (!userId) {
      return ctx.unauthorized('Authentication required');
    }

    const { merchantTransactionId, reason } = ctx.request.body ?? {};

    if (!merchantTransactionId || typeof merchantTransactionId !== 'string') {
      return ctx.badRequest('Provide a valid merchant transaction reference.');
    }

    try {
      const result = await strapi.service('api::account.account').requestMembershipCancellation(userId, {
        merchantTransactionId,
        reason,
      });

      ctx.body = {
        success: true,
        ...result,
      };
    } catch (error) {
      const status = (error as any)?.status ?? 400;
      if (status === 403) {
        return ctx.forbidden('You do not have access to this transaction.');
      }
      if (status === 404) {
        return ctx.notFound('Transaction not found.');
      }
      if (status === 409) {
        ctx.status = 409;
        ctx.body = {
          error: 'A refund is already pending for this transaction.',
        };
        return;
      }
      ctx.badRequest((error as any)?.message ?? 'Unable to process cancellation request.');
    }
  },
});
