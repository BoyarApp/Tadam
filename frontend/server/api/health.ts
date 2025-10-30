export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  try {
    // Basic health check - can be extended to check API connectivity
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'tadam-frontend',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  } catch (error) {
    setResponseStatus(event, 503);
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'tadam-frontend',
      error: error.message,
    };
  }
});
