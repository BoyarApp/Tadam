<template>
  <VAppBar density="comfortable" elevation="1" class="bg-surface">
    <VContainer class="max-w-screen-xl flex items-center justify-between">
      <div class="flex items-center gap-3">
        <VAvatar color="primary" size="36">
          <span class="font-semibold text-white">Ta</span>
        </VAvatar>
        <div class="flex flex-col">
          <span class="font-semibold text-lg leading-5">Tadam</span>
          <small class="text-sm text-slate-500">Tamil-first intelligence</small>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <VBtn
          variant="text"
          color="primary"
          class="hidden md:flex"
          prepend-icon="mdi-map-marker"
          @click="$emit('open-districts')"
        >
          <span class="font-medium">Districts ({{ districtCount }})</span>
        </VBtn>
        <VBtn
          variant="text"
          color="secondary"
          class="hidden md:flex"
          prepend-icon="mdi-account-heart"
        >
          Support Us
        </VBtn>
        <VBtn
          variant="text"
          :icon="theme === 'dark' ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          @click="$emit('toggle-theme')"
        />
      </div>
    </VContainer>
  </VAppBar>
</template>

<script setup lang="ts">
defineProps<{
  districtCount: number;
  theme: 'light' | 'dark';
}>();

defineEmits<{
  (event: 'toggle-theme'): void;
  (event: 'open-districts'): void;
}>();
</script>
