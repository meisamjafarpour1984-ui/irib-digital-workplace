import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { ContentStatus, Prisma, ScopeType } from '@prisma/client'
import { createHash, randomUUID } from 'crypto'
import * as sanitizeHtml from 'sanitize-html'
import { PrismaService } from '../../prisma/prisma.service'
import { ContentListQueryDto, CreateContentDto, UpdateContentDto } from './dto/content.dto'

const contentInclude = {
  author: { select: { id: true, name: true } },
  publisher: { select: { id: true, name: true } },
  scopes: { include: { department: { select: { id: true, name: true } } } },
  tags: { include: { tag: true } },
} satisfies Prisma.ContentInclude

const contentDetailsInclude = {
  ...contentInclude,
  categories: { include: { category: true } },
  media: { include: { media: true } },
  versions: { orderBy: { version: 'desc' as const }, take: 5 },
} satisfies Prisma.ContentInclude

type ContentDetails = Prisma.ContentGetPayload<{ include: typeof contentDetailsInclude }>

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ContentListQueryDto, userId: string) {
    const skip = (query.page - 1) * query.limit
    const access = await this.permissionAccess(userId, 'read')
    const where: Prisma.ContentWhereInput = {
      deletedAt: null,
      contentType: query.type,
      status: query.status,
      OR: access.global
        ? undefined
        : [
            { authorId: userId },
            ...(access.scopeIds.length
              ? [{ scopes: { some: { departmentId: { in: access.scopeIds } } } }]
              : []),
          ],
    }

    const [items, total] = await Promise.all([
      this.prisma.content.findMany({
        where,
        include: contentInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      this.prisma.content.count({ where }),
    ])

    return {
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    }
  }

  async findOne(id: string, userId: string) {
    const content = await this.getExisting(id)
    if (
      content.authorId !== userId &&
      !(await this.hasPermission(
        userId,
        'read',
        content.scopes.map(({ departmentId }) => departmentId)
      ))
    ) {
      throw new ForbiddenException('You cannot access this content')
    }
    return content
  }

  private async getExisting(id: string) {
    const content = await this.prisma.content.findFirst({
      where: { id, deletedAt: null },
      include: contentDetailsInclude,
    })

    if (!content) throw new NotFoundException('Content not found')
    return content
  }

  async findPublished(slug: string) {
    const content = await this.prisma.content.findFirst({
      where: { slug, status: ContentStatus.PUBLISHED, deletedAt: null },
      include: contentInclude,
    })
    if (!content) throw new NotFoundException('Published content not found')
    return content
  }

  async listPublicFeed(params: { type?: string; limit?: number; page?: number }) {
    const limit = Math.min(params.limit ?? 10, 50)
    const page = params.page ?? 1
    const skip = (page - 1) * limit
    const contentType = params.type as Prisma.EnumContentTypeFilter['equals'] | undefined

    const where: Prisma.ContentWhereInput = {
      deletedAt: null,
      status: ContentStatus.PUBLISHED,
      ...(contentType ? { contentType } : {}),
    }

    const [items, total] = await Promise.all([
      this.prisma.content.findMany({
        where,
        include: contentInclude,
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.content.count({ where }),
    ])

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  async listDepartments(userId: string) {
    const access = await this.permissionAccess(userId, 'create')
    if (!access.global && !access.ownership && access.scopeIds.length === 0) return []
    return this.prisma.department.findMany({
      where: {
        isActive: true,
        id: access.global ? undefined : { in: access.scopeIds },
      },
      select: { id: true, name: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    })
  }

  async create(data: CreateContentDto, authorId: string) {
    if (!(await this.hasPermission(authorId, 'create', data.scopeIds ?? [], true))) {
      throw new ForbiddenException('Content create permission is required')
    }
    return this.prisma.content.create({
      data: {
        contentType: data.contentType,
        title: this.localized(data.title),
        slug: `${this.slugify(data.title)}-${randomUUID().slice(0, 8)}`,
        excerpt: data.excerpt ? this.localized(data.excerpt) : undefined,
        body: data.body ? this.htmlBody(data.body) : undefined,
        authorId,
        scopes: this.scopeCreate(data.scopeIds),
        tags: this.tagCreate(data.tagNames),
      },
      include: contentInclude,
    })
  }

  async update(id: string, data: UpdateContentDto, changedBy: string) {
    const current = await this.getExisting(id)
    const resourceScopes = current.scopes.map(({ departmentId }) => departmentId)
    await this.assertCanModify(current.authorId, changedBy, 'update', resourceScopes)

    return this.prisma.$transaction(async (transaction) => {
      const claimed = await transaction.content.updateMany({
        where: { id, version: data.expectedVersion, deletedAt: null },
        data: {
          contentType: data.contentType,
          title: data.title ? this.localized(data.title) : undefined,
          excerpt: data.excerpt !== undefined ? this.localized(data.excerpt) : undefined,
          body: data.body !== undefined ? this.htmlBody(data.body) : undefined,
          status: current.status === ContentStatus.PUBLISHED ? ContentStatus.DRAFT : undefined,
          publisherId: current.status === ContentStatus.PUBLISHED ? null : undefined,
          publishedAt: current.status === ContentStatus.PUBLISHED ? null : undefined,
          version: { increment: 1 },
        },
      })
      if (claimed.count !== 1) {
        throw new ConflictException('Content was changed by another user; reload and try again')
      }

      await transaction.contentVersion.create({
        data: {
          contentId: id,
          version: current.version,
          data: JSON.parse(
            JSON.stringify({
              contentType: current.contentType,
              status: current.status,
              version: current.version,
              title: current.title,
              slug: current.slug,
              excerpt: current.excerpt,
              body: current.body,
              metadata: current.metadata,
              authorId: current.authorId,
              publisherId: current.publisherId,
              publishedAt: current.publishedAt?.toISOString() ?? null,
              scheduledAt: current.scheduledAt?.toISOString() ?? null,
              archivedAt: current.archivedAt?.toISOString() ?? null,
            })
          ) as Prisma.InputJsonValue,
          changedBy,
        },
      })

      return transaction.content.update({
        where: { id },
        data: {
          scopes: data.scopeIds
            ? { deleteMany: {}, ...this.scopeCreate(data.scopeIds) }
            : undefined,
          tags: data.tagNames ? { deleteMany: {}, ...this.tagCreate(data.tagNames) } : undefined,
        },
        include: contentInclude,
      })
    })
  }

  async remove(id: string, userId: string) {
    const current = await this.getExisting(id)
    await this.assertCanModify(
      current.authorId,
      userId,
      'delete',
      current.scopes.map(({ departmentId }) => departmentId)
    )
    return this.transition(current, userId, {
      deletedAt: new Date(),
      status: ContentStatus.DELETED,
    })
  }

  async publish(id: string, publisherId: string) {
    const current = await this.getExisting(id)
    if (
      !(await this.hasPermission(
        publisherId,
        'publish',
        current.scopes.map(({ departmentId }) => departmentId)
      ))
    ) {
      throw new ForbiddenException('Content publish permission is required')
    }
    return this.transition(current, publisherId, {
      status: ContentStatus.PUBLISHED,
      publisherId,
      publishedAt: new Date(),
      archivedAt: null,
    })
  }

  async archive(id: string, userId: string) {
    const current = await this.getExisting(id)
    await this.assertCanModify(
      current.authorId,
      userId,
      'update',
      current.scopes.map(({ departmentId }) => departmentId)
    )
    return this.transition(current, userId, {
      status: ContentStatus.ARCHIVED,
      archivedAt: new Date(),
    })
  }

  private transition(
    current: ContentDetails,
    changedBy: string,
    data: Prisma.ContentUncheckedUpdateManyInput
  ) {
    return this.prisma.$transaction(async (transaction) => {
      const claimed = await transaction.content.updateMany({
        where: { id: current.id, version: current.version, deletedAt: null },
        data: { ...data, version: { increment: 1 } },
      })
      if (claimed.count !== 1) {
        throw new ConflictException('Content was changed by another user; reload and try again')
      }
      await transaction.contentVersion.create({
        data: {
          contentId: current.id,
          version: current.version,
          data: this.snapshot(current),
          changedBy,
        },
      })
      const updated = await transaction.content.findUnique({
        where: { id: current.id },
        include: contentInclude,
      })
      if (!updated) throw new NotFoundException('Content not found')
      return updated
    })
  }

  private snapshot(current: ContentDetails): Prisma.InputJsonValue {
    return JSON.parse(
      JSON.stringify({
        contentType: current.contentType,
        status: current.status,
        version: current.version,
        title: current.title,
        slug: current.slug,
        excerpt: current.excerpt,
        body: current.body,
        metadata: current.metadata,
        authorId: current.authorId,
        publisherId: current.publisherId,
        publishedAt: current.publishedAt?.toISOString() ?? null,
        scheduledAt: current.scheduledAt?.toISOString() ?? null,
        archivedAt: current.archivedAt?.toISOString() ?? null,
      })
    ) as Prisma.InputJsonValue
  }

  private localized(value: string): Prisma.InputJsonObject {
    return { fa: value.trim() }
  }

  private htmlBody(value: string): Prisma.InputJsonObject {
    return {
      format: 'html',
      value: sanitizeHtml(value, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
        allowedAttributes: {
          a: ['href', 'target', 'rel'],
          img: ['src', 'alt', 'title'],
        },
        allowedSchemes: ['http', 'https', 'mailto'],
        transformTags: {
          a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
        },
      }),
    }
  }

  private scopeCreate(scopeIds?: string[]) {
    const ids = [...new Set(scopeIds ?? [])]
    return ids.length ? { create: ids.map((departmentId) => ({ departmentId })) } : undefined
  }

  private tagCreate(tagNames?: string[]) {
    const names = [...new Set((tagNames ?? []).map((name) => name.trim()).filter(Boolean))]
    return names.length
      ? {
          create: names.map((name) => ({
            tag: {
              connectOrCreate: {
                where: { name },
                create: { name, slug: this.tagSlug(name) },
              },
            },
          })),
        }
      : undefined
  }

  private async assertCanModify(
    authorId: string,
    userId: string,
    action: string,
    resourceScopeIds: string[]
  ) {
    if (authorId !== userId && !(await this.hasPermission(userId, action, resourceScopeIds))) {
      throw new ForbiddenException(`Content ${action} permission is required`)
    }
  }

  private async hasPermission(
    userId: string,
    action: string,
    resourceScopeIds: string[],
    allowOwnership = false
  ) {
    const access = await this.permissionAccess(userId, action)
    if (access.global || (allowOwnership && access.ownership && resourceScopeIds.length === 0)) {
      return true
    }
    return (
      resourceScopeIds.length > 0 && resourceScopeIds.every((id) => access.scopeIds.includes(id))
    )
  }

  private async permissionAccess(userId: string, action: string) {
    const assignments = await this.prisma.userRoleAssignment.findMany({
      where: { userId },
      select: {
        scopeType: true,
        scopeIds: true,
        deniedPermissions: true,
        grantedPermissions: true,
        role: { select: { permissions: { select: { id: true, entity: true, action: true } } } },
      },
    })
    const grantedIds = [
      ...new Set(assignments.flatMap(({ grantedPermissions }) => grantedPermissions)),
    ]
    const directlyGranted = grantedIds.length
      ? await this.prisma.atomicPermission.findMany({
          where: { id: { in: grantedIds } },
          select: { id: true, entity: true, action: true },
        })
      : []

    let global = false
    let ownership = false
    const scopeIds = new Set<string>()
    assignments.forEach((assignment) => {
      const denied = new Set(assignment.deniedPermissions)
      const permissions = [
        ...assignment.role.permissions,
        ...directlyGranted.filter(({ id }) => assignment.grantedPermissions.includes(id)),
      ]
      const allowed = permissions.some(
        (permission) =>
          !denied.has(permission.id) &&
          permission.entity.toLowerCase() === 'content' &&
          (permission.action.toLowerCase() === action || permission.action === '*')
      )
      if (!allowed) return
      if (assignment.scopeType === ScopeType.GLOBAL) global = true
      if (assignment.scopeType === ScopeType.OWNERSHIP) ownership = true
      if (
        assignment.scopeType === ScopeType.DEPARTMENT ||
        assignment.scopeType === ScopeType.UNIT
      ) {
        assignment.scopeIds.forEach((id) => scopeIds.add(id))
      }
    })
    return { global, ownership, scopeIds: [...scopeIds] }
  }

  private slugify(value: string) {
    const slug = value
      .normalize('NFKC')
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-|-$/g, '')
    return slug || `content-${Date.now().toString(36)}`
  }

  private tagSlug(value: string) {
    const normalized = value.normalize('NFKC').trim()
    const readable = this.slugify(normalized).replace(/^content-[a-z0-9]+$/, 'tag')
    const hash = createHash('sha256').update(normalized).digest('hex').slice(0, 10)
    return `${readable}-${hash}`
  }
}
