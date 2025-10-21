<template>
  <VBottomNavigation grow elevation="4">
    <VBtn icon="mdi-home-variant" />
    <VBtn icon="mdi-compass" @click="$emit('open-districts')" />
    <VBtn :icon="theme === 'dark' ? 'mdi-weather-sunny' : 'mdi-weather-night'" @click="$emit('toggle-theme')" />
    <VBtn icon="mdi-bookmark-multiple" />
  </VBottomNavigation>
</template>

<script setup lang="ts">
defineProps<{
  theme: 'light' | 'dark';
}>();

defineEmits<{
  (event: 'toggle-theme'): void;
  (event: 'open-districts'): void;
}>();
</script>
