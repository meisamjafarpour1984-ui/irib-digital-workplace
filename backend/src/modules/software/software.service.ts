import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { TicketCategory, TicketStatus, Prisma } from '@prisma/client'

@Injectable()
export class SoftwareService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: { category?: string; limit: number }) {
    const where: Prisma.SoftwareEntryWhereInput = {}
    if (params.category) where.category = params.category

    return this.prisma.softwareEntry.findMany({
      where,
      include: { versions: { where: { isActive: true }, orderBy: { createdAt: 'desc' } } },
      take: params.limit,
    })
  }

  async findOne(id: string) {
    const software = await this.prisma.softwareEntry.findUnique({
      where: { id },
      include: { versions: { orderBy: { createdAt: 'desc' } } },
    })
    if (!software) throw new NotFoundException('Software not found')
    return software
  }

  async logDownload(versionId: string, userId?: string, ip?: string, userAgent?: string) {
    await this.prisma.softwareVersion.update({
      where: { id: versionId },
      data: { downloadCount: { increment: 1 } },
    })

    // Log the download
    await this.prisma.downloadLog.create({
      data: {
        softwareVersionId: versionId,
        userId,
        ip,
        userAgent,
        downloadedAt: new Date(),
      },
    })

    return { success: true }
  }

  async createTicket(data: {
    title: string
    description: string
    category: string
    requesterId: string
  }) {
    return this.prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category as TicketCategory,
        creatorId: data.requesterId,
      },
    })
  }

  async getTickets(params: { status?: string; limit: number }) {
    const where: Prisma.TicketWhereInput = {}
    if (params.status) where.status = params.status as TicketStatus

    return this.prisma.ticket.findMany({
      where,
      include: {
        creator: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: params.limit,
    })
  }

  async getStats() {
    const totalSoftware = await this.prisma.softwareEntry.count()
    const totalVersions = await this.prisma.softwareVersion.count()
    const totalDownloads = await this.prisma.downloadLog.count()

    const categoryStats = await this.prisma.softwareEntry.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
    })

    return {
      totalSoftware,
      totalVersions,
      totalDownloads,
      categoryStats,
    }
  }

  async upload(data: any) {
    let software = await this.prisma.softwareEntry.findFirst({
      where: { name: data.name },
    })

    if (!software) {
      software = await this.prisma.softwareEntry.create({
        data: {
          name: data.name,
          description: data.description,
          icon: data.icon,
          category: data.category,
        },
      })
    }

    return this.prisma.softwareVersion.create({
      data: {
        softwareId: software.id,
        version: data.version,
        size: BigInt(data.size),
        filename: data.filename,
        storageKey: data.storageKey,
        sha256: data.sha256,
        changelog: data.changelog,
      },
    })
  }
}
