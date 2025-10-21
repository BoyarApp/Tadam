export default () => ({
  feed: {
    cacheTTL: Number(process.env.FEED_CACHE_TTL ?? 120),
    extraSections: [
      {
        slot: 'campus',
        title: 'Campus & Youth',
        filters: {
          categories: {
            slug: {
              $in: ['education', 'campus', 'students'],
            },
          },
        },
        limit: 4,
        reason: 'Updates from campuses and youth initiatives.',
      },
      {
        slot: 'schemes',
        title: 'Government Schemes',
        filters: {
          categories: {
            slug: {
              $in: ['govt-schemes', 'welfare'],
            },
          },
        },
        limit: 4,
        reason: 'Latest government schemes and benefits.',
      },
    ],
  },
});
