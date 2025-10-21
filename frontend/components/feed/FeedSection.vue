<template>
  <section class="py-6">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-xl font-semibold">{{ title }}</h2>
      <span v-if="badge" class="text-sm text-slate-500">{{ badge }}</span>
    </div>

    <VRow dense>
      <VCol
        v-for="item in items"
        :key="item.id"
        cols="12"
      >
        <FeedCard :card="item" />
      </VCol>
    </VRow>
  </section>
</template>

<script setup lang="ts">
import type { FeedCard as FeedCardType } from '~/composables/useFeed';

defineProps<{
  title: string;
  items: FeedCardType[];
  badge?: string;
}>();
</script>
