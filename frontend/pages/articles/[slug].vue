<template>
  <VContainer class="max-w-4xl py-8 space-y-8">
    <VAlert v-if="error" type="error" variant="tonal" class="mb-4">
      {{ error }}
    </VAlert>

    <div v-if="loading" class="flex justify-center items-center py-16">
      <VProgressCircular indeterminate color="primary" size="64" />
    </div>

    <ArticleLayout v-else-if="article" :article="article" />
  </VContainer>
</template>

<script setup lang="ts">
import type { ArticlePayload } from '~/components/article/ArticleLayout.vue';
import { useArticles } from '~/composables/useArticles';

const route = useRoute();
const { fetchArticle } = useArticles();

const article = ref<ArticlePayload | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

// Mock article for fallback
const MOCK_ARTICLE: ArticlePayload = {
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
      summary: 'An explainer on the city upcoming tertiary treatment plants.',
    },
    {
      id: 'rel-2',
      title: 'Rainwater harvesting checklist before the monsoon',
      summary: 'Tips from civic engineers for household storage units.',
    },
  ],
};

onMounted(async () => {
  const slug = String(route.params.slug);

  try {
    article.value = await fetchArticle(slug);
  } catch (err) {
    console.warn(`Article API unavailable for ${slug}, using mock data:`, err);
    article.value = MOCK_ARTICLE;
    error.value = null; // Don't show error for mock fallback
  } finally {
    loading.value = false;
  }
});

useHead(() => ({
  title: article.value ? `${article.value.title} | Tadam` : 'Article | Tadam',
  meta: article.value
    ? [
        { name: 'description', content: article.value.summary },
        { property: 'og:title', content: article.value.title },
        { property: 'og:description', content: article.value.summary },
        { property: 'og:type', content: 'article' },
      ]
    : [],
}));

definePageMeta({
  layout: 'default',
  key: (route: any) => route.fullPath,
});

if (process.client) {
  console.info(`Viewing article: ${route.params.slug}`);
}
</script>
