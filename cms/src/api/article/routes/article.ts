export default {
  routes: [
    {
      method: 'GET',
      path: '/articles/related',
      handler: 'api::article.article.related',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/articles/:id/submit',
      handler: 'api::article.article.submitForReview',
      config: {
        policies: ['global::ensure-authenticated'],
      },
    },
    {
      method: 'POST',
      path: '/articles/:id/approve',
      handler: 'api::article.article.approve',
      config: {
        policies: ['global::ensure-authenticated'],
      },
    },
    {
      method: 'POST',
      path: '/articles/:id/publish',
      handler: 'api::article.article.publish',
      config: {
        policies: ['global::ensure-authenticated'],
      },
    },
    {
      method: 'POST',
      path: '/articles/:id/request-changes',
      handler: 'api::article.article.requestChanges',
      config: {
        policies: ['global::ensure-authenticated'],
      },
    },
  ],
};
