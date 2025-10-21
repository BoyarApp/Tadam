import { defineStore } from 'pinia';

export type DistrictPreference = {
  id: string;
  name: string;
  slug?: string;
};

export type CategoryPreference = {
  id: string;
  name: string;
  slug?: string;
};

type ThemeMode = 'light' | 'dark';

type State = {
  selectedDistricts: DistrictPreference[];
  selectedCategories: CategoryPreference[];
  theme: ThemeMode;
};

const STORAGE_KEY = 'tadam-preferences';

const readPersistedState = (): State | null => {
  if (process.server) { return null; }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as State) : null;
  } catch (error) {
    console.warn('Failed to parse persisted preferences', error);
    return null;
  }
};

const persistState = (state: State) => {
  if (process.server) { return; }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const usePreferencesStore = defineStore('preferences', {
  state: (): State =>
    readPersistedState() ?? {
      selectedDistricts: [],
      selectedCategories: [],
      theme: 'light',
    },
  getters: {
    isDistrictSelected: (state) => {
      return (id: string) => state.selectedDistricts.some(district => district.id === id);
    },
  },
  actions: {
    toggleDistrict (district: DistrictPreference) {
      if (this.isDistrictSelected(district.id)) {
        this.selectedDistricts = this.selectedDistricts.filter(item => item.id !== district.id);
      } else if (this.selectedDistricts.length < 3) {
        this.selectedDistricts = [...this.selectedDistricts, district];
      }
      persistState(this.$state);
    },
    setDistricts (districts: DistrictPreference[]) {
      this.selectedDistricts = districts.slice(0, 3);
      persistState(this.$state);
    },
    setCategories (categories: CategoryPreference[]) {
      this.selectedCategories = categories;
      persistState(this.$state);
    },
    setTheme (theme: ThemeMode) {
      this.theme = theme;
      persistState(this.$state);
    },
  },
});
