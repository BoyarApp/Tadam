import type { Context } from 'koa';

export default async (ctx: Context, next: () => Promise<unknown>) => {
  if (!ctx.state.user) {
    return ctx.unauthorized('Authentication required.');
  }

  return next();
};
