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
    language: 'en',
    translation: 'முதல்வர்',
    context: 'politics'
  },
  {
    term: 'Budget',
    language: 'en',
    translation: 'நிதிநிலை விவரம்',
    context: 'economy'
  },
  {
    term: 'GST',
    language: 'en',
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
  const categoryService = strapi.entityService;

  for (const category of categories) {
    const slug = toSlug(category.name);
    const existing = await categoryService.findMany('api::category.category', {
      filters: { slug },
      limit: 1
    });

    if (existing.length === 0) {
      await categoryService.create('api::category.category', {
        data: {
          name: category.name,
          slug,
          description: category.description
        }
      });
    }
  }
};

const seedDistricts = async (strapi: Core.Strapi) => {
  const districtService = strapi.entityService;

  for (const name of districts) {
    const slug = toSlug(name);
    const existing = await districtService.findMany('api::district.district', {
      filters: { slug },
      limit: 1
    });

    if (existing.length === 0) {
      await districtService.create('api::district.district', {
        data: {
          name,
          slug
        }
      });
    }
  }
};

const seedGlossary = async (strapi: Core.Strapi) => {
  const glossaryService = strapi.entityService;

  for (const glossaryEntry of glossaryEntries) {
    const existing = await glossaryService.findMany('api::glossary-entry.glossary-entry', {
      filters: {
        term: glossaryEntry.term,
        language: glossaryEntry.language
      },
      limit: 1
    });

    if (existing.length === 0) {
      await glossaryService.create('api::glossary-entry.glossary-entry', {
        data: glossaryEntry
      });
    }
  }
};
