import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { ContentStatus, ContentType, ScopeType } from '@prisma/client'
import { ContentService } from './content.service'

describe('ContentService', () => {
  it('sanitizes rich HTML before creating a draft', async () => {
    const prisma = {
      content: {
        create: jest.fn().mockImplementation(({ data }) => ({ id: 'content-1', ...data })),
      },
      userRoleAssignment: {
        findMany: jest.fn().mockResolvedValue([
          {
            scopeType: ScopeType.OWNERSHIP,
            scopeIds: [],
            deniedPermissions: [],
            grantedPermissions: [],
            role: {
              permissions: [{ id: 'permission-1', entity: 'Content', action: 'CREATE' }],
            },
          },
        ]),
      },
      atomicPermission: { findMany: jest.fn() },
    }
    const service = new ContentService(prisma as never)

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
    const prisma = { content: { findFirst: jest.fn().mockResolvedValue(null) } }
    const service = new ContentService(prisma as never)

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
    const prisma = {
      content: {
        findFirst: jest.fn().mockResolvedValue({ id: 'content-1', authorId: 'user-1', scopes: [] }),
      },
      userRoleAssignment: { findMany: jest.fn().mockResolvedValue([]) },
      atomicPermission: { findMany: jest.fn() },
    }
    const service = new ContentService(prisma as never)

    await expect(service.publish('content-1', 'user-1')).rejects.toBeInstanceOf(ForbiddenException)
    expect(prisma.content.findFirst).toHaveBeenCalled()
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
      },
    }
    const prisma = {
      content: { findFirst: jest.fn().mockResolvedValue(current) },
      $transaction: jest.fn().mockImplementation((callback) => callback(transaction)),
    }
    const service = new ContentService(prisma as never)

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
    const prisma = {
      content: { findFirst: jest.fn().mockResolvedValue(current) },
      $transaction: jest.fn().mockImplementation((callback) => callback(transaction)),
    }
    const service = new ContentService(prisma as never)

    await expect(
      service.update('content-1', { body: '<p>قدیمی</p>', expectedVersion: 1 }, 'user-1')
    ).rejects.toBeInstanceOf(ConflictException)
  })

  it('does not treat a department permission as global access', async () => {
    const prisma = {
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
    }
    const service = new ContentService(prisma as never)

    await expect(service.findOne('content-1', 'reader-1')).rejects.toBeInstanceOf(
      ForbiddenException
    )
  })
})
