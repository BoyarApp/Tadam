import type { Core } from '@strapi/strapi';

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const categories = [
  { name: 'Politics', description: 'Tamil Nadu, national, and international politics.' },
  { name: 'Science & Tech', description: 'Research, innovation, and technology news.' },
  { name: 'Cinema', description: 'Kollywood, Indian cinema, and global film coverage.' },
  { name: 'Sports', description: 'Cricket, kabaddi, football, and local sports.' },
  { name: 'Business', description: 'Markets, startups, MSME, and economy.' },
  { name: 'Employment', description: 'Government and private job openings.' },
  { name: 'Education', description: 'Exams, results, higher education, and opportunities.' },
  { name: 'Health', description: 'Public health, hospitals, wellness, and research.' },
  { name: 'Lifestyle', description: 'Culture, food, travel, and fashion.' },
  { name: 'Govt Schemes', description: 'Central and state welfare programmes.' },
  { name: 'Devotional', description: 'Temple festivals, spiritual guides, and rituals.' },
  { name: 'Agriculture', description: 'Farming, weather, and agro-economy insights.' },
  { name: 'Automotive', description: 'Cars, bikes, EVs, and transport.' },
  { name: 'Environment', description: 'Climate, monsoon, conservation, and pollution.' },
  { name: 'Galleries', description: 'Photo stories and curated visual coverage.' }
];

const districts = [
  'Ariyalur',
  'Chengalpattu',
  'Chennai',
  'Coimbatore',
  'Cuddalore',
  'Dharmapuri',
  'Dindigul',
  'Erode',
  'Kallakurichi',
  'Kanchipuram',
  'Kanyakumari',
  'Karur',
  'Krishnagiri',
  'Madurai',
  'Mayiladuthurai',
  'Nagapattinam',
  'Namakkal',
  'Nilgiris',
  'Perambalur',
  'Pudukkottai',
  'Ramanathapuram',
  'Ranipet',
  'Salem',
  'Sivaganga',
  'Tenkasi',
  'Thanjavur',
  'Theni',
  'Thoothukudi',
  'Tiruchirappalli',
  'Tirunelveli',
  'Tirupathur',
  'Tiruppur',
  'Tiruvallur',
  'Tiruvannamalai',
  'Tiruvarur',
  'Vellore',
  'Viluppuram',
  'Virudhunagar'
];

const glossaryEntries: Array<{
  term: string;
  language: 'en' | 'ta' | 'hi' | 'te' | 'ml';
  translation: string;
  context: string;
}> = [
  {
    term: 'Chief Minister',
    language: 'en' as const,
    translation: 'முதல்வர்',
    context: 'politics'
  },
  {
    term: 'Budget',
    language: 'en' as const,
    translation: 'நிதிநிலை விவரம்',
    context: 'economy'
  },
  {
    term: 'GST',
    language: 'en' as const,
    translation: 'சரக்கு மற்றும் சேவை வரி',
    context: 'business'
  }
];

export const seedInitialData = async (strapi: Core.Strapi) => {
  await seedCategories(strapi);
  await seedDistricts(strapi);
  await seedGlossary(strapi);
};

const seedCategories = async (strapi: Core.Strapi) => {
  for (const category of categories) {
    const slug = toSlug(category.name);

    try {
      // Use db.query API to bypass lifecycle hooks
      const existing = await strapi.db.query('api::category.category').findOne({
        where: { slug },
      });

      if (!existing) {
        await strapi.db.query('api::category.category').create({
          data: {
            name: category.name,
            slug,
            description: category.description,
          }
        });
        strapi.log.info(`Seeded category: ${category.name}`);
      }
    } catch (error) {
      // Catch unique constraint violations silently
      if (!error.message?.includes('unique') && !error.message?.includes('duplicate')) {
        strapi.log.warn(`Could not seed category ${category.name}:`, error.message);
      }
    }
  }
};

const seedDistricts = async (strapi: Core.Strapi) => {
  for (const name of districts) {
    const slug = toSlug(name);

    try {
      // Use db.query API to bypass lifecycle hooks
      const existing = await strapi.db.query('api::district.district').findOne({
        where: { slug },
      });

      if (!existing) {
        await strapi.db.query('api::district.district').create({
          data: {
            name,
            slug,
          }
        });
        strapi.log.info(`Seeded district: ${name}`);
      }
    } catch (error) {
      // Catch unique constraint violations silently
      if (!error.message?.includes('unique') && !error.message?.includes('duplicate')) {
        strapi.log.warn(`Could not seed district ${name}:`, error.message);
      }
    }
  }
};

const seedGlossary = async (strapi: Core.Strapi) => {
  for (const glossaryEntry of glossaryEntries) {
    try {
      // Use db.query API to bypass lifecycle hooks
      const existing = await strapi.db.query('api::glossary-entry.glossary-entry').findOne({
        where: {
          term: glossaryEntry.term,
          language: glossaryEntry.language,
        },
      });

      if (!existing) {
        await strapi.db.query('api::glossary-entry.glossary-entry').create({
          data: glossaryEntry,
        });
        strapi.log.info(`Seeded glossary: ${glossaryEntry.term}`);
      }
    } catch (error) {
      // Catch unique constraint violations silently
      if (!error.message?.includes('unique') && !error.message?.includes('duplicate')) {
        strapi.log.warn(`Could not seed glossary ${glossaryEntry.term}:`, error.message);
      }
    }
  }
};
