<template>
  <article class="space-y-8">
    <header class="space-y-4">
      <div v-if="categories.length" class="flex flex-wrap gap-2">
        <VChip
          v-for="category in categories"
          :key="category.id"
          color="primary"
          label
          size="small"
          variant="flat"
          class="uppercase tracking-wide"
        >
          {{ category.name }}
        </VChip>
      </div>

      <h1 class="text-4xl font-bold leading-tight text-balance">
        {{ article.title }}
      </h1>

      <p v-if="article.summary" class="text-lg text-slate-600">
        {{ article.summary }}
      </p>

      <div class="flex flex-wrap items-center gap-3 text-sm text-slate-500">
        <span v-if="publishedAt">
          <VIcon size="small" icon="mdi-clock-outline" class="mr-1" />
          {{ publishedAt }}
        </span>

        <span v-if="workflowStatus">
          <VIcon size="small" icon="mdi-checkbox-marked-circle-outline" class="mr-1" />
          {{ workflowStatus }}
        </span>

        <span v-if="districtNames.length">
          <VIcon size="small" icon="mdi-map-marker" class="mr-1" />
          {{ districtNames.join(', ') }}
        </span>

        <VBtn variant="text" size="small" prepend-icon="mdi-volume-high">
          Listen (Coming soon)
        </VBtn>
      </div>

      <div v-if="article.entities.length" class="flex flex-wrap gap-2 text-xs text-slate-500">
        <VChip
          v-for="entity in article.entities"
          :key="entity.id"
          size="small"
          color="grey-lighten-3"
          class="text-slate-600"
        >
          {{ entity.name }}
        </VChip>
      </div>
    </header>

    <figure v-if="article.heroImage" class="space-y-2">
      <VImg
        :src="article.heroImage.url"
        :alt="article.heroImage.alternativeText ?? article.title"
        class="rounded-lg border"
        height="360"
        cover
      />
      <figcaption v-if="article.heroImage.caption" class="text-xs text-slate-500">
        {{ article.heroImage.caption }}
      </figcaption>
    </figure>

    <VRow class="gap-y-6">
      <VCol cols="12" md="8">
        <section aria-label="Story body" class="space-y-6">
          <div v-if="articleContent" class="article-body" v-html="articleContent" />

          <VRow v-if="article.gallery.length" class="mt-4" dense>
            <VCol
              v-for="image in article.gallery"
              :key="image.id ?? image.url"
              cols="12"
              sm="6"
            >
              <VImg
                :src="image.url"
                :alt="image.alternativeText ?? article.title"
                height="220"
                class="rounded-lg border"
                cover
              />
              <p v-if="image.caption" class="mt-1 text-xs text-slate-500">
                {{ image.caption }}
              </p>
            </VCol>
          </VRow>
        </section>
      </VCol>

      <VCol cols="12" md="4" class="space-y-4">
        <VCard variant="tonal" color="secondary" aria-label="Key facts">
          <VCardTitle class="font-semibold text-lg">Key facts</VCardTitle>
          <VCardText>
            <ul v-if="article.factEntries.length" class="space-y-3">
              <li
                v-for="fact in article.factEntries"
                :key="fact.id ?? fact.label"
                class="text-sm leading-relaxed"
              >
                <span class="block font-semibold text-slate-700">{{ fact.label }}</span>
                <span class="text-primary font-semibold">{{ fact.value }}</span>
                <span v-if="fact.sources.length" class="block text-xs text-slate-500 mt-1">
                  Sources:
                  <span v-for="(source, index) in fact.sources" :key="source.id ?? source.url">
                    <NuxtLink
                      :to="source.url"
                      class="underline"
                      target="_blank"
                      rel="noopener"
                    >
                      {{ source.label }}
                    </NuxtLink>
                    <span v-if="index < fact.sources.length - 1">,&nbsp;</span>
                  </span>
                </span>
              </li>
            </ul>
            <p v-else class="text-sm text-slate-500">
              Fact box coming soon. Editors are still filling this story with quick takeaways.
            </p>
          </VCardText>
        </VCard>

        <VCard variant="outlined" aria-label="Source links">
          <VCardTitle class="font-semibold text-base">Sources</VCardTitle>
          <VList v-if="article.sourceLinks.length" density="compact">
            <VListItem
              v-for="link in article.sourceLinks"
              :key="link.id ?? link.url"
              :href="link.url"
              target="_blank"
              rel="noopener"
              append-icon="mdi-open-in-new"
            >
              <VListItemTitle>{{ link.label }}</VListItemTitle>
            </VListItem>
          </VList>
          <VCardText v-else class="text-sm text-slate-500">
            Editorial team hasn’t attached source documents for this report yet.
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VDivider />

    <section aria-label="Share story">
      <h2 class="text-xl font-semibold mb-3">Share this story</h2>
      <div class="flex flex-wrap gap-2">
        <VBtn
          variant="outlined"
          color="primary"
          prepend-icon="mdi-share-variant"
          @click="handleNativeShare"
        >
          Share
        </VBtn>
        <VBtn
          variant="outlined"
          color="primary"
          prepend-icon="mdi-whatsapp"
          :href="whatsappShareUrl"
          target="_blank"
        >
          WhatsApp
        </VBtn>
        <VBtn
          variant="outlined"
          color="primary"
          prepend-icon="mdi-twitter"
          :href="twitterShareUrl"
          target="_blank"
        >
          Twitter
        </VBtn>
        <VBtn
          variant="outlined"
          color="primary"
          prepend-icon="mdi-link-variant"
          @click="copyLink"
        >
          {{ linkCopied ? 'Copied!' : 'Copy link' }}
        </VBtn>
      </div>
    </section>

    <VDivider />

    <section aria-label="Explain briefly">
      <h2 class="text-xl font-semibold mb-3">Explain briefly</h2>
      <div v-if="article.explainers.length" class="flex flex-wrap gap-3">
        <VCard
          v-for="explainer in article.explainers"
          :key="explainer.id ?? explainer.title"
          class="w-full md:w-auto md:min-w-[220px]"
          variant="tonal"
          color="primary"
        >
          <VCardTitle class="text-sm font-semibold text-balance">{{ explainer.title }}</VCardTitle>
          <VCardText v-if="explainer.summary" class="text-xs text-slate-600">
            {{ explainer.summary }}
          </VCardText>
          <VCardActions v-if="explainer.url">
            <VBtn
              :href="explainer.url"
              target="_blank"
              rel="noopener"
              variant="text"
              size="small"
              append-icon="mdi-open-in-new"
            >
              Read explainer
            </VBtn>
          </VCardActions>
        </VCard>
      </div>
      <VAlert v-else type="info" variant="tonal" class="border border-sky-200">
        Our editors haven’t published a short explainer for this report yet.
        We’ll add a quick brief as soon as it’s ready.
      </VAlert>
    </section>

    <section v-if="article.related.length" aria-label="Related stories">
      <h2 class="text-xl font-semibold mb-3">Related stories</h2>
      <VSlideGroup show-arrows>
        <VSlideGroupItem v-for="related in article.related" :key="related.id">
          <VCard class="mr-4 w-64" variant="outlined">
            <VCardItem class="py-4">
              <VCardTitle class="text-sm font-semibold text-balance">
                {{ related.title }}
              </VCardTitle>
              <VCardSubtitle v-if="related.categories.length" class="text-xs uppercase tracking-wide">
                {{ related.categories[0].name }}
              </VCardSubtitle>
            </VCardItem>
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
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { DateTime } from 'luxon';
import sanitizeHtml from 'sanitize-html';
import type { ArticlePayload } from '~/types/articles';

