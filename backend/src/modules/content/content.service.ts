import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: { type?: string; status?: string; page: number; limit: number }) {
    const { type, status, page, limit } = params
    const skip = (page - 1) * limit

    const where: any = { deletedAt: null }
    if (type) where.contentType = type
    if (status) where.status = status

    const [items, total] = await Promise.all([
      this.prisma.content.findMany({
        where,
        include: {
          author: { select: { id: true, name: true } },
          scopes: { include: { department: { select: { id: true, name: true } } } },
          tags: { include: { tag: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.content.count({ where }),
    ])

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async findOne(id: string) {
    const content = await this.prisma.content.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, personnelCode: true } },
        publisher: { select: { id: true, name: true } },
        scopes: { include: { department: true } },
        tags: { include: { tag: true } },
        categories: { include: { category: true } },
        media: { include: { media: true } },
        versions: { orderBy: { version: 'desc' }, take: 5 },
      },
    })

    if (!content) throw new NotFoundException('Content not found')
    return content
  }

  async create(data: any) {
    // Generate slug from title
    const slug = this.generateSlug(data.title?.fa || data.title)

    return this.prisma.content.create({
      data: {
        contentType: data.contentType,
        title: data.title,
        slug,
        excerpt: data.excerpt,
        body: data.body,
        metadata: data.metadata || {},
        authorId: data.authorId,
        scopes: data.scopeIds?.length
          ? {
              create: data.scopeIds.map((deptId: string) => ({
                departmentId: deptId,
              })),
            }
          : undefined,
        tags: data.tagIds?.length
          ? {
              create: data.tagIds.map((tagId: string) => ({
                tagId,
              })),
            }
          : undefined,
      },
    })
  }

  async update(id: string, data: any) {
    await this.findOne(id) // Ensure exists

    // Create version before update
    const current = await this.prisma.content.findUnique({ where: { id } })
    if (current) {
      await this.prisma.contentVersion.create({
        data: {
          contentId: id,
          version: current.version,
          data: current as any,
          changedBy: data.updatedBy,
        },
      })
    }

    return this.prisma.content.update({
      where: { id },
      data: {
        ...data,
        version: { increment: 1 },
      },
    })
  }

  async remove(id: string) {
    await this.findOne(id)
    return this.prisma.content.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'DELETED' },
    })
  }

  async publish(id: string) {
    await this.findOne(id)
    return this.prisma.content.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    })
  }

  async archive(id: string) {
    await this.findOne(id)
    return this.prisma.content.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        archivedAt: new Date(),
      },
    })
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() + '-' + Date.now().toString(36)
  }
}
