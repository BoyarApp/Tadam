import { STATUS_TRANSITIONS, sanitizeSnapshot } from '../../src/api/article/services/article';

describe('article service helpers', () => {
  it('allows defined status transitions', () => {
    expect(STATUS_TRANSITIONS.draft).toContain('review');
    expect(STATUS_TRANSITIONS.review).toContain('approved');
    expect(STATUS_TRANSITIONS.approved).toContain('published');
  });

  it('sanitizes snapshot fields', () => {
    const snapshot = sanitizeSnapshot({
      id: 1,
      title: 'Test article',
      slug: 'test-article',
      status: 'draft',
      secret: 'should-not-exist',
    });

    expect(snapshot).toMatchObject({
      id: 1,
      title: 'Test article',
      slug: 'test-article',
    });

    expect(snapshot).not.toHaveProperty('secret');
  });
});
