<template>
  <VContainer class="max-w-screen-2xl space-y-6 py-6">
    <VAlert
      v-if="assistError"
      type="error"
      variant="tonal"
      closable
      icon="mdi-alert"
      @click:close="assistError = null"
    >
      {{ assistError }}
    </VAlert>

    <VAlert
      v-if="workflowError"
      type="error"
      variant="tonal"
      closable
      icon="mdi-alert-circle"
      @click:close="workflowError = null"
    >
      {{ workflowError }}
    </VAlert>

    <VAlert
      v-if="workflowSuccess"
      type="success"
      variant="tonal"
      closable
      icon="mdi-check-circle"
      @click:close="workflowSuccess = null"
    >
      {{ workflowSuccess }}
    </VAlert>

    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-3xl font-semibold tracking-tight text-slate-900">Editorial Workbench</h1>
        <p class="text-slate-500">
          Prototype desk to manage copy, AI assist, sourcing, and workflow transitions for Sprint P0.2.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <VChip :color="workflowStatusColor" variant="flat" class="font-semibold uppercase tracking-wide">
          {{ workflowState.status }}
        </VChip>

        <VMenu>
          <template #activator="{ props: menuProps }">
            <VBtn
              v-bind="menuProps"
              variant="text"
              color="primary"
              prepend-icon="mdi-timeline-clock"
            >
              History
            </VBtn>
          </template>

          <VList
            density="comfortable"
            class="min-w-[320px]"
          >
            <VListSubheader>Workflow Timeline</VListSubheader>

            <VListItem
              v-for="(entry, index) in workflowHistory"
              :key="index"
              :title="formatHistory(entry)"
              :subtitle="formatHistoryMeta(entry)"
            />

            <VListItem
              v-if="workflowHistory.length === 0"
              title="No activity yet"
              subtitle="Transitions will appear here once actions are taken."
            />
          </VList>
        </VMenu>
      </div>
    </div>

    <VRow dense>
      <VCol cols="12" md="8" class="space-y-6">
        <VCard class="border border-slate-100 shadow-sm">
          <VCardTitle class="text-lg font-semibold text-slate-800">Story Metadata</VCardTitle>
          <VCardText class="space-y-4">
            <div class="grid gap-4 md:grid-cols-2">
              <VTextField
                v-model="form.title"
                label="Headline"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              />
              <VTextField
                v-model="form.summary"
                label="Dek / Summary"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              />
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <VSelect
                v-model="form.language"
                :items="languageOptions"
                label="Working Language"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              />
              <VSelect
                v-model="form.targetLanguage"
                :items="languageOptions"
                label="Target Language"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
              />
            </div>
          </VCardText>
        </VCard>

        <VCard class="border border-slate-100 shadow-sm">
          <VCardTitle class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <span class="text-lg font-semibold text-slate-800">Rich Text Editor</span>
            <div class="flex flex-wrap items-center gap-2">
              <VBtn
                color="primary"
                variant="flat"
                prepend-icon="mdi-translate"
                :loading="assistLoading.translate"
                @click="runTranslation"
              >
                Translate
              </VBtn>
              <VBtn
                color="deep-purple-darken-1"
                variant="flat"
                prepend-icon="mdi-spellcheck"
                :loading="assistLoading.spellcheck"
                @click="runSpellcheck"
              >
                Spell Check
              </VBtn>
              <VBtn
                color="indigo-darken-1"
                variant="flat"
                prepend-icon="mdi-tag-multiple"
                :loading="assistLoading.entity"
                @click="runEntityAssist"
              >
                Entity Assist
              </VBtn>
            </div>
          </VCardTitle>

          <VCardText class="space-y-4">
            <VTextarea
              v-model="form.content"
              variant="outlined"
              class="min-h-[240px]"
              auto-grow
              rows="10"
              density="comfortable"
              hide-details="auto"
              placeholder="Draft your copy here. Supports markdown and inline formatting."
            />

            <div v-if="translationResult" class="rounded border border-primary/20 bg-primary/5 p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-semibold text-primary-darken-1">
                    Translation ({{ translationResult.metadata?.targetLanguage ?? form.targetLanguage }})
                  </p>
                  <p class="text-xs text-slate-500">
                    Confidence {{ formatConfidence(translationResult.metadata?.confidence) }} • Logged at
                    {{ formatDate(translationResult.loggedAt) }}
                  </p>
                </div>
                <VBtn size="small" color="primary" variant="text" prepend-icon="mdi-content-copy" @click="applyTranslation">
                  Replace draft
                </VBtn>
              </div>
              <p class="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {{ translationResult.output }}
              </p>
            </div>

            <div v-if="spellcheckResult" class="rounded border border-deep-purple/20 bg-deep-purple/5 p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-semibold text-deep-purple-darken-2">Spellcheck Suggestions</p>
                  <p class="text-xs text-slate-500">
                    {{ spellcheckResult.suggestions.length }} suggestions • Confidence
                    {{ formatConfidence(spellcheckResult.metadata?.confidence) }}
                  </p>
                </div>
                <VBtn
                  size="small"
                  color="deep-purple-darken-1"
                  variant="text"
                  prepend-icon="mdi-auto-fix"
                  :disabled="spellcheckResult.suggestions.length === 0"
                  @click="applySpellcheck"
                >
                  Apply Suggestions
                </VBtn>
              </div>

              <VList v-if="spellcheckResult.suggestions.length" density="compact">
                <VListItem
                  v-for="(suggestion, index) in spellcheckResult.suggestions"
                  :key="index"
                  :title="suggestion.reason"
                  :subtitle="`Replace with “${suggestion.replacement}”`"
                />
              </VList>

              <p v-else class="mt-2 text-xs text-slate-500">
                No major issues detected. Good to go!
              </p>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <VCol cols="12" md="4" class="space-y-6">
        <SourceManager v-model="sources" />
        <FactBoxBuilder v-model="factEntries" />
        <EntityTagger v-model="entitySelection" :suggestions="entitySuggestions" @refresh="runEntityAssist" />
        <MediaManager v-model="mediaSelection" />

        <VCard class="border border-slate-100 shadow-sm">
          <VCardTitle class="text-lg font-semibold text-slate-800">
            Quality Checks
          </VCardTitle>

          <VCardText class="space-y-4">
            <VAlert v-if="qualityError" type="error" variant="tonal" class="border border-red-200">
              {{ qualityError }}
            </VAlert>

            <div
              v-else-if="!form.content.trim()"
              class="rounded border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-500"
            >
              Add article copy to evaluate quality signals.
            </div>

            <template v-else>
              <VProgressLinear
                v-if="qualityLoading"
                indeterminate
                color="primary"
                height="4"
                class="rounded"
              />

              <div v-if="qualityResult" class="space-y-4">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <div class="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <span>Status</span>
                      <VChip :color="qualityStatusChipColor" size="small" variant="flat">
                        {{ qualityResult.summary.status }}
                      </VChip>
                    </div>
                    <p v-if="qualityResult.summary.recommendation" class="text-xs text-slate-500">
                      {{ qualityResult.summary.recommendation }}
                    </p>
                  </div>
                  <span class="text-xs text-slate-400">
                    Evaluated {{ formatDate(qualityResult.evaluatedAt) }}
                  </span>
                </div>

                <div class="grid gap-3 text-sm text-slate-600">
                  <div class="flex items-center justify-between">
                    <span>Word Count</span>
                    <span class="font-semibold text-slate-800">{{ workflowMetrics.wordCount ?? 0 }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span>Average sentence</span>
                    <span class="font-semibold text-slate-800">
                      {{
                        typeof workflowMetrics.avgSentenceLength === 'number'
                          ? workflowMetrics.avgSentenceLength.toFixed(1)
                          : '—'
                      }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span>Readability</span>
                    <span class="font-semibold text-slate-800">
                      {{
                        workflowMetrics.readability
                          ? String(workflowMetrics.readability).toUpperCase()
                          : '—'
                      }}
                    </span>
                  </div>
                  <div>
                    <div class="flex items-center justify-between">
                      <span>Toxicity</span>
                      <span class="font-semibold text-slate-800">
                        {{ formatPercent(workflowMetrics.toxicityScore) }}
                      </span>
                    </div>
                    <VProgressLinear
                      :model-value="typeof workflowMetrics.toxicityScore === 'number' ? workflowMetrics.toxicityScore * 100 : 0"
                      color="primary"
                      height="6"
                      class="mt-1 rounded-full"
                    />
                  </div>
                </div>

                <div
                  v-if="suspiciousPhrases.length"
                  class="rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"
                >
                  <p class="text-xs font-semibold uppercase tracking-wide text-amber-darken-2">
                    Phrases to double-check
                  </p>
                  <ul class="mt-2 list-inside list-disc">
                    <li v-for="phrase in suspiciousPhrases" :key="phrase">
                      {{ phrase }}
                    </li>
                  </ul>
                </div>

                <VAlert
                  v-if="qualityFlags.length"
                  type="warning"
                  variant="tonal"
                  class="border border-amber-200"
                >
                  <p class="text-xs font-semibold uppercase tracking-wide text-amber-darken-2 mb-2">
                    Flags
                  </p>
                  <ul class="space-y-1 text-sm text-amber-900">
                    <li v-for="(flag, index) in qualityFlags" :key="index">
                      <strong class="uppercase text-xs text-amber-700">{{ flag.type }}</strong>
                      <span class="ml-1">{{ flag.message ?? 'Review recommended.' }}</span>
                    </li>
                  </ul>
                </VAlert>
              </div>
            </template>
          </VCardText>
        </VCard>

        <VCard class="border border-primary/20 bg-primary/5 shadow-sm">
          <VCardTitle class="text-lg font-semibold text-primary-darken-2">
            Workflow Actions
          </VCardTitle>

          <VCardText class="space-y-4">
            <VTextField
              v-model="workflowNote"
              label="Notes to desk"
              variant="outlined"
              density="comfortable"
              hide-details="auto"
              placeholder="Add context, follow-ups, or publishing instructions."
            />

            <div class="flex flex-wrap gap-2">
              <VBtn
                v-for="action in workflowActions"
                :key="action.action"
                :color="action.color"
                :loading="workflowLoading"
                :disabled="!articleId"
                @click="runWorkflowAction(action.action)"
              >
                {{ action.label }}
              </VBtn>
            </div>

            <VAlert
              v-if="!articleId"
              type="info"
              variant="tonal"
              icon="mdi-content-save"
            >
              Save the article in Strapi to enable workflow transitions.
            </VAlert>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { useRoute } from 'vue-router';
import { useEditorialAssist } from '~/composables/useEditorialAssist';
import type {
  EntitySuggestion,
  FactEntry,
  MediaSelection,
  SourceLink,
  SpellcheckAssistResponse,
  TranslateAssistResponse,
  QualityEvaluation,
} from '~/types/editorial';

definePageMeta({
  layout: 'default',
  middleware: ['editorial-auth'],
  ssr: false,
});

useHead({
  title: 'Editorial Workbench',
});

const route = useRoute();
const config = useRuntimeConfig();
const apiBase = config.public.apiBase ?? '';

const parseArticleId = (value: unknown) => {
  if (Array.isArray(value)) {
    return parseArticleId(value[0]);
  }
  if (value === undefined || value === null) {
    return null;
  }
  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const articleId = computed(() => parseArticleId(route.query.articleId));

const languageOptions = [
  { title: 'Tamil', value: 'ta' },
  { title: 'English', value: 'en' },
];

const form = reactive({
  title: '',
  summary: '',
  content: '',
  language: 'ta',
  targetLanguage: 'en',
});

const sources = ref<SourceLink[]>([]);
const factEntries = ref<FactEntry[]>([]);
const mediaSelection = ref<MediaSelection>({
  heroImage: '',
  gallery: [],
  supporting: [],
});

const entitySelection = ref<string[]>([]);
const entitySuggestions = ref<EntitySuggestion[]>([]);

const { loading: assistLoading, translate, spellcheck, entitySuggest, evaluateQuality } = useEditorialAssist();

const translationResult = ref<TranslateAssistResponse | null>(null);
const spellcheckResult = ref<SpellcheckAssistResponse | null>(null);
const assistError = ref<string | null>(null);

const workflowState = reactive({
  status: 'draft' as 'draft' | 'review' | 'approved' | 'published',
  history: [] as Array<Record<string, unknown>>,
});

const workflowNote = ref('');
const workflowLoading = ref(false);
const workflowError = ref<string | null>(null);
const workflowSuccess = ref<string | null>(null);

const qualityResult = ref<QualityEvaluation | null>(null);
const qualityError = ref<string | null>(null);

const workflowStatusColor = computed(() => {
  switch (workflowState.status) {
    case 'draft':
      return 'grey';
    case 'review':
      return 'warning';
    case 'approved':
      return 'secondary';
    case 'published':
      return 'success';
    default:
      return 'primary';
  }
});

let qualityRequestId = 0;

const qualityLoading = computed(() => assistLoading.quality);

const fallbackMetrics = computed(() => {
  const words = form.content.trim().split(/\s+/).filter(Boolean);
  const sentences = form.content
    .split(/[.!?]/)
    .map(sentence => sentence.trim())
    .filter(Boolean);

  const wordCount = words.length;
  const avgSentenceLength = sentences.length ? wordCount / sentences.length : wordCount;
  const readability = avgSentenceLength <= 12 ? 'easy' : avgSentenceLength <= 18 ? 'moderate' : 'complex';

  return {
    wordCount,
    avgSentenceLength,
    readability,
  };
});

const workflowMetrics = computed(() => ({
  ...fallbackMetrics.value,
  ...(qualityResult.value?.metrics ?? {}),
}));

const qualitySummary = computed(() => qualityResult.value?.summary ?? null);

const qualityStatusChipColor = computed(() => {
  const status = qualitySummary.value?.status?.toLowerCase?.() ?? '';
  if (!status) {
    return 'secondary';
  }
  if (status.includes('pass') || status === 'ok' || status === 'clear') {
    return 'success';
  }
  if (status.includes('review') || status.includes('warn')) {
    return 'warning';
  }
  if (status.includes('fail') || status.includes('block') || status.includes('reject')) {
    return 'error';
  }
  return 'secondary';
});

const qualityFlags = computed(() => qualityResult.value?.flags ?? []);

const suspiciousPhrases = computed(() => {
  const phrases = workflowMetrics.value.suspiciousPhrases;
  return Array.isArray(phrases) ? phrases : [];
});

const formatPercent = (value: unknown) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }
  return `${Math.round(value * 100)}%`;
};

const performQualityEvaluation = async (reason: 'initial' | 'content-change') => {
  const trimmed = form.content.trim();
  if (!trimmed) {
    qualityResult.value = null;
    qualityError.value = null;
    return;
  }

  const requestId = ++qualityRequestId;

  try {
    const response = await evaluateQuality({
      text: trimmed,
      language: form.language,
      articleId: articleId.value ?? undefined,
      metadata: {
        title: form.title,
        reason,
      },
    });

    if (requestId === qualityRequestId) {
      qualityResult.value = response;
      qualityError.value = null;
    }
  } catch (error: any) {
    if (requestId === qualityRequestId) {
      qualityError.value = error?.message ?? 'Unable to evaluate quality.';
    }
  }
};

const debouncedQualityEvaluation = useDebounceFn(() => performQualityEvaluation('content-change'), 800);

watch(
  () => [form.content, form.language],
  () => {
    if (!form.content.trim()) {
      qualityResult.value = null;
      qualityError.value = null;
      return;
    }
    debouncedQualityEvaluation();
  },
);

const workflowHistory = computed(() => [...workflowState.history].reverse());

const workflowActions = computed(() => {
  switch (workflowState.status) {
    case 'draft':
      return [{ action: 'submit' as const, label: 'Send to Review', color: 'primary' }];
    case 'review':
      return [
        { action: 'approve' as const, label: 'Approve Copy', color: 'success' },
        { action: 'requestChanges' as const, label: 'Request Changes', color: 'warning' },
      ];
    case 'approved':
      return [
        { action: 'publish' as const, label: 'Publish Now', color: 'success' },
        { action: 'requestChanges' as const, label: 'Request Changes', color: 'warning' },
      ];
    case 'published':
      return [{ action: 'requestChanges' as const, label: 'Request Changes', color: 'warning' }];
    default:
      return [];
  }
});

const ensureContentExists = () => {
  if (!form.content.trim()) {
    assistError.value = 'Add article copy before running editorial assist.';
    return false;
  }
  assistError.value = null;
  return true;
};

const runTranslation = async () => {
  if (!ensureContentExists()) {
    return;
  }
  try {
    translationResult.value = await translate({
      text: form.content,
      sourceLanguage: form.language,
      targetLanguage: form.targetLanguage,
      articleId: articleId.value ?? undefined,
      metadata: {
        title: form.title,
      },
    });
  } catch (error: any) {
    assistError.value = error?.message ?? 'Translation failed. Try again.';
  }
};

const runSpellcheck = async () => {
  if (!ensureContentExists()) {
    return;
  }
  try {
    spellcheckResult.value = await spellcheck({
      text: form.content,
      language: form.language,
      articleId: articleId.value ?? undefined,
      metadata: {
        title: form.title,
      },
    });
  } catch (error: any) {
    assistError.value = error?.message ?? 'Spellcheck failed. Try again.';
  }
};

const runEntityAssist = async () => {
  if (!ensureContentExists()) {
    return;
  }
  try {
    const result = await entitySuggest({
      text: form.content,
      language: form.language,
      articleId: articleId.value ?? undefined,
      metadata: {
        selected: entitySelection.value,
      },
    });
    entitySuggestions.value = result.entities ?? [];
  } catch (error: any) {
    assistError.value = error?.message ?? 'Entity suggestions failed. Try again.';
  }
};

const applyTranslation = () => {
  if (!translationResult.value) {
    return;
  }
  form.content = translationResult.value.output;
};

const applySpellcheck = () => {
  if (!spellcheckResult.value || spellcheckResult.value.suggestions.length === 0) {
    return;
  }

  let updated = form.content;
  const ordered = [...spellcheckResult.value.suggestions].sort((a, b) => b.position - a.position);

  ordered.forEach((suggestion) => {
    updated =
      updated.slice(0, suggestion.position) +
      suggestion.replacement +
      updated.slice(suggestion.position + suggestion.length);
  });

  form.content = updated;
};

const formatHistory = (entry: Record<string, unknown>) => {
  const status = typeof entry.toStatus === 'string' ? entry.toStatus : '';
  const role = typeof entry.actorRole === 'string' ? entry.actorRole : '';
  return [status, role && `• ${role}`].filter(Boolean).join(' ');
};

const formatHistoryMeta = (entry: Record<string, unknown>) => {
  const timestamp = typeof entry.at === 'string' ? formatDate(entry.at) : '';
  const note = typeof entry.note === 'string' ? entry.note : '';
  return [timestamp, note].filter(Boolean).join(' — ');
};

const formatConfidence = (value: unknown) => {
  if (typeof value !== 'number') {
    return '—';
  }
  return `${Math.round(value * 100)}%`;
};

const formatDate = (value: string) => {
  try {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const applyWorkflowFromArticle = (article: any) => {
  if (!article) {
    return;
  }

  const payload = article.attributes ?? article;
  if (payload.status) {
    workflowState.status = payload.status;
  }
  const history = payload.meta?.workflow?.history ?? payload.workflow?.history ?? null;
  if (Array.isArray(history)) {
    workflowState.history = history;
  }
};

const runWorkflowAction = async (action: 'submit' | 'approve' | 'publish' | 'requestChanges') => {
  if (!articleId.value) {
    return;
  }

  workflowLoading.value = true;
  workflowError.value = null;
  workflowSuccess.value = null;

  const endpointMap: Record<typeof action, string> = {
    submit: 'submit',
    approve: 'approve',
    publish: 'publish',
    requestChanges: 'request-changes',
  };

  try {
    const response = await $fetch(`${apiBase}/api/articles/${articleId.value}/${endpointMap[action]}`, {
      method: 'POST',
      credentials: 'include',
      body: {
        note: workflowNote.value || undefined,
        metadata: {
          action,
          triggeredFrom: 'editorial-workbench',
          metrics: {
            language: workflowMetrics.value.language ?? form.language,
            wordCount: workflowMetrics.value.wordCount ?? fallbackMetrics.value.wordCount,
            avgSentenceLength: workflowMetrics.value.avgSentenceLength,
            readability: workflowMetrics.value.readability,
            toxicityScore: workflowMetrics.value.toxicityScore ?? null,
            suspiciousPhrases: suspiciousPhrases.value,
            qualityStatus: qualitySummary.value?.status ?? null,
            qualityFlags: qualityFlags.value,
            evaluatedAt: qualityResult.value?.evaluatedAt ?? null,
            sources: sources.value.length,
            factEntries: factEntries.value.length,
            entities: entitySelection.value.length,
          },
        },
      },
    });

    const article = response?.data ?? response;
    applyWorkflowFromArticle(article);
    workflowSuccess.value = `Workflow moved to ${workflowState.status}.`;
    workflowNote.value = '';
  } catch (error: any) {
    workflowError.value =
      error?.data?.error?.message ?? error?.message ?? 'Could not update publishing workflow.';
  } finally {
    workflowLoading.value = false;
  }
};

const fetchArticle = async () => {
  if (!articleId.value) {
    return;
  }

  workflowLoading.value = true;
  workflowError.value = null;

  try {
    const response = await $fetch(
      `${apiBase}/api/articles/${articleId.value}?populate=entities,source_links,fact_box,hero_image,gallery`,
      {
        method: 'GET',
        credentials: 'include',
      },
    );

    const article = response?.data;
    if (!article) {
      return;
    }

    const attributes = article.attributes ?? {};
    form.title = attributes.title ?? '';
    form.summary = attributes.summary ?? '';
    form.content = attributes.content ?? '';
    form.language = attributes.language ?? 'ta';
    form.targetLanguage = 'en';

    if (Array.isArray(attributes.source_links)) {
      sources.value = attributes.source_links.map((source: any) => ({
        label: source.label ?? '',
        url: source.url ?? '',
      }));
    } else {
      sources.value = [];
    }

    if (Array.isArray(attributes.fact_box)) {
      factEntries.value = attributes.fact_box.map((item: any) => ({
        label: item.label ?? '',
        value: item.value ?? '',
        sources: Array.isArray(item.sources) ? item.sources : [],
      }));
    } else {
      factEntries.value = [];
    }

    entitySelection.value = Array.isArray(attributes.tags) ? attributes.tags : [];

    const hero = attributes.hero_image?.data?.attributes;
    const gallery = attributes.gallery?.data ?? [];

    mediaSelection.value = {
      heroImage: hero?.url ?? '',
      gallery: gallery.map((asset: any) => ({
        label: asset.attributes?.name ?? asset.id ?? '',
        url: asset.attributes?.url ?? '',
        thumbnail: asset.attributes?.formats?.thumbnail?.url ?? '',
      })),
      supporting: [],
    };

    applyWorkflowFromArticle(attributes);
    await performQualityEvaluation('initial');
  } catch (error: any) {
    workflowError.value =
      error?.data?.error?.message ?? error?.message ?? 'Unable to load article data.';
    qualityResult.value = null;
  } finally {
    workflowLoading.value = false;
  }
};

watch(
  () => articleId.value,
  (next, prev) => {
    if (next && next !== prev) {
      fetchArticle();
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
