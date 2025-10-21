<template>
  <VContainer class="max-w-4xl py-8 space-y-8">
    <ArticleLayout :article="article" />
  </VContainer>
</template>

<script setup lang="ts">
import type { ArticlePayload } from '~/components/article/ArticleLayout.vue';

const route = useRoute();

const article = ref<ArticlePayload>({
  title: 'Metro water board announces new rationing schedule for Chennai',
  summary:
    'The Metro Water board introduces an optimised supply cycle for north Chennai zones starting next week.',
  category: 'Civic',
  content: [
    'The Chennai Metro Water Supply and Sewerage Board (CMWSSB) on Monday announced a revised distribution schedule aimed at reducing tanker wait times across North Chennai.',
    'Under the new schedule, wards in Tondiarpet and Royapuram regions will receive supply on alternate days with extended timings between 6am and 1pm.',
    'Officials noted that the decision follows resident feedback gathered through the new grievance portal. The board also stated that 38 additional tankers are being deployed ahead of summer demand.',
  ],
  heroImage: 'https://images.unsplash.com/photo-1506023918151-50f3c912c43a?auto=format&fit=crop&w=1080&q=80',
  publishedAt: new Date().toISOString(),
  districts: ['Chennai'],
  facts: [
    'New schedule effective from next Monday.',
    '38 additional water tankers deployed for North Chennai.',
    'Dedicated helpline: 044-4567 4567',
  ],
  sources: [
    { label: 'CMWSSB circular (PDF)', url: 'https://cmwssb.tn.gov.in/' },
    { label: 'Collector press note', url: 'https://chennai.nic.in/' },
  ],
  related: [
    {
      id: 'rel-1',
      title: 'How Chennai plans to recycle 40% of wastewater by 2026',
      summary: 'An explainer on the city’s upcoming tertiary treatment plants.',
    },
    {
      id: 'rel-2',
      title: 'Rainwater harvesting checklist before the monsoon',
      summary: 'Tips from civic engineers for household storage units.',
    },
  ],
});

useHead({
  title: `${article.value.title} | Tadam`,
  meta: [
    { name: 'description', content: article.value.summary },
    { property: 'og:title', content: article.value.title },
    { property: 'og:description', content: article.value.summary },
    { property: 'og:type', content: 'article' },
  ],
});

definePageMeta({
  layout: 'default',
  key: route => route.fullPath,
});

if (process.client) {
  console.info(`Viewing article: ${route.params.slug}`);
}
</script>
