import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { nextTick } from 'vue';
import { useFeed } from '~/composables/useFeed';

const originalFetch = globalThis.$fetch;

describe('useFeed', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    globalThis.$fetch = vi.fn().mockResolvedValue({ sections: [] });
  });

  afterEach(() => {
    vi.resetAllMocks();
    if (originalFetch) {
      globalThis.$fetch = originalFetch;
    } else {
      globalThis.$fetch = undefined as any;
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
