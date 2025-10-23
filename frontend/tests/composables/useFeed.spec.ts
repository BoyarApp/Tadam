import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { nextTick } from 'vue';
import { useFeed } from '~/composables/useFeed';

const originalFetch = globalThis.$fetch;
const originalRuntimeConfig = (globalThis as any).useRuntimeConfig;

describe('useFeed', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    globalThis.$fetch = vi.fn().mockResolvedValue({ sections: [] });
    (globalThis as any).useRuntimeConfig = () => ({
      public: { apiBase: 'http://localhost:1337' },
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
    if (originalFetch) {
      globalThis.$fetch = originalFetch;
    } else {
      globalThis.$fetch = undefined as any;
    }

    if (originalRuntimeConfig) {
      (globalThis as any).useRuntimeConfig = originalRuntimeConfig;
    } else {
      delete (globalThis as any).useRuntimeConfig;
    }
  });

  it('initialises feed data and allows manual refresh', async () => {
    const { feeds, refresh, loading } = useFeed();

    await nextTick();
    expect(globalThis.$fetch).toHaveBeenCalledTimes(1);
    expect(feeds.value).toHaveLength(4); // fallback sample data because mock returns empty

    await refresh();
    expect(globalThis.$fetch).toHaveBeenCalledTimes(2);
    expect(loading.value).toBe(false);
  });
});
