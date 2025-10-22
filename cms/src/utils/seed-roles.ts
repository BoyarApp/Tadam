import type { Core } from '@strapi/strapi';

type PermissionShape = Record<
  string,
  {
    controllers: Record<string, Record<string, { enabled: boolean }>>;
  }
>;

const ROLE_DEFINITIONS: Array<{
  name: string;
  type: string;
  description: string;
  permissions: PermissionShape;
}> = [
  {
    name: 'Reader',
    type: 'reader',
    description: 'Default reader role with access to published content.',
    permissions: {
      'api::article': {
        controllers: {
          article: {
            find: { enabled: true },
            findOne: { enabled: true },
          },
        },
      },
      'api::category': {
        controllers: {
          category: {
            find: { enabled: true },
            findOne: { enabled: true },
          },
        },
      },
      'api::district': {
        controllers: {
          district: {
            find: { enabled: true },
            findOne: { enabled: true },
          },
        },
      },
      'api::festival': {
        controllers: {
          festival: {
            find: { enabled: true },
            findOne: { enabled: true },
          },
        },
      },
      'api::govt-scheme': {
        controllers: {
          'govt-scheme': {
            find: { enabled: true },
            findOne: { enabled: true },
          },
        },
      },
    },
  },
  {
    name: 'Contributor',
    type: 'contributor',
    description: 'Can submit drafts for editorial review.',
    permissions: {
      'api::submission': {
        controllers: {
          submission: {
            find: { enabled: true },
            findOne: { enabled: true },
            create: { enabled: true },
            update: { enabled: true },
          },
        },
      },
    },
  },
  {
    name: 'Author',
    type: 'author',
    description: 'Trusted contributor with ability to edit own articles.',
    permissions: {
      'api::article': {
        controllers: {
          article: {
            find: { enabled: true },
            findOne: { enabled: true },
            create: { enabled: true },
            update: { enabled: true },
          },
        },
      },
    },
  },
  {
    name: 'Editor',
    type: 'editor',
    description: 'Editorial staff with publish permissions.',
    permissions: {
      'api::article': {
        controllers: {
          article: {
            find: { enabled: true },
            findOne: { enabled: true },
            create: { enabled: true },
            update: { enabled: true },
            delete: { enabled: true },
          },
        },
      },
      'plugin::editorial-workbench.ai-assist': {
        controllers: {
          'ai-assist': {
            translate: { enabled: true },
            spellcheck: { enabled: true },
            'entity-suggest': { enabled: true },
          },
        },
      },
    },
  },
];

export const seedRoles = async (strapi: Core.Strapi) => {
  try {
    const roleService = strapi.plugin('users-permissions').service('role');

    for (const role of ROLE_DEFINITIONS) {
      try {
        // Use db.query API when available to bypass lifecycle hooks; fallback to entityService otherwise.
        let existing = null as any;

        if (strapi.db?.query) {
          existing = await strapi.db.query('plugin::users-permissions.role').findOne({
            where: { type: role.type },
          });
        } else {
          const matches = await strapi.entityService.findMany(
            'plugin::users-permissions.role',
            {
              filters: { type: role.type },
              limit: 1,
            },
          );
          existing = Array.isArray(matches) && matches.length > 0 ? matches[0] : null;
        }

        if (!existing) {
          await roleService.createRole({
            name: role.name,
            description: role.description,
            type: role.type,
            permissions: role.permissions,
          });
          strapi.log?.info?.(`Seeded role: ${role.name}`);
        } else {
          await roleService.updateRole(existing.id, {
            permissions: {
              ...(existing.permissions ?? {}),
              ...role.permissions,
            },
          });
          strapi.log?.info?.(`Updated role: ${role.name}`);
        }
      } catch (error) {
        // Catch unique constraint violations silently
        if (!error.message?.includes('unique') && !error.message?.includes('duplicate')) {
          strapi.log?.warn?.(`Could not seed role ${role.name}:`, error.message);
        }
      }
    }
  } catch (error) {
    strapi.log?.warn?.('Role seeding failed:', error.message);
  }
};
