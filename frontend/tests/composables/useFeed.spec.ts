import { describe, it, expect } from 'vitest';
import { useFeed } from '~/composables/useFeed';

describe('useFeed', () => {
  it('returns four feed sections with placeholder data', async () => {
    const { feeds, refresh, loading } = useFeed();

    expect(feeds.value).toHaveLength(4);
    await refresh();
    expect(loading.value).toBe(false);
    expect(feeds.value[0].items.length).toBeGreaterThan(0);
  });
});
