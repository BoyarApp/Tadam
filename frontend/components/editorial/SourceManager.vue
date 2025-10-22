<template>
  <VCard variant="tonal" color="primary-lighten-5">
    <VCardTitle class="flex items-center justify-between gap-4">
      <span class="text-sm font-semibold uppercase tracking-wide text-primary">
        Source Links
      </span>
      <VBtn
        size="small"
        variant="outlined"
        color="primary"
        prepend-icon="mdi-plus"
        :disabled="sources.length >= maxSources"
        @click="addSource"
      >
        Add
      </VBtn>
    </VCardTitle>

    <VCardText class="space-y-4">
      <div
        v-if="sources.length === 0"
        class="rounded border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm text-slate-500"
      >
        Track your citations, reports, and government orders. These help fact checkers verify claims.
      </div>

      <VSlideGroup>
        <VSlideGroupItem
          v-for="(source, index) in sources"
          :key="index"
          class="w-full"
        >
          <VCard class="border border-slate-200 bg-white p-4 shadow-sm">
            <div class="flex items-start justify-between gap-3">
              <span class="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Source {{ index + 1 }}
              </span>
              <VBtn
                icon="mdi-close"
                size="x-small"
                variant="text"
                color="error"
                @click="removeSource(index)"
              />
            </div>

            <div class="mt-3 space-y-3">
              <VTextField
                v-model="source.label"
                label="Title / Reference"
                density="compact"
                hide-details="auto"
                variant="outlined"
                @update:model-value="emitSources"
              />

              <VTextField
                v-model="source.url"
                label="URL"
                type="url"
                density="compact"
                prefix="https://"
                hide-details="auto"
                variant="outlined"
                @update:model-value="emitSources"
              />
            </div>
          </VCard>
        </VSlideGroupItem>
      </VSlideGroup>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SourceLink } from '~/types/editorial';

const props = withDefaults(
  defineProps<{
    modelValue: SourceLink[];
    maxSources?: number;
  }>(),
  {
    modelValue: () => [],
    maxSources: 8,
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: SourceLink[]): void;
}>();

const sources = computed({
  get: () => props.modelValue,
  set: (value: SourceLink[]) => emit('update:modelValue', value),
});

const addSource = () => {
  if (sources.value.length >= props.maxSources) {
    return;
  }

  sources.value = [
    ...sources.value,
    {
      label: '',
      url: '',
    },
  ];
};

const removeSource = (index: number) => {
  sources.value = sources.value.filter((_, idx) => idx !== index);
};

const emitSources = () => {
  emit('update:modelValue', [...sources.value]);
};
</script>
