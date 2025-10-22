// import type { Core } from '@strapi/strapi';

import { seedInitialData } from './utils/seed-data';
import { seedRoles } from './utils/seed-roles';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    // Bootstrap seeding temporarily disabled to avoid initialization conflicts
    // Run seeding manually after first admin user is created via:
    // curl -X POST http://localhost:1337/api/seed (requires admin auth)
    strapi.log.info('Strapi bootstrap completed. Run seeding manually if needed.');
  },
};