const props = defineProps<{
  article: ArticlePayload;
}>();

const publishedAt = computed(() => {
  if (!props.article.publishedAt) {
    return null;
  }

  const parsed = DateTime.fromISO(props.article.publishedAt);
  return parsed.isValid ? parsed.toLocaleString(DateTime.DATETIME_MED) : props.article.publishedAt;
});

const workflowStatus = computed(() => props.article.workflow.lastStatus ?? null);

const categories = computed(() => props.article.categories.filter(category => Boolean(category?.name)));

const districtNames = computed(() => props.article.districts.map(district => district.name).filter(Boolean));

const articleContent = computed(() =>
  sanitizeHtml(props.article.content ?? '', {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'figure', 'figcaption']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'loading'],
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener', target: '_blank' }),
    },
  }),
);

const linkCopied = ref(false);
const route = useRoute();

const shareUrl = computed(() => {
  if (process.client) {
    return window.location.href;
  }
  return `https://tadam.news/articles/${route.params.slug}`;
});

const shareText = computed(() => `${props.article.title}\n\n${props.article.summary}`);

const whatsappShareUrl = computed(
  () =>
    `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText.value + '\n\n' + shareUrl.value)}`,
);

const twitterShareUrl = computed(
  () =>
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(props.article.title)}&url=${encodeURIComponent(shareUrl.value)}`,
);

const handleNativeShare = async () => {
  if (process.client && navigator.share) {
    try {
      await navigator.share({
        title: props.article.title,
        text: props.article.summary,
        url: shareUrl.value,
      });
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.warn('Share failed:', err);
      }
    }
  } else {
    await copyLink();
  }
};

const copyLink = async () => {
  if (process.client) {
    try {
      await navigator.clipboard.writeText(shareUrl.value);
      linkCopied.value = true;
      setTimeout(() => {
        linkCopied.value = false;
      }, 2000);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  }
};
</script>

<style scoped>
.article-body :deep(p) {
  line-height: 1.8;
  font-size: 1.05rem;
  margin-bottom: 1.25rem;
}

.article-body :deep(h2) {
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.article-body :deep(ul),
.article-body :deep(ol) {
  margin-left: 1.5rem;
  margin-bottom: 1.5rem;
}

.article-body :deep(a) {
  color: #0f766e;
  text-decoration: underline;
}

.article-body :deep(blockquote) {
  border-left: 4px solid #cbd5f5;
  padding-left: 1rem;
  color: #475569;
  font-style: italic;
}
</style>
