export default {
  routes: [
    {
      method: 'GET',
      path: '/account/profile',
      handler: 'account.profile',
      config: {
        policies: ['global::ensure-authenticated'],
      },
    },
    {
      method: 'GET',
      path: '/account/ledger',
      handler: 'account.ledger',
      config: {
        policies: ['global::ensure-authenticated'],
      },
    },
    {
      method: 'POST',
      path: '/account/membership/cancel',
      handler: 'account.cancelMembership',
      config: {
        policies: ['global::ensure-authenticated'],
      },
    },
  ],
};
