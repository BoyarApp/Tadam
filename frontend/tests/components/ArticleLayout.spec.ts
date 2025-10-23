import { vi } from 'vitest';

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { slug: 'metro-water-plan' } }),
}));

import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ArticleLayout from '~/components/article/ArticleLayout.vue';
import type { ArticlePayload } from '~/types/articles';

const baseArticle: ArticlePayload = {
  id: 99,
  slug: 'metro-water-plan',
  title: 'Metro water board announces new rationing schedule for Chennai',
  summary: 'Officials outline how the tanker rotation will work across key wards.',
  content:
    '<p>Residents in <strong>Tondiarpet</strong> will receive alternate-day supply.</p><script>alert(1)</script>',
  categories: [
    { id: 1, name: 'Civic', slug: 'civic' },
  ],
  districts: [
    { id: 10, name: 'Chennai', slug: 'chennai' },
  ],
  heroImage: {
    id: 55,
    url: 'https://cdn.tadam.test/uploads/hero.jpg',
    alternativeText: 'Residents queue for water',
    caption: 'Residents queue for water in North Chennai',
  },
  gallery: [],
  publishedAt: '2024-05-01T10:30:00.000Z',
  updatedAt: '2024-05-02T12:30:00.000Z',
  factEntries: [
    {
      id: 5,
      label: 'Supply slots',
      value: 'Alternate days from 6am to 1pm',
      sources: [
        { id: 1, label: 'CMWSSB circular', url: 'https://cmwssb.example.com' },
      ],
    },
  ],
  sourceLinks: [
    { id: 2, label: 'Press note', url: 'https://tamilnadu.gov.in/press' },
  ],
  explainers: [
    {
      id: 3,
      title: 'Why rationing now?',
      summary: 'Reservoir levels dipped below 30 percent.',
      url: 'https://tadam.news/explainers/rationing',
    },
  ],
  entities: [
    { id: 11, name: 'CMWSSB', type: 'organisation' },
  ],
  workflow: {
    lastStatus: 'published',
    lastActionAt: '2024-05-01T11:00:00.000Z',
    lastActionBy: 4,
    lastActionRole: 'editor',
    lastNote: undefined,
    lastMetadata: undefined,
    history: [
      { toStatus: 'published', at: '2024-05-01T11:00:00.000Z', actor: 4, actorRole: 'editor' },
    ],
  },
  related: [
    {
      id: 101,
      slug: 'rainwater-harvesting-checklist',
      title: 'Rainwater harvesting checklist before the monsoon',
      summary: 'Key steps to prepare your sump ahead of the rains.',
      categories: [{ id: 1, name: 'Civic', slug: 'civic' }],
      districts: [{ id: 10, name: 'Chennai', slug: 'chennai' }],
      publishedAt: '2024-04-28T09:00:00.000Z',
      heroImage: null,
    },
  ],
};

describe('ArticleLayout', () => {
  const stubs = {
    NuxtLink: { template: '<a><slot /></a>' },
    VChip: { template: '<span><slot /></span>' },
    VIcon: { template: '<i><slot /></i>' },
    VBtn: { template: '<button><slot /></button>' },
    VImg: { template: '<img />' },
    VRow: { template: '<div><slot /></div>' },
    VCol: { template: '<div><slot /></div>' },
    VCard: { template: '<div><slot /></div>' },
    VCardTitle: { template: '<h3><slot /></h3>' },
    VCardSubtitle: { template: '<p><slot /></p>' },
    VCardText: { template: '<div><slot /></div>' },
    VCardActions: { template: '<div><slot /></div>' },
    VCardItem: { template: '<div><slot /></div>' },
    VList: { template: '<ul><slot /></ul>' },
    VListItem: { template: '<li><slot /></li>' },
    VListItemTitle: { template: '<span><slot /></span>' },
    VAlert: { template: '<div><slot /></div>' },
    VSlideGroup: { template: '<div><slot /></div>' },
    VSlideGroupItem: { template: '<div><slot /></div>' },
    VDivider: { template: '<hr />' },
  };

  it('renders sanitised rich text content and supporting metadata', () => {
    const wrapper = mount(ArticleLayout, {
      props: { article: baseArticle },
      global: {
        stubs,
      },
    });

    expect(wrapper.text()).toContain('Metro water board announces new rationing schedule for Chennai');
    expect(wrapper.html()).not.toContain('<script>alert(1)</script>');
    expect(wrapper.find('.article-body').html()).toContain('<strong>Tondiarpet</strong>');
    expect(wrapper.find('[aria-label="Key facts"]').text()).toContain('Supply slots');
    expect(wrapper.find('[aria-label="Source links"]').text()).toContain('Press note');
    expect(wrapper.find('[aria-label="Explain briefly"]').text()).toContain('Why rationing now?');
  });

  it('shows explainers fallback when none exist', () => {
    const wrapper = mount(ArticleLayout, {
      props: {
        article: {
          ...baseArticle,
          explainers: [],
        },
      },
      global: {
        stubs,
      },
    });

    expect(wrapper.get('[aria-label="Explain briefly"]').text()).toContain('haven’t published a short explainer');
  });
});
