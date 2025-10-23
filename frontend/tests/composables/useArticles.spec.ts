import { describe, expect, it } from 'vitest';
import { __test__ } from '~/composables/useArticles';

const { mapArticleAttributes, mapArticleListItem } = __test__;

const createStrapiArticle = (overrides: any = {}) => ({
  id: 42,
  attributes: {
    slug: 'water-rationing-plan',
    title: 'Metro water board announces new rationing schedule for Chennai',
    summary: 'Officials outline the new timetable to balance low-reservoir levels.',
    content: '<p>Paragraph one</p><p>Paragraph two</p>',
    publishedAt: '2024-05-01T10:30:00.000Z',
    updatedAt: '2024-05-02T08:10:00.000Z',
    categories: {
      data: [
        { id: 7, attributes: { name: 'Civic', slug: 'civic' } },
        { id: 9, attributes: { name: 'Water', slug: 'water' } },
      ],
    },
    districts: {
      data: [
        { id: 101, attributes: { name: 'Chennai', slug: 'chennai' } },
      ],
    },
    entities: {
      data: [
        { id: 501, attributes: { name: 'CMWSSB', entity_type: 'organisation' } },
      ],
    },
    hero_image: {
      data: {
        id: 88,
        attributes: {
          url: '/uploads/water.jpg',
          alternativeText: 'Residents queue with canisters',
          caption: 'Residents queue with canisters near Royapuram',
        },
      },
    },
    gallery: {
      data: [
        {
          id: 89,
          attributes: {
            url: '/uploads/gallery-1.jpg',
            caption: 'Tanker refilling point',
          },
        },
      ],
    },
    fact_box: [
      {
        id: 1,
        label: 'New slots',
        value: 'Alternate-day supply for Tondiarpet and Royapuram',
        sources: [
          { label: 'Water board press note', url: 'https://metro-water.example.com/press' },
        ],
      },
    ],
    source_links: [
      { id: 2, label: 'Official circular (PDF)', url: 'https://metro-water.example.com/circular.pdf' },
    ],
    explainers: [
      { id: 10, title: 'Why rationing now?', summary: 'Storage dipped below 30%', url: 'https://tadam.news/explainers/rationing' },
    ],
    meta: {
      workflow: {
        lastStatus: 'published',
        lastActionAt: '2024-05-01T12:00:00.000Z',
        history: [
          { toStatus: 'review', at: '2024-04-30T09:00:00.000Z', actor: 3, actorRole: 'editor' },
          { toStatus: 'published', at: '2024-05-01T12:00:00.000Z', actor: 3, actorRole: 'editor' },
        ],
      },
    },
    ...overrides,
  },
});

describe('useArticles mapping helpers', () => {
  it('maps a Strapi article into the frontend payload shape', () => {
    const mediaBase = 'https://cdn.tadam.test';
    const payload = mapArticleAttributes(createStrapiArticle(), mediaBase);

    expect(payload.slug).toBe('water-rationing-plan');
    expect(payload.heroImage?.url).toBe('https://cdn.tadam.test/uploads/water.jpg');
    expect(payload.gallery[0].url).toBe('https://cdn.tadam.test/uploads/gallery-1.jpg');
    expect(payload.categories.map(category => category.name)).toEqual(['Civic', 'Water']);
    expect(payload.factEntries[0]).toMatchObject({
      label: 'New slots',
      value: 'Alternate-day supply for Tondiarpet and Royapuram',
    });
    expect(payload.sourceLinks[0].url).toContain('circular.pdf');
    expect(payload.explainers[0]).toMatchObject({ title: 'Why rationing now?' });
    expect(payload.workflow.lastStatus).toBe('published');
    expect(payload.workflow.history).toHaveLength(2);
  });

  it('maps related list items with absolute media urls', () => {
    const mediaBase = 'https://cdn.tadam.test';
    const listItem = mapArticleListItem(createStrapiArticle({ hero_image: { data: { attributes: { url: '/uploads/related.jpg' } } } }), mediaBase);

    expect(listItem.heroImage?.url).toBe('https://cdn.tadam.test/uploads/related.jpg');
    expect(listItem.categories[0].slug).toBe('civic');
  });

  it('handles missing optional collections gracefully', () => {
    const article = createStrapiArticle({
      categories: { data: [] },
      districts: { data: [] },
      hero_image: { data: null },
      gallery: { data: null },
      fact_box: null,
      source_links: null,
      explainers: null,
      entities: { data: null },
      meta: null,
    });

    const payload = mapArticleAttributes(article, 'https://cdn.tadam.test');

    expect(payload.categories).toHaveLength(0);
    expect(payload.gallery).toHaveLength(0);
    expect(payload.factEntries).toHaveLength(0);
    expect(payload.workflow.history).toHaveLength(0);
  });
});
