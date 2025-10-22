<template>
  <VCard variant="tonal" color="indigo-lighten-5">
    <VCardTitle class="flex items-center justify-between gap-4">
      <span class="text-sm font-semibold uppercase tracking-wide text-indigo-darken-2">
        Entity Tagging
      </span>
      <VBtn size="small" variant="text" color="indigo-darken-3" prepend-icon="mdi-refresh" @click="$emit('refresh')">
        Refresh
      </VBtn>
    </VCardTitle>

    <VCardText class="space-y-4">
      <div class="space-y-2">
        <div class="text-xs font-semibold uppercase tracking-wide text-indigo-darken-3">
          Suggestions
        </div>

        <div
          v-if="suggestions.length === 0"
          class="rounded border border-dashed border-indigo-100 bg-white/80 px-4 py-3 text-xs text-indigo-darken-2"
        >
          Run entity assist to detect people, places, and organisations mentioned in the copy.
        </div>

        <div class="flex flex-wrap gap-2">
          <VChip
            v-for="suggestion in suggestions"
            :key="suggestion.label"
            :color="isSelected(suggestion.label) ? 'indigo-darken-2' : 'indigo-lighten-2'"
            :variant="isSelected(suggestion.label) ? 'elevated' : 'outlined'"
            :prepend-icon="iconForType(suggestion.type)"
            @click="toggleEntity(suggestion.label)"
          >
            {{ suggestion.label }}
            <span class="ml-1 text-[11px] text-indigo-50">
              {{ (suggestion.confidence * 100).toFixed(0) }}%
            </span>
          </VChip>
        </div>
      </div>

      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wide text-indigo-darken-2">
            Selected Entities
          </span>
          <VBtn size="x-small" variant="text" color="error" prepend-icon="mdi-delete" @click="clearSelection">
            Clear
          </VBtn>
        </div>

        <div v-if="selection.length === 0" class="rounded bg-white/80 px-3 py-2 text-xs text-slate-500">
          Select suggestions or add your own tags below.
        </div>

        <div class="flex flex-wrap gap-2">
          <VChip
            v-for="entity in selection"
            :key="entity"
            color="indigo-darken-2"
            class="cursor-pointer"
            closable
            @click:close="toggleEntity(entity)"
          >
            {{ entity }}
          </VChip>
        </div>

        <VTextField
          v-model="manualEntity"
          label="Add custom entity"
          density="compact"
          variant="outlined"
          hide-details="auto"
          append-inner-icon="mdi-plus"
          @keyup.enter="addManualEntity"
          @click:append-inner="addManualEntity"
        />
      </div>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { EntitySuggestion } from '~/types/editorial';

const props = withDefaults(
  defineProps<{
    modelValue: string[];
    suggestions: EntitySuggestion[];
  }>(),
  {
    modelValue: () => [],
    suggestions: () => [],
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
  (e: 'refresh'): void;
}>();

const selection = computed({
  get: () => props.modelValue,
  set: (value: string[]) => emit('update:modelValue', Array.from(new Set(value))),
});

const manualEntity = ref('');

const iconForType = (type: string) => {
  switch (type) {
    case 'person':
      return 'mdi-account';
    case 'place':
      return 'mdi-map-marker';
    case 'organisation':
      return 'mdi-domain';
    default:
      return 'mdi-tag-text';
  }
};

const isSelected = (label: string) => selection.value.includes(label);

const toggleEntity = (label: string) => {
  if (isSelected(label)) {
    selection.value = selection.value.filter(entity => entity !== label);
  } else {
    selection.value = [...selection.value, label];
  }
};

const addManualEntity = () => {
  const value = manualEntity.value.trim();
  if (!value) {
    return;
  }

  if (!selection.value.includes(value)) {
    selection.value = [...selection.value, value];
  }
  manualEntity.value = '';
};

const clearSelection = () => {
  selection.value = [];
};
</script>
