<template>
  <VCard variant="tonal" color="amber-lighten-5">
    <VCardTitle class="flex items-center justify-between gap-4">
      <span class="text-sm font-semibold uppercase tracking-wide text-amber-darken-3">
        Media Management
      </span>
      <div class="flex items-center gap-2">
        <VBtn size="small" variant="outlined" color="amber-darken-2" prepend-icon="mdi-image-plus" @click="addGalleryItem">
          Gallery
        </VBtn>
        <VBtn size="small" variant="outlined" color="amber-darken-2" prepend-icon="mdi-paperclip" @click="addSupportingItem">
          Supporting
        </VBtn>
      </div>
    </VCardTitle>

    <VCardText class="space-y-4">
      <div class="space-y-2">
        <div class="text-xs font-semibold uppercase tracking-wide text-amber-darken-3">
          Hero Image
        </div>
        <VTextField
          v-model="mediaState.heroImage"
          label="Hero image URL"
          density="compact"
          variant="outlined"
          hide-details="auto"
          prepend-inner-icon="mdi-image"
          @update:model-value="emitValue"
        />
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-3">
          <div class="text-xs font-semibold uppercase tracking-wide text-amber-darken-3">
            Gallery Items
          </div>

          <div
            v-if="mediaState.gallery.length === 0"
            class="rounded border border-dashed border-amber-200 bg-white/80 px-3 py-2 text-xs text-amber-darken-2"
          >
            Add supporting visuals or infographics used in the story. Use high-resolution URLs served via CDN.
          </div>

          <TransitionGroup
            name="fade"
            tag="div"
            class="space-y-3"
          >
            <VCard
              v-for="(item, index) in mediaState.gallery"
              :key="`gallery-${index}`"
              class="border border-amber-100 bg-white p-3"
            >
              <div class="flex items-start justify-between gap-2">
                <span class="text-xs font-semibold uppercase tracking-wide text-amber-darken-3">
                  Gallery {{ index + 1 }}
                </span>
                <VBtn
                  icon="mdi-close"
                  size="x-small"
                  variant="text"
                  color="error"
                  @click="removeGalleryItem(index)"
                />
              </div>

              <div class="mt-3 space-y-2">
                <VTextField
                  v-model="item.label"
                  label="Caption"
                  density="compact"
                  variant="outlined"
                  hide-details="auto"
                  @update:model-value="emitValue"
                />
                <VTextField
                  v-model="item.url"
                  label="Image URL"
                  density="compact"
                  variant="outlined"
                  hide-details="auto"
                  @update:model-value="emitValue"
                />
                <VTextField
                  v-model="item.thumbnail"
                  label="Thumbnail URL (optional)"
                  density="compact"
                  variant="outlined"
                  hide-details="auto"
                  @update:model-value="emitValue"
                />
              </div>
            </VCard>
          </TransitionGroup>
        </div>

        <div class="space-y-3">
          <div class="text-xs font-semibold uppercase tracking-wide text-amber-darken-3">
            Supporting Files
          </div>

          <div
            v-if="mediaState.supporting.length === 0"
            class="rounded border border-dashed border-amber-200 bg-white/80 px-3 py-2 text-xs text-amber-darken-2"
          >
            Reference documents, data sheets, or transcripts the desk might need while editing.
          </div>

          <TransitionGroup
            name="fade"
            tag="div"
            class="space-y-3"
          >
            <VCard
              v-for="(item, index) in mediaState.supporting"
              :key="`support-${index}`"
              class="border border-amber-100 bg-white p-3"
            >
              <div class="flex items-start justify-between gap-2">
                <span class="text-xs font-semibold uppercase tracking-wide text-amber-darken-3">
                  Document {{ index + 1 }}
                </span>
                <VBtn
                  icon="mdi-close"
                  size="x-small"
                  variant="text"
                  color="error"
                  @click="removeSupportingItem(index)"
                />
              </div>

              <div class="mt-3 space-y-2">
                <VTextField
                  v-model="item.label"
                  label="Title"
                  density="compact"
                  variant="outlined"
                  hide-details="auto"
                  @update:model-value="emitValue"
                />
                <VTextField
                  v-model="item.url"
                  label="Download URL"
                  density="compact"
                  variant="outlined"
                  hide-details="auto"
                  @update:model-value="emitValue"
                />
              </div>
            </VCard>
          </TransitionGroup>
        </div>
      </div>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { MediaSelection } from '~/types/editorial';

const props = withDefaults(
  defineProps<{
    modelValue: MediaSelection;
  }>(),
  {
    modelValue: () => ({
      heroImage: '',
      gallery: [],
      supporting: [],
    }),
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: MediaSelection): void;
}>();

const mediaState = computed({
  get: () => props.modelValue,
  set: (value: MediaSelection) => emit('update:modelValue', value),
});

const emitValue = () => {
  emit('update:modelValue', {
    heroImage: mediaState.value.heroImage,
    gallery: mediaState.value.gallery.map(item => ({ ...item })),
    supporting: mediaState.value.supporting.map(item => ({ ...item })),
  });
};

const addGalleryItem = () => {
  mediaState.value = {
    ...mediaState.value,
    gallery: [
      ...mediaState.value.gallery,
      {
        label: '',
        url: '',
        thumbnail: '',
      },
    ],
  };
  emitValue();
};

const removeGalleryItem = (index: number) => {
  mediaState.value = {
    ...mediaState.value,
    gallery: mediaState.value.gallery.filter((_, idx) => idx !== index),
  };
  emitValue();
};

const addSupportingItem = () => {
  mediaState.value = {
    ...mediaState.value,
    supporting: [
      ...mediaState.value.supporting,
      {
        label: '',
        url: '',
      },
    ],
  };
  emitValue();
};

const removeSupportingItem = (index: number) => {
  mediaState.value = {
    ...mediaState.value,
    supporting: mediaState.value.supporting.filter((_, idx) => idx !== index),
  };
  emitValue();
};
</script>
