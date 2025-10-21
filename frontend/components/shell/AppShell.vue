<template>
  <VLayout class="min-h-screen bg-surface">
    <ShellHeader
      :district-count="preferences.selectedDistricts.length"
      :theme="preferences.theme"
      @toggle-theme="handleToggleTheme"
      @open-districts="isDistrictDrawerOpen = true"
    />

    <ShellCategoryRail class="hidden md:block" />

    <VMain class="bg-background">
      <slot />
    </VMain>

    <ShellBottomNav
      class="md:hidden"
      :theme="preferences.theme"
      @toggle-theme="handleToggleTheme"
      @open-districts="isDistrictDrawerOpen = true"
    />

    <ShellDistrictDrawer
      v-model="isDistrictDrawerOpen"
      :selected="preferences.selectedDistricts"
      @save="preferences.setDistricts"
    />
  </VLayout>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify';
import { usePreferencesStore } from '~/stores/preferences';

const preferences = usePreferencesStore();
const theme = useTheme();

const isDistrictDrawerOpen = ref(false);

const handleToggleTheme = () => {
  const nextTheme = preferences.theme === 'light' ? 'dark' : 'light';
  preferences.setTheme(nextTheme);
  theme.global.name.value = nextTheme === 'light' ? 'lightTheme' : 'darkTheme';
};

onMounted(() => {
  theme.global.name.value = preferences.theme === 'light' ? 'lightTheme' : 'darkTheme';
});
</script>
