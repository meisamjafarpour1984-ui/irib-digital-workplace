import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { ContentStatus, ContentType, ScopeType } from '@prisma/client'
import { ContentService } from './content.service'
import { SearchService } from '../search/search.service'

const mockSearchService = {
  indexContent: jest.fn().mockResolvedValue(undefined),
  updateIndex: jest.fn().mockResolvedValue(undefined),
  deleteFromIndex: jest.fn().mockResolvedValue(undefined),
  reindexAll: jest.fn().mockResolvedValue({ success: true, count: 0 }),
  search: jest.fn().mockResolvedValue({ results: [], total: 0 }),
  searchOpenSearch: jest.fn(),
  searchPostgreSQL: jest.fn(),
} as unknown as jest.Mocked<SearchService>

interface TestContext {
  service: ContentService
  prisma: {
    content: {
      create: jest.Mock
      findFirst: jest.Mock
      findMany: jest.Mock
      findUnique: jest.Mock
      update: jest.Mock
      updateMany: jest.Mock
      count: jest.Mock
    }
    contentVersion: {
      create: jest.Mock
    }
    userRoleAssignment: {
      findMany: jest.Mock
    }
    atomicPermission: {
      findMany: jest.Mock
    }
    department: {
      findMany: jest.Mock
    }
    $transaction: jest.Mock
  }
}

type PrismaMockOverrides = {
  [Key in keyof TestContext['prisma']]?: Partial<TestContext['prisma'][Key]>
}

function makeService(prismaOverrides: PrismaMockOverrides = {}): TestContext {
  const prisma = {
    content: {
      create: jest.fn().mockImplementation(({ data }) => ({ id: 'content-1', ...data })),
      findFirst: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      count: jest.fn().mockResolvedValue(0),
      ...prismaOverrides.content,
    },
    contentVersion: {
      create: jest.fn().mockResolvedValue({}),
      ...prismaOverrides.contentVersion,
    },
    userRoleAssignment: {
      findMany: jest.fn().mockResolvedValue([]),
      ...prismaOverrides.userRoleAssignment,
    },
    atomicPermission: {
      findMany: jest.fn().mockResolvedValue([]),
      ...prismaOverrides.atomicPermission,
    },
    department: {
      findMany: jest.fn().mockResolvedValue([]),
      ...prismaOverrides.department,
    },
    $transaction: jest.fn().mockImplementation((callback) =>
      callback({
        content: {
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          update: jest.fn().mockResolvedValue({}),
          findUnique: jest.fn().mockResolvedValue(null),
          ...prismaOverrides.content,
        },
        contentVersion: {
          create: jest.fn().mockResolvedValue({}),
        },
      })
    ),
    ...prismaOverrides,
  } as TestContext['prisma']

  const service = new ContentService(prisma as any, mockSearchService)

  return { service, prisma }
}

