export default {
  async check(ctx) {
    try {
      // Check database connection
      await strapi.db.connection.raw('SELECT 1');

      ctx.body = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'tadam-cms',
        version: '1.0.0',
      };
      ctx.status = 200;
    } catch (error) {
      strapi.log.error('Health check failed:', error);
      ctx.body = {
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'tadam-cms',
        error: error.message,
      };
      ctx.status = 503;
    }
  },
};
