import type { Core } from '@strapi/strapi';

interface SecurityHeadersConfig {
  contentSecurityPolicy?: string | false;
  xFrameOptions?: string;
  strictTransportSecurity?: string;
  xContentTypeOptions?: string;
  referrerPolicy?: string;
  permissionsPolicy?: string;
}

const defaultConfig: SecurityHeadersConfig = {
  contentSecurityPolicy: false, // Let Strapi's default CSP handle this
  xFrameOptions: 'SAMEORIGIN',
  strictTransportSecurity: 'max-age=31536000; includeSubDomains',
  xContentTypeOptions: 'nosniff',
  referrerPolicy: 'strict-origin-when-cross-origin',
  permissionsPolicy: 'camera=(), microphone=(), geolocation=()',
};

export default (config: Partial<SecurityHeadersConfig> = {}, { strapi }: { strapi: Core.Strapi }) => {
  const opts = { ...defaultConfig, ...config };

  return async (ctx, next) => {
    // X-Frame-Options: Prevent clickjacking
    if (opts.xFrameOptions) {
      ctx.set('X-Frame-Options', opts.xFrameOptions);
    }

    // Strict-Transport-Security: Force HTTPS
    if (opts.strictTransportSecurity && ctx.request.protocol === 'https') {
      ctx.set('Strict-Transport-Security', opts.strictTransportSecurity);
    }

    // X-Content-Type-Options: Prevent MIME sniffing
    if (opts.xContentTypeOptions) {
      ctx.set('X-Content-Type-Options', opts.xContentTypeOptions);
    }

    // Referrer-Policy: Control referrer information
    if (opts.referrerPolicy) {
      ctx.set('Referrer-Policy', opts.referrerPolicy);
    }

    // Permissions-Policy: Control browser features
    if (opts.permissionsPolicy) {
      ctx.set('Permissions-Policy', opts.permissionsPolicy);
    }

    // Custom Content-Security-Policy if specified
    if (opts.contentSecurityPolicy && typeof opts.contentSecurityPolicy === 'string') {
      ctx.set('Content-Security-Policy', opts.contentSecurityPolicy);
    }

    // Remove X-Powered-By header
    ctx.remove('X-Powered-By');

    await next();
  };
};
