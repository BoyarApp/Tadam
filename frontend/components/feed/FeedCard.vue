<template>
  <VCard variant="tonal" class="border border-slate-200">
    <VCardTitle class="flex flex-col items-start gap-1">
      <span class="text-sm uppercase tracking-wide text-slate-500">{{ card.category }}</span>
      <span class="text-lg font-semibold text-balance">{{ card.title }}</span>
    </VCardTitle>

    <VCardText class="text-slate-600">
      <p class="mb-2">
        {{ card.summary }}
      </p>
      <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <VChip size="x-small" color="secondary" variant="flat">
          Updated {{ timeAgo }}
        </VChip>
        <span>Reasons: {{ card.reason }}</span>
      </div>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon';
import type { FeedCard as FeedCardType } from '~/composables/useFeed';

const props = defineProps<{
  card: FeedCardType;
}>();

const timeAgo = computed(() =>
  DateTime.fromISO(props.card.publishedAt).toRelative({ base: DateTime.now() }) ?? 'just now',
);
</script>
