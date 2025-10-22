import { useSessionStore } from '~/stores/session';

export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) {
    return;
  }

  const session = useSessionStore();

  if (!session.profile && !session.loading) {
    await session.fetchProfile(true);
  }

  if (!session.profile) {
    const redirect = encodeURIComponent(to.fullPath);
    return navigateTo(`/login?redirect=${redirect}`);
  }

  if (!session.isEditorial) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Editorial access requires author or editor permissions.',
    });
  }
});
