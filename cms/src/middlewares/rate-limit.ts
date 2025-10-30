import type { Core } from '@strapi/strapi';
import { getRedisClient } from '../utils/cache';

interface RateLimitConfig {
  max: number;
  window: number;
  skipOnError?: boolean;
  whitelist?: string[];
  blacklist?: string[];
}

const defaultConfig: RateLimitConfig = {
  max: 100, // requests per window
  window: 60000, // 1 minute
  skipOnError: true,
  whitelist: [],
  blacklist: [],
};

export default (config: Partial<RateLimitConfig> = {}, { strapi }: { strapi: Core.Strapi }) => {
  const opts = { ...defaultConfig, ...config };

  // Get rate limit config from environment
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX || String(opts.max), 10);
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW || String(opts.window), 10);

  return async (ctx, next) => {
    // Skip rate limiting for whitelisted IPs
    const clientIp = ctx.request.ip || ctx.ip;
    if (opts.whitelist?.includes(clientIp)) {
      return next();
    }

    // Block blacklisted IPs immediately
    if (opts.blacklist?.includes(clientIp)) {
      ctx.status = 403;
      ctx.body = { error: 'Forbidden' };
      return;
    }

    // Skip rate limiting for health checks
    if (ctx.path === '/_health') {
      return next();
    }

    // Generate rate limit key - use path prefix to group similar endpoints
    const pathKey = ctx.path.split('/').slice(0, 3).join('/');
    const key = `rate-limit:${clientIp}:${pathKey}`;

    try {
      const redis = getRedisClient(strapi);

      if (!redis) {
        // If Redis is not available, skip rate limiting (fail open)
        if (opts.skipOnError) {
          strapi.log.warn('Redis not available, skipping rate limit');
          return next();
        } else {
          ctx.status = 503;
          ctx.body = { error: 'Service temporarily unavailable' };
          return;
        }
      }

      // Ensure Redis is connected
      if (redis.status !== 'ready') {
        await redis.connect();
      }

      // Get current request count
      const requests = await redis.incr(key);

      // Set expiry on first request
      if (requests === 1) {
        await redis.pexpire(key, windowMs);
      }

      // Get TTL for rate limit headers
      const ttl = await redis.pttl(key);
      const resetTime = Date.now() + ttl;

      // Set rate limit headers
      ctx.set('X-RateLimit-Limit', String(maxRequests));
      ctx.set('X-RateLimit-Remaining', String(Math.max(0, maxRequests - requests)));
      ctx.set('X-RateLimit-Reset', String(Math.ceil(resetTime / 1000)));

      // Check if rate limit exceeded
      if (requests > maxRequests) {
        ctx.status = 429;
        ctx.body = {
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Try again in ${Math.ceil(ttl / 1000)} seconds.`,
          retryAfter: Math.ceil(ttl / 1000),
        };
        ctx.set('Retry-After', String(Math.ceil(ttl / 1000)));
        return;
      }

      await next();
    } catch (error) {
      strapi.log.error('Rate limit middleware error:', error);

      if (opts.skipOnError) {
        // Fail open - allow request to proceed
        return next();
      } else {
        // Fail closed - deny request
        ctx.status = 503;
        ctx.body = { error: 'Service temporarily unavailable' };
      }
    }
  };
};
