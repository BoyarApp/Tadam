export default ({ strapi }) => ({
  async order(ctx) {
    const { amount, redirectUrl } = ctx.request.body ?? {};
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized('Authentication required.');
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return ctx.badRequest('Invalid amount supplied.');
    }

    try {
      const result = await strapi.plugin('phonepe').service('phonepe').createOrder({
        amount,
        redirectUrl,
        userId,
      });

      ctx.body = {
        success: true,
        ...result,
      };
    } catch (error) {
      strapi.log.error('PhonePe order error', error);
      ctx.badRequest('Unable to initiate payment at this time.');
    }
  },

  async webhook(ctx) {
    try {
      const payload = ctx.request.body ?? {};
      const result = await strapi.plugin('phonepe').service('phonepe').handleWebhook(payload);
      ctx.body = {
        success: true,
        data: result,
      };
    } catch (error) {
      strapi.log.error('PhonePe webhook error', error);
      ctx.body = {
        success: false,
      };
    }
  },

  async status(ctx) {
    const { merchantTransactionId } = ctx.params ?? {};
    const userId = ctx.state.user?.id;

    if (!userId) {
      return ctx.unauthorized('Authentication required.');
    }

    if (!merchantTransactionId) {
      return ctx.badRequest('Missing transaction reference.');
    }

    const entries = await strapi.entityService.findMany('api::payments-ledger.payments-ledger', {
      filters: { external_reference: merchantTransactionId },
      populate: ['user'],
      limit: 1,
    });

    if (!entries || entries.length === 0) {
      return ctx.notFound('Transaction not found.');
    }

    const entry = entries[0];
    if (entry.user?.id && entry.user.id !== userId) {
      return ctx.forbidden('You do not have access to this transaction.');
    }

    const service = strapi.plugin('phonepe').service('phonepe');
    const status = await service.fetchStatus(merchantTransactionId);
    await service.syncFromStatus(merchantTransactionId, status);

    ctx.body = {
      success: true,
      status,
    };
  },
});