describe('ContentService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('sanitizes rich HTML before creating a draft', async () => {
    const { service, prisma } = makeService({
      userRoleAssignment: {
        findMany: jest.fn().mockResolvedValue([
          {
            scopeType: ScopeType.GLOBAL,
            scopeIds: [],
            deniedPermissions: [],
            grantedPermissions: [],
            role: { permissions: [{ id: 'p1', entity: 'Content', action: 'CREATE' }] },
          },
        ]),
      },
      atomicPermission: { findMany: jest.fn() },
    })

    await service.create(
      {
        contentType: ContentType.NEWS,
        title: 'خبر آزمایشی',
        body: '<p onclick="steal()">متن</p><script>alert(1)</script>',
      },
      'user-1'
    )

    const body = prisma.content.create.mock.calls[0][0].data.body as { value: string }
    expect(body.value).toBe('<p>متن</p>')
  })

  it('only resolves published content from the public endpoint', async () => {
    const { service, prisma } = makeService({
      content: { findFirst: jest.fn().mockResolvedValue(null) },
    })

    await expect(service.findPublished('draft-story')).rejects.toBeInstanceOf(NotFoundException)
    expect(prisma.content.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          slug: 'draft-story',
          status: ContentStatus.PUBLISHED,
          deletedAt: null,
        }),
      })
    )
  })

  it('requires content.publish permission before publishing', async () => {
    const { service, prisma } = makeService({
      content: {
        findFirst: jest.fn().mockResolvedValue({ id: 'content-1', authorId: 'user-1', scopes: [] }),
      },
      userRoleAssignment: { findMany: jest.fn().mockResolvedValue([]) },
      atomicPermission: { findMany: jest.fn() },
    })

    await expect(service.publish('content-1', 'user-1')).rejects.toBeInstanceOf(ForbiddenException)
    expect(prisma.content.findFirst).toHaveBeenCalled()
  })

  it('publishes content when user has publish permission', async () => {
    const transactionUpdateMany = jest.fn().mockResolvedValue({ count: 1 })
    const { service, prisma } = makeService({
      content: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'content-1',
          authorId: 'user-1',
          scopes: [],
          status: ContentStatus.DRAFT,
        }),
        update: jest.fn().mockResolvedValue({
          id: 'content-1',
          status: ContentStatus.PUBLISHED,
          publishedAt: new Date(),
        }),
      },
      userRoleAssignment: {
        findMany: jest.fn().mockResolvedValue([
          {
            scopeType: ScopeType.GLOBAL,
            scopeIds: [],
            deniedPermissions: [],
            grantedPermissions: [],
            role: {
              permissions: [{ id: 'p1', entity: 'Content', action: 'PUBLISH' }],
            },
          },
        ]),
      },
      atomicPermission: { findMany: jest.fn() },
      $transaction: jest.fn().mockImplementation((callback) =>
        callback({
          content: {
            updateMany: transactionUpdateMany,
            update: jest.fn().mockResolvedValue({}),
            findUnique: jest.fn().mockResolvedValue({
              id: 'content-1',
              status: ContentStatus.PUBLISHED,
              publishedAt: new Date(),
            }),
          },
          contentVersion: { create: jest.fn().mockResolvedValue({}) },
        })
      ),
    })

    const result = await service.publish('content-1', 'user-1')

    expect(transactionUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: ContentStatus.PUBLISHED,
          publisherId: 'user-1',
          publishedAt: expect.any(Date),
        }),
      })
    )
    expect(result.status).toBe(ContentStatus.PUBLISHED)
    expect(mockSearchService.indexContent).toHaveBeenCalledWith('content-1')
  })

  it('returns published content to draft when it is edited', async () => {
    const current = {
      id: 'content-1',
      authorId: 'user-1',
      contentType: ContentType.NEWS,
      status: ContentStatus.PUBLISHED,
      version: 1,
      title: { fa: 'خبر' },
      slug: 'news',
      excerpt: null,
      body: null,
      metadata: {},
      publisherId: 'publisher-1',
      publishedAt: new Date(),
      scheduledAt: null,
      archivedAt: null,
      scopes: [],
    }
    const transaction = {
      contentVersion: { create: jest.fn().mockResolvedValue({}) },
      content: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        update: jest.fn().mockResolvedValue({}),
        findUnique: jest.fn().mockResolvedValue(current),
      },
    }
    const { service, prisma } = makeService({
      content: { findFirst: jest.fn().mockResolvedValue(current) },
      $transaction: jest.fn().mockImplementation((callback) => callback(transaction)),
    })

    await service.update('content-1', { body: '<p>نسخه تازه</p>', expectedVersion: 1 }, 'user-1')

    expect(transaction.content.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: ContentStatus.DRAFT,
          publisherId: null,
          publishedAt: null,
        }),
      })
    )
  })

  it('rejects an update when the expected version is stale', async () => {
    const current = {
      id: 'content-1',
      authorId: 'user-1',
      status: ContentStatus.DRAFT,
      version: 2,
      title: { fa: 'خبر' },
      slug: 'news',
      excerpt: null,
      body: null,
      metadata: {},
      publisherId: null,
      publishedAt: null,
      scheduledAt: null,
      archivedAt: null,
      scopes: [],
    }
    const transaction = {
      content: { updateMany: jest.fn().mockResolvedValue({ count: 0 }) },
    }
    const { service, prisma } = makeService({
      content: { findFirst: jest.fn().mockResolvedValue(current) },
      $transaction: jest.fn().mockImplementation((callback) => callback(transaction)),
    })

    await expect(
      service.update('content-1', { body: '<p>قدیمی</p>', expectedVersion: 1 }, 'user-1')
    ).rejects.toBeInstanceOf(ConflictException)
  })

  it('does not treat a department permission as global access', async () => {
    const { service, prisma } = makeService({
      content: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'content-1',
          authorId: 'author-1',
          scopes: [{ departmentId: 'department-b' }],
        }),
      },
      userRoleAssignment: {
        findMany: jest.fn().mockResolvedValue([
          {
            scopeType: ScopeType.DEPARTMENT,
            scopeIds: ['department-a'],
            deniedPermissions: [],
            grantedPermissions: [],
            role: {
              permissions: [{ id: 'permission-1', entity: 'Content', action: 'READ' }],
            },
          },
        ]),
      },
      atomicPermission: { findMany: jest.fn() },
    })

    await expect(service.findOne('content-1', 'reader-1')).rejects.toBeInstanceOf(
      ForbiddenException
    )
  })

  it('soft deletes content by setting deletedAt timestamp', async () => {
    const transactionUpdateMany = jest.fn().mockResolvedValue({ count: 1 })
    const { service, prisma } = makeService({
      content: {
        findFirst: jest.fn().mockResolvedValue({ id: 'content-1', authorId: 'user-1', scopes: [] }),
        update: jest.fn().mockResolvedValue({
          id: 'content-1',
          deletedAt: new Date(),
        }),
      },
      $transaction: jest.fn().mockImplementation((callback) =>
        callback({
          content: {
            updateMany: transactionUpdateMany,
            update: jest.fn().mockResolvedValue({}),
            findUnique: jest.fn().mockResolvedValue({
              id: 'content-1',
              deletedAt: new Date(),
            }),
          },
          contentVersion: { create: jest.fn().mockResolvedValue({}) },
        })
      ),
      userRoleAssignment: {
        findMany: jest.fn().mockResolvedValue([
          {
            scopeType: ScopeType.OWNERSHIP,
            scopeIds: [],
            deniedPermissions: [],
            grantedPermissions: [],
            role: { permissions: [{ id: 'p1', entity: 'Content', action: 'DELETE' }] },
          },
        ]),
      },
      atomicPermission: { findMany: jest.fn() },
    })

    const result = await service.remove('content-1', 'user-1')

    expect(transactionUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'content-1' }),
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      })
    )
    expect(result.deletedAt).toBeDefined()
    expect(mockSearchService.deleteFromIndex).toHaveBeenCalledWith('content-1')
  })

  it('finds all content with pagination for admin user', async () => {
    const { service, prisma } = makeService({
      content: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'c1', title: 'خبر ۱' },
          { id: 'c2', title: 'خبر ۲' },
        ]),
        count: jest.fn().mockResolvedValue(25),
      },
      userRoleAssignment: {
        findMany: jest.fn().mockResolvedValue([
          {
            scopeType: ScopeType.GLOBAL,
            scopeIds: [],
            deniedPermissions: [],
            grantedPermissions: [],
            role: { permissions: [{ id: 'p1', entity: 'Content', action: 'LIST' }] },
          },
        ]),
      },
      atomicPermission: { findMany: jest.fn() },
    })

    const result = await service.findAll({ page: 1, limit: 10 }, 'admin-1')

    expect(prisma.content.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 10,
        orderBy: expect.any(Object),
      })
    )
    expect(result.items).toHaveLength(2)
    expect(result.pagination.total).toBe(25)
    expect(result.pagination.page).toBe(1)
    expect(result.pagination.limit).toBe(10)
  })

  it('filters content by type in findAll', async () => {
    const { service, prisma } = makeService({
      content: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
      userRoleAssignment: {
        findMany: jest.fn().mockResolvedValue([
          {
            scopeType: ScopeType.GLOBAL,
            scopeIds: [],
            deniedPermissions: [],
            grantedPermissions: [],
            role: { permissions: [{ id: 'p1', entity: 'Content', action: 'LIST' }] },
          },
        ]),
      },
      atomicPermission: { findMany: jest.fn() },
    })

    await service.findAll({ page: 1, limit: 10, type: ContentType.EVENT }, 'admin-1')

    expect(prisma.content.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          contentType: ContentType.EVENT,
          deletedAt: null,
        }),
      })
    )
  })

  it('archives content and removes from search index', async () => {
    const current = {
      id: 'content-1',
      authorId: 'user-1',
      contentType: ContentType.NEWS,
      status: ContentStatus.PUBLISHED,
      version: 1,
      title: { fa: 'خبر' },
      slug: 'news',
      excerpt: null,
      body: null,
      metadata: {},
      publisherId: 'publisher-1',
      publishedAt: new Date(),
      scheduledAt: null,
      archivedAt: null,
      scopes: [],
    }
    const transaction = {
      contentVersion: { create: jest.fn().mockResolvedValue({}) },
      content: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUnique: jest.fn().mockResolvedValue({
          ...current,
          status: ContentStatus.ARCHIVED,
          archivedAt: new Date(),
        }),
      },
    }
    const { service, prisma } = makeService({
      content: { findFirst: jest.fn().mockResolvedValue(current) },
      $transaction: jest.fn().mockImplementation((callback) => callback(transaction)),
    })

    const result = await service.archive('content-1', 'user-1')

    expect(result.status).toBe(ContentStatus.ARCHIVED)
    expect(mockSearchService.deleteFromIndex).toHaveBeenCalledWith('content-1')
  })

  it('lists departments', async () => {
    const departments = [
      { id: 'dept-1', name: 'دپارتمان ۱' },
      { id: 'dept-2', name: 'دپارتمان ۲' },
    ]
    const { service, prisma } = makeService({
      department: { findMany: jest.fn().mockResolvedValue(departments) },
    })

    const result = await service.listDepartments('user-1')

    expect(result).toEqual(departments)
    expect(prisma.department.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      })
    )
  })

  it('lists public feed', async () => {
    const items = [
      { id: 'c1', slug: 'news-1', title: { fa: 'خبر ۱' } },
      { id: 'c2', slug: 'news-2', title: { fa: 'خبر ۲' } },
    ]
    const { service, prisma } = makeService({
      content: {
        findMany: jest.fn().mockResolvedValue(items),
        count: jest.fn().mockResolvedValue(2),
      },
    })

    const result = await service.listPublicFeed({ type: 'NEWS', limit: 10, page: 1 })

    expect(result.items).toEqual(items)
    expect(result.pagination.total).toBe(2)
    expect(prisma.content.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          deletedAt: null,
          contentType: 'NEWS',
        }),
      })
    )
  })
})
