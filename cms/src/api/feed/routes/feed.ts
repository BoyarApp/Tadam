export default {
  routes: [
    {
      method: 'GET',
      path: '/feed',
      handler: 'feed.find',
      config: {
        auth: false,
      },
    },
  ],
};
