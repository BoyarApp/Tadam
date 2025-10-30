export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'global::security-headers',
    config: {},
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  {
    name: 'global::rate-limit',
    config: {
      max: 100,
      window: 60000,
      skipOnError: true,
    },
  },
];
