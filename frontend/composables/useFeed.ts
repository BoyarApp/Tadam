import { ref, watch } from 'vue';
import { usePreferencesStore } from '~/stores/preferences';

type FeedSlot = 'alerts' | 'hot' | 'my-mix' | 'outside';

export type FeedCard = {
  id: string;
  title: string;
  summary: string;
  category: string | null;
  categories: string[];
  districts: string[];
  publishedAt: string | null;
  reason: string;
};

export type FeedPayload = {
  slot: FeedSlot;
  title: string;
  items: FeedCard[];
};

const now = () => new Date().toISOString();

const SAMPLE_DATA: FeedPayload[] = [
  {
    slot: 'alerts',
    title: 'Weather Alerts',
    items: [
      {
        id: 'alert-1',
        title: 'Red Alert: Heavy rainfall expected in Chennai & Tiruvallur',
        summary: 'IMD has issued a red alert for northern coastal districts; schools to remain closed.',
        category: 'Weather',
        categories: ['weather'],
        districts: ['chennai', 'tiruvallur'],
        publishedAt: now(),
        reason: 'Based on your Chennai preference and severe weather updates.',
      },
    ],
  },
  {
    slot: 'hot',
    title: 'Trending in Tamil Nadu',
    items: Array.from({ length: 3 }).map((_, index) => ({
      id: `hot-${index}`,
      title: `Assembly session highlights ${index + 1}`,
      summary: 'Key announcements from the legislative assembly on welfare schemes and budgets.',
      category: 'Politics',
      categories: ['politics'],
      districts: ['state-wide'],
      publishedAt: now(),
      reason: 'Emerging story across the state in the last 2 hours.',
    })),
  },
  {
    slot: 'my-mix',
    title: 'My Mix',
    items: Array.from({ length: 5 }).map((_, index) => ({
      id: `mix-${index}`,
      title: `Neighbourhood update ${index + 1}`,
      summary: 'Metro water supply schedule, civic updates, and district bulletins curated for you.',
      category: index % 2 === 0 ? 'Civic' : 'Lifestyle',
      categories: [index % 2 === 0 ? 'civic' : 'lifestyle'],
      districts: ['chennai'],
      publishedAt: now(),
      reason: 'Matches your selected districts and interests.',
    })),
  },
  {
    slot: 'outside',
    title: 'Beyond My District',
    items: Array.from({ length: 4 }).map((_, index) => ({
      id: `outside-${index}`,
      title: `National roundup ${index + 1}`,
      summary: 'Top stories from across India curated to widen your perspective.',
      category: 'National',
      categories: ['national'],
      districts: ['national'],
      publishedAt: now(),
      reason: 'We add broader stories so you do not miss major national updates.',
    })),
  },
];

const mapSections = (sections: any[]): FeedPayload[] =>
  sections.map(section => ({
    slot: section.slot,
    title: section.title,
    items:
      section.items?.map((item: any) => ({
        id: String(item.id),
        title: item.title,
        summary: item.summary,
        category: item.category ?? null,
        categories: item.categories ?? [],
        districts: item.districts ?? [],
        publishedAt: item.publishedAt ?? null,
        reason: item.reason ?? '',
      })) ?? [],
  }));

const buildParams = (store: ReturnType<typeof usePreferencesStore>) => {
  const params: Record<string, string> = {};
  if (store.selectedCategories.length) {
    params.categories = store.selectedCategories
      .map(item => item.slug ?? item.id ?? item.name)
      .filter(Boolean)
      .join(',');
  }
  if (store.selectedDistricts.length) {
    params.districts = store.selectedDistricts
      .map(item => item.slug ?? item.id ?? item.name)
      .filter(Boolean)
      .join(',');
  }
  return params;
};

export const useFeed = () => {
  const preferences = usePreferencesStore();
  const feeds = ref<FeedPayload[]>([...SAMPLE_DATA]);
  const loading = ref(true);

  const fetchFeed = async () => {
    if (process.server) {
      return;
    }
    loading.value = true;
    try {
      const params = buildParams(preferences);
      const response = await $fetch<{ sections: FeedPayload[] }>('/api/feed', { params });
      feeds.value = response?.sections?.length ? mapSections(response.sections) : [...SAMPLE_DATA];
    } catch (err) {
      console.warn('Falling back to sample feed', err);
      feeds.value = [...SAMPLE_DATA];
    } finally {
      loading.value = false;
    }
  };

  watch(
    () => [
      preferences.selectedCategories.map(item => item.id ?? item.slug).join(','),
      preferences.selectedDistricts.map(item => item.id ?? item.slug).join(','),
    ],
    () => {
      fetchFeed();
    },
    { immediate: true },
  );

  return {
    feeds,
    loading,
    refresh: fetchFeed,
  };
};
