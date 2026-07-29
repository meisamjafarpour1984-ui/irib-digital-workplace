import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { TicketCategory } from '@prisma/client'

@Injectable()
export class SoftwareService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: { category?: string; limit: number }) {
    const where: any = {}
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

    // softwareDownload not defined in Prisma Schema
    return null
  }

  async createTicket(data: {
    title: string
    description: string
    category: string
    requesterId: string
  }) {
    const count = await this.prisma.ticket.count()
    const ticketNumber = `TKT-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`

    return this.prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category as any,
        creatorId: data.requesterId,
      },
    })
  }

  async getTickets(params: { status?: string; limit: number }) {
    const where: any = {}
    if (params.status) where.status = params.status

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
}
