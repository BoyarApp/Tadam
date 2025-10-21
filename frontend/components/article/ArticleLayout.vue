<template>
  <article class="space-y-6">
    <header class="space-y-3">
      <VChip label color="primary" variant="flat" size="small">{{ article.category }}</VChip>
      <h1 class="text-3xl font-bold leading-tight text-balance">
        {{ article.title }}
      </h1>
      <p class="text-slate-500">{{ article.summary }}</p>
      <div class="flex flex-wrap items-center gap-3 text-sm text-slate-500">
        <span><VIcon size="small" icon="mdi-clock-outline" class="mr-1" /> {{ publishedAt }}</span>
        <span><VIcon size="small" icon="mdi-map-marker" class="mr-1" /> {{ article.districts.join(', ') }}</span>
        <VBtn variant="text" size="small" prepend-icon="mdi-volume-high">
          Listen (Coming soon)
        </VBtn>
      </div>
    </header>

    <VImg
      v-if="article.heroImage"
      :src="article.heroImage"
      class="rounded-lg border"
      height="300"
      cover
    />

    <VRow>
      <VCol cols="12" md="8">
        <VCard variant="flat" class="p-0">
          <VCardText class="space-y-4 article-body">
            <p v-for="(paragraph, index) in article.content" :key="index">
              {{ paragraph }}
            </p>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" md="4">
        <VCard variant="tonal" color="secondary">
          <VCardTitle class="font-semibold text-lg">Key Facts</VCardTitle>
          <VCardText>
            <ul class="list-disc space-y-2 pl-4 text-sm">
              <li v-for="(fact, index) in article.facts" :key="index">{{ fact }}</li>
            </ul>
          </VCardText>
        </VCard>

        <VCard variant="outlined" class="mt-4">
          <VCardTitle class="font-semibold text-base">Source Links</VCardTitle>
          <VList density="compact">
            <VListItem
              v-for="(link, index) in article.sources"
              :key="index"
              :href="link.url"
              target="_blank"
              append-icon="mdi-open-in-new"
            >
              <VListItemTitle>{{ link.label }}</VListItemTitle>
            </VListItem>
          </VList>
        </VCard>
      </VCol>
    </VRow>

    <VDivider />

    <section>
      <h2 class="text-xl font-semibold mb-3">Explain briefly</h2>
      <VAlert type="info" variant="tonal" class="border border-sky-200">
        AI digest coming soon. Editors will review every summarised version before it reaches readers.
      </VAlert>
    </section>

    <section>
      <h2 class="text-xl font-semibold mb-3">Related Stories</h2>
      <VSlideGroup show-arrows>
        <VSlideGroupItem v-for="related in article.related" :key="related.id">
          <VCard class="mr-4 w-64" variant="tonal">
            <VCardTitle class="text-sm font-semibold text-balance">
              {{ related.title }}
            </VCardTitle>
            <VCardText class="text-xs text-slate-500">
              {{ related.summary }}
            </VCardText>
          </VCard>
        </VSlideGroupItem>
      </VSlideGroup>
    </section>
  </article>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon';

export type ArticlePayload = {
  title: string;
  summary: string;
  category: string;
  content: string[];
  heroImage?: string;
  publishedAt: string;
  districts: string[];
  facts: string[];
  sources: Array<{ label: string; url: string }>;
  related: Array<{ id: string; title: string; summary: string }>;
};

const props = defineProps<{
  article: ArticlePayload;
}>();

const publishedAt = computed(
  () =>
    DateTime.fromISO(props.article.publishedAt).toLocaleString(DateTime.DATETIME_MED) ?? 'Recently',
);
</script>

<style scoped>
.article-body p {
  line-height: 1.8;
  font-size: 1.05rem;
}
</style>
