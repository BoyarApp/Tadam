export default {
  default: {
    throttling: {
      windowInSeconds: 60,
      maxRequests: 60,
    },
    providers: {
      ai: {
        baseUrl: process.env.EDITORIAL_AI_BASE_URL ?? '',
        apiKey: process.env.EDITORIAL_AI_API_KEY ?? '',
        timeoutMs: Number.parseInt(process.env.EDITORIAL_AI_TIMEOUT_MS ?? '', 10) || 8000,
      },
      compliance: {
        baseUrl: process.env.EDITORIAL_COMPLIANCE_BASE_URL ?? '',
        apiKey: process.env.EDITORIAL_COMPLIANCE_API_KEY ?? '',
        timeoutMs:
          Number.parseInt(process.env.EDITORIAL_COMPLIANCE_TIMEOUT_MS ?? '', 10) || 8000,
      },
    },
  },
  validator() {},
};
