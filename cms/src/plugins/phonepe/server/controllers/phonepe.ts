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
});
