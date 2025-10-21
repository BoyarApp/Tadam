export default {
  type: 'admin',
  routes: [
    {
      method: 'POST',
      path: '/ai/translate',
      handler: 'ai-assist.translate',
      config: {
        policies: ['global::ensure-authenticated'],
      },
    },
    {
      method: 'POST',
      path: '/ai/spellcheck',
      handler: 'ai-assist.spellcheck',
      config: {
        policies: ['global::ensure-authenticated'],
      },
    },
    {
      method: 'POST',
      path: '/ai/entity-suggest',
      handler: 'ai-assist.entitySuggest',
      config: {
        policies: ['global::ensure-authenticated'],
      },
    },
  ],
};
