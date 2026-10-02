/**
 * IRIB Digital Workplace Platform - Analytics Dashboard Controller
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../iam/jwt-auth.guard'
import { PermissionsGuard, RequirePermission, RolesGuard, Roles } from '../../common/guards'
import { PrismaService } from '../../prisma/prisma.service'

@ApiTags('Analytics Dashboard')
@Controller('analytics/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class AnalyticsDashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get dashboard overview stats' })
  @RequirePermission('Analytics.READ')
  async getOverview(@Query('period') period?: string) {
    this.getStartDate(period)

    const [
      totalUsers,
      activeUsers,
      totalContent,
      publishedContent,
      // totalForms,
      // formSubmissions,
      // totalAuditLogs,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { status: 'ACTIVE', deletedAt: null } }),
      this.prisma.content.count(),
      this.prisma.content.count({ where: { status: 'PUBLISHED' } }),
      // TODO: Fix Prisma schema - form model doesn't exist
      // this.prisma.form.count(),
      // this.prisma.formSubmission.count({ where: { createdAt: { gte: startDate } } }),
      // TODO: Fix Prisma schema - auditLog model doesn't exist
      // this.prisma.auditLog.count({ where: { createdAt: { gte: startDate } } }),
    ])

    return {
      users: { total: totalUsers, active: activeUsers },
      content: { total: totalContent, published: publishedContent },
      forms: { total: 0, submissions: 0 }, // Disabled until Prisma schema fixed
      activity: { auditLogs: 0 }, // Disabled until Prisma schema fixed
    }
  }

  @Get('user-activity')
  @ApiOperation({ summary: 'Get user activity trends' })
  @RequirePermission('Analytics.READ')
  async getUserActivity(@Query('period') period?: string) {
    const startDate = this.getStartDate(period)
    const endDate = new Date()

    // Get user registrations by day
    const userRegistrations = await this.prisma.user.groupBy({
      by: ['createdAt'],
      _count: true,
      where: {
        createdAt: { gte: startDate, lte: endDate },
        deletedAt: null,
      },
      orderBy: { createdAt: 'asc' },
    })

    // TODO: Fix Prisma schema - auditLog model doesn't exist
    // const activeUsers = await this.prisma.auditLog.groupBy({
    //   by: ['createdAt'],
    //   _count: true,
    //   where: {
    //     createdAt: { gte: startDate, lte: endDate },
    //   },
    //   orderBy: { createdAt: 'asc' },
    // })

    return {
      registrations: userRegistrations.map((item) => ({
        date: item.createdAt,
        count: item._count,
      })),
      activity: [], // Disabled until Prisma schema fixed
    }
  }

  @Get('content-performance')
  @ApiOperation({ summary: 'Get content performance metrics' })
  @RequirePermission('Analytics.READ')
  async getContentPerformance(@Query('period') period?: string) {
    const startDate = this.getStartDate(period)

    // TODO: Fix Prisma schema - Content model doesn't have 'type' field
    // const contentByType = await this.prisma.content.groupBy({
    //   by: ['type'],
    //   _count: true,
    //   where: {
    //     createdAt: { gte: startDate },
    //   },
    // })

    const contentByStatus = await this.prisma.content.groupBy({
      by: ['status'],
      _count: true,
      where: {
        createdAt: { gte: startDate },
      },
    })

    // TODO: Fix Prisma schema - Content model doesn't have 'views' field
    // const topContent = await this.prisma.content.findMany({
    //   where: {
    //     createdAt: { gte: startDate },
    //   },
    //   orderBy: { views: 'desc' },
    //   take: 10,
    //   select: {
    //     id: true,
    //     title: true,
    //     type: true,
    //     views: true,
    //     status: true,
    //     createdAt: true,
    //   },
    // })

    return {
      byType: [], // Disabled until Prisma schema fixed
      byStatus: contentByStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
      topContent: [], // Disabled until Prisma schema fixed
    }
  }

  @Get('system-health')
  @ApiOperation({ summary: 'Get system health metrics' })
  @RequirePermission('Analytics.READ')
  @Roles('ADMIN', 'IT_ADMIN')
  async getSystemHealth() {
    // Get database connection health
    const dbHealth = await this.prisma.$queryRaw`SELECT 1 as healthy`

    // Get storage stats
    const storageStats = await this.prisma.mediaAsset.aggregate({
      _sum: { size: true },
      _count: true,
    })

    // TODO: Fix Prisma schema - auditLog model doesn't exist
    // const recentErrors = await this.prisma.auditLog.findMany({
    //   where: {
    //     action: { contains: 'ERROR' },
    //     createdAt: {
    //       gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
    //     },
    //   },
    //   take: 10,
    // })

    return {
      database: Array.isArray(dbHealth) && dbHealth.length > 0 ? 'healthy' : 'unhealthy',
      storage: {
        totalSize: Number(storageStats._sum.size || 0),
        totalFiles: storageStats._count,
      },
      errors: {
        last24h: 0, // Disabled until Prisma schema fixed
        recent: [], // Disabled until Prisma schema fixed
      },
    }
  }

  private getStartDate(period?: string): Date {
    const now = new Date()
    switch (period) {
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000)
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }
  }
}
