<template>
  <VContainer class="max-w-screen-xl py-6 space-y-8">
    <VAlert
      v-if="!isOnline"
      type="warning"
      variant="tonal"
      icon="mdi-wifi-off"
      class="border border-amber-200"
    >
      You are offline. Showing cached stories.
    </VAlert>

    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-balance">Curated for you</h1>
        <p class="text-slate-500">
          Personalised mix of your districts, interests, and statewide essentials.
        </p>
      </div>
      <VBtn color="primary" prepend-icon="mdi-refresh" :loading="loading" @click="refresh">
        Refresh feed
      </VBtn>
    </div>

    <FeedSection
      v-for="feed in feeds"
      :key="feed.slot"
      :title="feed.title"
      :items="feed.items"
      :badge="feed.slot === 'my-mix' ? preferenceBadge : undefined"
    />
  </VContainer>
</template>

<script setup lang="ts">
import { useOnline } from '@vueuse/core';
import { useFeed } from '~/composables/useFeed';
import { usePreferencesStore } from '~/stores/preferences';

const { feeds, loading, refresh } = useFeed();
const preferences = usePreferencesStore();
const isOnline = useOnline();

const preferenceBadge = computed(() => {
  if (preferences.selectedDistricts.length === 0) {
    return 'Set your districts to personalise further';
  }
  return `${preferences.selectedDistricts.map(district => district.name).join(', ')}`;
});
</script>
