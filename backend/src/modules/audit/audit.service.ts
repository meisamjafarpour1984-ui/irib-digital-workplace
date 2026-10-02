/**
 * IRIB Digital Workplace Platform - Audit Service
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name)

  constructor(private readonly prisma: PrismaService) {}

  async logActivity(data: {
    userId?: string
    action: string
    entity: string
    entityId?: string
    metadata?: Record<string, any>
    ipAddress?: string
    userAgent?: string
  }) {
    try {
      return this.prisma.auditLogEntry.create({
        data: {
          actorId: data.userId,
          actorName: 'System', // Need to get user name
          action: data.action,
          entityType: data.entity,
          entityId: data.entityId,
          newData: data.metadata || {},
          ip: data.ipAddress,
          userAgent: data.userAgent,
        },
      })
    } catch (error) {
      this.logger.error('Error logging activity:', error)
      // Don't throw error - logging shouldn't break the main flow
    }
  }

  async getLogs(params: {
    userId?: string
    action?: string
    entity?: string
    entityId?: string
    startDate?: Date
    endDate?: Date
    page: number
    limit: number
  }) {
    try {
      const { userId, action, entity, entityId, startDate, endDate, page, limit } = params
      const skip = (page - 1) * limit
      const where: any = {}

      if (userId) where.actorId = userId
      if (action) where.action = action
      if (entity) where.entityType = entity
      if (entityId) where.entityId = entityId
      if (startDate || endDate) {
        where.createdAt = {}
        if (startDate) where.createdAt.gte = startDate
        if (endDate) where.createdAt.lte = endDate
      }

      const [items, total] = await Promise.all([
        this.prisma.auditLogEntry.findMany({
          where,
          include: {
            actor: {
              select: { id: true, name: true, personnelCode: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.auditLogEntry.count({ where }),
      ])

      return {
        items,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      }
    } catch (error) {
      this.logger.error('Error getting audit logs:', error)
      throw new Error('Failed to get audit logs')
    }
  }

  async getLogById(id: string) {
    try {
      const log = await this.prisma.auditLogEntry.findUnique({
        where: { id },
        include: {
          actor: {
            select: { id: true, name: true, personnelCode: true, email: true },
          },
        },
      })
      return log
    } catch (error) {
      this.logger.error(`Error getting log ${id}:`, error)
      throw new Error('Failed to get audit log')
    }
  }

  async getUserActivity(userId: string, params: { page: number; limit: number }) {
    return this.getLogs({ ...params, userId })
  }

  async getEntityActivity(
    entity: string,
    params: { page: number; limit: number },
    entityId?: string
  ) {
    if (entityId) {
      return this.getLogs({ ...params, entity, entityId })
    }
    return this.getLogs({ ...params, entity })
  }

  async getAuditStats(params: { startDate?: Date; endDate?: Date }) {
    try {
      const { startDate, endDate } = params
      const where: any = {}

      if (startDate || endDate) {
        where.createdAt = {}
        if (startDate) where.createdAt.gte = startDate
        if (endDate) where.createdAt.lte = endDate
      }

      const [totalLogs, logsByAction, logsByEntity, logsByUser] = await Promise.all([
        this.prisma.auditLogEntry.count({ where }),
        this.prisma.auditLogEntry.groupBy({
          by: ['action'],
          _count: true,
          where,
        }),
        this.prisma.auditLogEntry.groupBy({
          by: ['entityType'],
          _count: true,
          where,
        }),
        this.prisma.auditLogEntry.groupBy({
          by: ['actorId'],
          _count: true,
          where,
          orderBy: { _count: { actorId: 'desc' } },
          take: 10,
        }),
      ])

      return {
        totalLogs,
        logsByAction: logsByAction.map((item) => ({
          action: item.action,
          count: item._count,
        })),
        logsByEntity: logsByEntity.map((item) => ({
          entity: item.entityType,
          count: item._count,
        })),
        topUsers: logsByUser.map((item) => ({
          userId: item.actorId,
          count: item._count,
        })),
      }
    } catch (error) {
      this.logger.error('Error getting audit stats:', error)
      throw new Error('Failed to get audit stats')
    }
  }

  async exportLogs(params: {
    userId?: string
    action?: string
    entity?: string
    startDate?: Date
    endDate?: Date
    format: 'json' | 'csv'
  }) {
    try {
      const { format, ...filters } = params

      // Get all logs (no pagination for export)
      const logs = await this.prisma.auditLogEntry.findMany({
        where: {
          ...(filters.userId && { actorId: filters.userId }),
          ...(filters.action && { action: filters.action }),
          ...(filters.entity && { entityType: filters.entity }),
          ...(filters.startDate ||
            (filters.endDate && {
              createdAt: {
                ...(filters.startDate && { gte: filters.startDate }),
                ...(filters.endDate && { lte: filters.endDate }),
              },
            })),
        },
        include: {
          actor: {
            select: { id: true, name: true, personnelCode: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      if (format === 'json') {
        return {
          format: 'json',
          data: logs,
          exportedAt: new Date(),
          total: logs.length,
        }
      }

      if (format === 'csv') {
        const headers = ['ID', 'User', 'Action', 'Entity', 'Entity ID', 'IP Address', 'Timestamp']
        const rows = logs.map((log) => [
          log.id,
          log.actorName || 'N/A',
          log.action,
          log.entityType,
          log.entityId || 'N/A',
          log.ip || 'N/A',
          log.createdAt.toISOString(),
        ])

        const csvContent = [headers, ...rows]
          .map((row) => row.map((cell) => `"${cell}"`).join(','))
          .join('\n')

        return {
          format: 'csv',
          data: csvContent,
          exportedAt: new Date(),
          total: logs.length,
        }
      }
    } catch (error) {
      this.logger.error('Error exporting logs:', error)
      throw new Error('Failed to export logs')
    }
  }

  async cleanupOldLogs(daysToKeep: number = 90) {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      const result = await this.prisma.auditLogEntry.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      })

      this.logger.log(`Cleaned up ${result.count} old audit logs`)

      return {
        deleted: result.count,
        cutoffDate,
      }
    } catch (error) {
      this.logger.error('Error cleaning up old logs:', error)
      throw new Error('Failed to cleanup old logs')
    }
  }
}
