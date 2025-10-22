<template>
  <VContainer class="max-w-lg py-10 space-y-6">
    <div class="space-y-2 text-center">
      <h1 class="text-3xl font-bold tracking-tight text-slate-900">Sign in required</h1>
      <p class="text-slate-500">
        Editorial tools require an authenticated Strapi session. Use the button below to open the Strapi console, sign in, and then return to continue.
      </p>
    </div>

    <VAlert type="info" variant="tonal" class="border border-blue-200">
      Use your newsroom credentials. For local development, ensure the Strapi server is running at
      <code>{{ cmsUrl }}</code>.
    </VAlert>

    <div class="flex flex-col gap-3">
      <VBtn :href="cmsAdminUrl" target="_blank" rel="noopener" color="primary" prepend-icon="mdi-open-in-new">
        Open Strapi Admin Console
      </VBtn>
      <VBtn variant="text" color="primary" @click="retry">
        I've signed in — take me back
      </VBtn>
    </div>
  </VContainer>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();

const redirectTarget = computed(() => {
  if (typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')) {
    return route.query.redirect;
  }
  return '/';
});

const cmsUrl = computed(() => config.public.apiBase ?? 'http://localhost:1337');
const cmsAdminUrl = computed(() => `${cmsUrl.value.replace(/\/$/, '')}/admin`);

const retry = () => {
  router.replace(redirectTarget.value);
};
</script>
