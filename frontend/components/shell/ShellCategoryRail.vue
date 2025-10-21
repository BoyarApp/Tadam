<template>
  <div class="border-b border-slate-200 bg-surface">
    <VContainer class="max-w-screen-xl">
      <div class="flex flex-wrap items-center gap-2 py-3">
        <VChip
          v-for="category in categories"
          :key="category.id"
          class="capitalize"
          color="primary"
          variant="tonal"
          size="small"
        >
          {{ category.name }}
        </VChip>
      </div>
    </VContainer>
  </div>
</template>

<script setup lang="ts">
const categories = [
  { id: 'top', name: 'Top Stories' },
  { id: 'politics', name: 'Politics' },
  { id: 'cinema', name: 'Cinema' },
  { id: 'science', name: 'Science' },
  { id: 'sports', name: 'Sports' },
  { id: 'business', name: 'Business' },
  { id: 'devotional', name: 'Devotional' },
  { id: 'schemes', name: 'Govt Schemes' },
  { id: 'galleries', name: 'Galleries' },
];
</script>
