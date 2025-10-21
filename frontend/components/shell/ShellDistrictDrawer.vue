<template>
  <VNavigationDrawer
    v-model="model"
    location="right"
    width="420"
    temporary
    class="max-w-full"
  >
    <VToolbar color="transparent" flat>
      <VToolbarTitle class="font-semibold">Choose up to 3 districts</VToolbarTitle>
      <VSpacer />
      <VBtn icon="mdi-close" variant="text" @click="model = false" />
    </VToolbar>

    <VDivider />

    <VContainer>
      <VTextField
        v-model="search"
        density="compact"
        prepend-inner-icon="mdi-magnify"
        label="Search districts"
        variant="outlined"
        class="mb-4"
      />

      <div class="grid gap-2">
        <VChipGroup multiple>
          <VChip
            v-for="district in filteredDistricts"
            :key="district.id"
            :variant="isSelected(district.id) ? 'elevated' : 'outlined'"
            :color="isSelected(district.id) ? 'primary' : undefined"
            class="justify-start"
            @click="toggleDistrict(district)"
          >
            {{ district.name }}
          </VChip>
        </VChipGroup>
      </div>
    </VContainer>

    <template #append>
      <VDivider />
      <VContainer>
        <VBtn
          block
          color="primary"
          class="mb-2"
          :disabled="selectedLocal.length === 0"
          @click="emitSave"
        >
          Save Preferences
        </VBtn>
        <VBtn block variant="text" @click="reset">Clear Selection</VBtn>
      </VContainer>
    </template>
  </VNavigationDrawer>
</template>

<script setup lang="ts">
import type { DistrictPreference } from '~/stores/preferences';

const props = defineProps<{
  modelValue: boolean;
  selected: DistrictPreference[];
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'save', districts: DistrictPreference[]): void;
}>();

const model = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

const search = ref('');
const selectedLocal = ref<DistrictPreference[]>([...props.selected]);

watch(
  () => props.selected,
  (value) => {
    selectedLocal.value = [...value];
  },
);

const catalog: DistrictPreference[] = [
  { id: 'chennai', name: 'Chennai' },
  { id: 'coimbatore', name: 'Coimbatore' },
  { id: 'madurai', name: 'Madurai' },
  { id: 'tiruchirappalli', name: 'Tiruchirappalli' },
  { id: 'tirunelveli', name: 'Tirunelveli' },
  { id: 'salem', name: 'Salem' },
  { id: 'erode', name: 'Erode' },
  { id: 'thanjavur', name: 'Thanjavur' },
  { id: 'thoothukudi', name: 'Thoothukudi' },
  { id: 'vellore', name: 'Vellore' },
  { id: 'tiruppur', name: 'Tiruppur' },
  { id: 'kancheepuram', name: 'Kancheepuram' },
  { id: 'villupuram', name: 'Villupuram' },
];

const filteredDistricts = computed(() => {
  const term = search.value.toLowerCase();
  if (!term) { return catalog; }
  return catalog.filter(district => district.name.toLowerCase().includes(term));
});

const isSelected = (id: string) =>
  selectedLocal.value.some(district => district.id === id);

const toggleDistrict = (district: DistrictPreference) => {
  if (isSelected(district.id)) {
    selectedLocal.value = selectedLocal.value.filter(item => item.id !== district.id);
  } else if (selectedLocal.value.length < 3) {
    selectedLocal.value = [...selectedLocal.value, district];
  }
};

const emitSave = () => {
  emit('save', selectedLocal.value);
  model.value = false;
};

const reset = () => {
  selectedLocal.value = [];
};
</script>
