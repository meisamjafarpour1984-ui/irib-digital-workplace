import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getKPIs() {
    const [users, content, tickets] = await Promise.all([
      this.prisma.user.count({ where: { status: 'ACTIVE' } }),
      this.prisma.content.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.ticket.count({ where: { status: { in: ['NEW', 'IN_PROGRESS'] } } }),
    ])

    return {
      activeUsers: users,
      publishedContent: content,
      openTickets: tickets,
    }
  }

  async getContentStats(params: { period?: string }) {
    const now = new Date()
    let startDate: Date

    if (params.period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (params.period === 'month') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    } else {
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    }

    const [published, views] = await Promise.all([
      this.prisma.content.count({
        where: { status: 'PUBLISHED', publishedAt: { gte: startDate } },
      }),
      this.prisma.pageView.count({
        where: { createdAt: { gte: startDate } },
      }),
    ])

    return { published, views, period: params.period || 'day' }
  }

  async logPageView(data: { path: string; userId?: string; ip?: string; userAgent?: string }) {
    return this.prisma.pageView.create({
      data: {
        path: data.path,
        userId: data.userId,
        ip: data.ip,
        userAgent: data.userAgent,
      },
    })
  }

  async getAuditLogs(params: { entityType?: string; limit: number }) {
    const where: any = {}
    if (params.entityType) where.entityType = params.entityType

    return this.prisma.auditLogEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: params.limit,
    })
  }
}
