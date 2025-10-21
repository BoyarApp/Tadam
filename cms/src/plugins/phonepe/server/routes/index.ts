export default {
  type: 'content-api',
  routes: [
    {
      method: 'POST',
      path: '/phonepe/order',
      handler: 'phonepe.order',
      config: {
        policies: ['global::ensure-authenticated'],
      },
    },
    {
      method: 'POST',
      path: '/phonepe/webhook',
      handler: 'phonepe.webhook',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/phonepe/status/:merchantTransactionId',
      handler: 'phonepe.status',
      config: {
        policies: ['global::ensure-authenticated'],
      },
    },
  ],
};
