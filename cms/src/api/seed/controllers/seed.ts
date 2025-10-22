import { seedInitialData } from '../../../utils/seed-data';
import { seedRoles } from '../../../utils/seed-roles';

export default ({ strapi }) => ({
  async runSeeding(ctx) {
    try {
      strapi.log.info('Running manual seeding...');

      await seedInitialData(strapi);
      await seedRoles(strapi);

      strapi.log.info('Manual seeding completed successfully');

      ctx.body = {
        success: true,
        message: 'Seeding completed successfully',
      };
    } catch (error) {
      strapi.log.error('Manual seeding failed:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: 'Seeding failed',
        error: error.message,
      };
    }
  },
});
