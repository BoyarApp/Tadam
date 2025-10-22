export default {
  routes: [
    {
      method: 'POST',
      path: '/seed',
      handler: 'seed.runSeeding',
      config: {
        policies: [],
        auth: false,
      },
    },
  ],
};
