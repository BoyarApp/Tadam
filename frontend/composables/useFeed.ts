import { ref } from 'vue';

type FeedSlot = 'alerts' | 'hot' | 'my-mix' | 'outside';

export type FeedCard = {
  id: string;
  title: string;
  summary: string;
  category: string;
  districts: string[];
  publishedAt: string;
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
      districts: ['national'],
      publishedAt: now(),
      reason: 'We add broader stories so you do not miss major national updates.',
    })),
  },
];

export const useFeed = () => {
  const feeds = ref<FeedPayload[]>(SAMPLE_DATA);
  const loading = ref(false);

  const refresh = async () => {
    loading.value = true;
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      feeds.value = [...SAMPLE_DATA];
    } finally {
      loading.value = false;
    }
  };

  return {
    feeds,
    loading,
    refresh,
  };
};
