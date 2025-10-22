<template>
  <VCard variant="tonal" color="teal-lighten-5">
    <VCardTitle class="flex items-center justify-between gap-4">
      <span class="text-sm font-semibold uppercase tracking-wide text-teal-darken-2">
        Fact Box
      </span>
      <VBtn
        size="small"
        variant="outlined"
        color="teal-darken-1"
        prepend-icon="mdi-plus"
        :disabled="entries.length >= maxEntries"
        @click="addEntry"
      >
        Add Fact
      </VBtn>
    </VCardTitle>

    <VCardText class="space-y-4">
      <div
        v-if="entries.length === 0"
        class="rounded border border-dashed border-teal-200 bg-white/70 px-4 py-3 text-sm text-slate-600"
      >
        Highlight quick facts readers need to know — numbers, timelines, or key takeaways. Attach source
        URLs where relevant.
      </div>

      <VExpansionPanels variant="accordion">
        <VExpansionPanel
          v-for="(entry, index) in entries"
          :key="index"
        >
          <VExpansionPanelTitle class="text-sm font-semibold text-slate-600">
            {{ entry.label || `Fact ${index + 1}` }}
          </VExpansionPanelTitle>

          <VExpansionPanelText>
            <div class="space-y-4">
              <VTextField
                v-model="entry.label"
                label="Headline"
                density="compact"
                hide-details="auto"
                variant="outlined"
                @update:model-value="emitEntries"
              />

              <VTextarea
                v-model="entry.value"
                label="Detail"
                density="compact"
                rows="3"
                auto-grow
                hide-details="auto"
                variant="outlined"
                @update:model-value="emitEntries"
              />

              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-semibold uppercase tracking-wide text-teal-darken-2">
                    Sources
                  </span>
                  <VBtn
                    size="x-small"
                    variant="text"
                    color="teal-darken-1"
                    prepend-icon="mdi-plus"
                    :disabled="entry.sources.length >= maxSourcesPerFact"
                    @click="addFactSource(index)"
                  >
                    Add Source
                  </VBtn>
                </div>

                <div
                  v-if="entry.sources.length === 0"
                  class="rounded border border-dashed border-teal-100 px-3 py-2 text-xs text-teal-darken-1"
                >
                  Optional links that back this fact.
                </div>

                <div class="space-y-2">
                  <div
                    v-for="(source, sourceIndex) in entry.sources"
                    :key="sourceIndex"
                    class="flex items-center gap-2"
                  >
                    <VTextField
                      v-model="entry.sources[sourceIndex]"
                      label="Source URL"
                      density="compact"
                      hide-details="auto"
                      variant="outlined"
                      class="flex-1"
                      @update:model-value="emitEntries"
                    />
                    <VBtn
                      icon="mdi-close"
                      size="x-small"
                      variant="text"
                      color="error"
                      @click="removeFactSource(index, sourceIndex)"
                    />
                  </div>
                </div>
              </div>

              <div class="flex justify-end border-t border-slate-100 pt-3">
                <VBtn
                  variant="text"
                  color="error"
                  prepend-icon="mdi-delete"
                  @click="removeEntry(index)"
                >
                  Remove Fact
                </VBtn>
              </div>
            </div>
          </VExpansionPanelText>
        </VExpansionPanel>
      </VExpansionPanels>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { FactEntry } from '~/types/editorial';

const props = withDefaults(
  defineProps<{
    modelValue: FactEntry[];
    maxEntries?: number;
    maxSourcesPerFact?: number;
  }>(),
  {
    modelValue: () => [],
    maxEntries: 6,
    maxSourcesPerFact: 3,
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: FactEntry[]): void;
}>();

const entries = computed({
  get: () => props.modelValue,
  set: (value: FactEntry[]) => emit('update:modelValue', value),
});

const addEntry = () => {
  if (entries.value.length >= props.maxEntries) {
    return;
  }

  entries.value = [
    ...entries.value,
    {
      label: '',
      value: '',
      sources: [],
    },
  ];
};

const removeEntry = (index: number) => {
  entries.value = entries.value.filter((_, idx) => idx !== index);
};

const addFactSource = (index: number) => {
  const target = entries.value[index];
  if (!target || target.sources.length >= props.maxSourcesPerFact) {
    return;
  }

  target.sources = [...target.sources, ''];
  emitEntries();
};

const removeFactSource = (entryIndex: number, sourceIndex: number) => {
  const entry = entries.value[entryIndex];
  if (!entry) {
    return;
  }

  entry.sources = entry.sources.filter((_, idx) => idx !== sourceIndex);
  emitEntries();
};

const emitEntries = () => {
  emit(
    'update:modelValue',
    entries.value.map(entry => ({ ...entry, sources: [...entry.sources] })),
  );
};
</script>
