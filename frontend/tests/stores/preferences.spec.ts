import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePreferencesStore } from '~/stores/preferences';

describe('preferences store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('adds up to three districts', () => {
    const store = usePreferencesStore();

    store.toggleDistrict({ id: 'chennai', name: 'Chennai' });
    store.toggleDistrict({ id: 'madurai', name: 'Madurai' });
    store.toggleDistrict({ id: 'coimbatore', name: 'Coimbatore' });
    store.toggleDistrict({ id: 'salem', name: 'Salem' }); // should be ignored (max 3)

    expect(store.selectedDistricts).toHaveLength(3);
    expect(store.isDistrictSelected('salem')).toBe(false);
  });

  it('switches theme', () => {
    const store = usePreferencesStore();

    store.setTheme('dark');
    expect(store.theme).toBe('dark');
  });
});
