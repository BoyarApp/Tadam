import { seedRoles } from '../../src/utils/seed-roles';

const buildStrapiMock = () => {
  const createdRoles: any[] = [];
  const updatedRoles: Array<{ id: number; data: any }> = [];

  const roleService = {
    createRole: jest.fn(async (payload) => {
      createdRoles.push(payload);
      return { id: createdRoles.length, ...payload };
    }),
    updateRole: jest.fn(async (id: number, payload) => {
      updatedRoles.push({ id, data: payload });
      return { id, ...payload };
    }),
  };

  const pluginMock = {
    service: jest.fn(() => roleService),
  };

  const strapi = {
    plugin: jest.fn(() => pluginMock),
    entityService: {
      findMany: jest
        .fn()
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]),
    },
  } as unknown as any;

  return { strapi, createdRoles, updatedRoles, roleService };
};

describe('seedRoles', () => {
  it('creates roles when missing', async () => {
    const { strapi, createdRoles, roleService } = buildStrapiMock();

    await seedRoles(strapi);

    expect(strapi.plugin).toHaveBeenCalledWith('users-permissions');
    expect(roleService.createRole).toHaveBeenCalledTimes(4);
    expect(createdRoles.map((role) => role.type)).toEqual([
      'reader',
      'contributor',
      'author',
      'editor',
    ]);
  });

  it('updates permissions when role already exists', async () => {
    const roleService = {
      createRole: jest.fn(),
      updateRole: jest.fn(),
    };

    const pluginMock = {
      service: jest.fn(() => roleService),
    };

    const strapi = {
      plugin: jest.fn(() => pluginMock),
      entityService: {
        findMany: jest.fn().mockResolvedValue([{ id: 99, permissions: { existing: true } }]),
      },
    } as unknown as any;

    await seedRoles(strapi);

    expect(roleService.createRole).not.toHaveBeenCalled();
    expect(roleService.updateRole).toHaveBeenCalledWith(
      99,
      expect.objectContaining({
        permissions: expect.objectContaining({ existing: true }),
      }),
    );
  });
});
