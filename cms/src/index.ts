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
    // Temporarily disabled to allow initial startup
    // await seedInitialData(strapi);
    // await seedRoles(strapi);
  },
};
