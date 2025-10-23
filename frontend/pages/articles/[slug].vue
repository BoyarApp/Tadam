<template>
  <VContainer class="max-w-4xl py-8 space-y-8">
    <VAlert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
      {{ errorMessage }}
    </VAlert>

    <div v-if="pending" class="flex justify-center items-center py-16">
      <VProgressCircular indeterminate color="primary" size="64" />
    </div>

    <ArticleLayout v-else-if="article" :article="article" />
    <div v-else class="py-16 text-center text-slate-500">
      The requested article is unavailable or may have been unpublished.
    </div>
  </VContainer>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import type { ArticlePayload } from '~/types/articles';
import { useArticles } from '~/composables/useArticles';
import { ApiException } from '~/composables/useApi';

const route = useRoute();
const { fetchArticle } = useArticles();

const slug = computed(() => String(route.params.slug));

const { data: article, pending, error } = await useAsyncData<ArticlePayload>(
  `article:${slug.value}`,
  () => fetchArticle(slug.value),
  {
    watch: [slug],
  },
);

const errorMessage = computed(() => {
  if (!error.value) {
    return null;
  }

  if (error.value instanceof ApiException) {
    return error.value.message;
  }

  return 'We could not load this article. Please try again in a bit.';
});

useHead(() => {
  if (!article.value) {
    return { title: 'Article | Tadam' };
  }

  return {
    title: `${article.value.title} | Tadam`,
    meta: [
      { name: 'description', content: article.value.summary },
      { property: 'og:title', content: article.value.title },
      { property: 'og:description', content: article.value.summary },
      { property: 'og:type', content: 'article' },
    ],
  };
});

definePageMeta({
  layout: 'default',
  key: (route: any) => route.fullPath,
});

if (process.client) {
  watch(
    () => route.params.slug,
    newSlug => {
      console.info(`Viewing article: ${newSlug}`);
    },
    { immediate: true },
  );
}
</script>
