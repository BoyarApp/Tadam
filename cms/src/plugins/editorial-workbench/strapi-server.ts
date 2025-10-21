import type { Core } from '@strapi/strapi';

export default ({ strapi }: { strapi: Core.Strapi }) => {
  // Initialize plugin services or cron jobs here if needed.
  strapi.log.info('editorial-workbench plugin loaded');

  return {
    register() {},
    bootstrap() {},
  };
};
