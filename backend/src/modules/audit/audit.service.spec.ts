import { Test, TestingModule } from '@nestjs/testing'
import { AuditService } from './audit.service'
import { PrismaService } from '../../prisma/prisma.service'

const mockAuditLog = {
  id: 'audit-1',
  actorId: 'user-1',
  actorName: 'علی رضایی',
  action: 'UPDATE',
  entityType: 'Content',
  entityId: 'content-1',
  newData: { title: 'new' },
  ip: '10.0.0.1',
  userAgent: 'Mozilla/5.0',
  createdAt: new Date(),
  actor: { id: 'user-1', name: 'علی رضایی', personnelCode: '10001' },
}

describe('AuditService', () => {
  let service: AuditService
  let prisma: PrismaService

  const mockPrisma = {
    auditLogEntry: {
      create: jest.fn().mockResolvedValue(mockAuditLog),
      findMany: jest.fn().mockResolvedValue([mockAuditLog]),
      findUnique: jest.fn().mockResolvedValue({ ...mockAuditLog }),
      count: jest.fn().mockResolvedValue(1),
      groupBy: jest.fn(),
      deleteMany: jest.fn(),
    },
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile()
    service = module.get<AuditService>(AuditService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => expect(service).toBeDefined())

  describe('logActivity', () => {
    it('creates an audit log entry with all provided fields', async () => {
      const payload = {
        userId: 'user-1',
        action: 'UPDATE',
        entity: 'Content',
        entityId: 'content-1',
        metadata: { title: 'new' },
        ipAddress: '10.0.0.1',
        userAgent: 'Mozilla/5.0',
      }

      const result = await service.logActivity(payload)
      expect(prisma.auditLogEntry.create).toHaveBeenCalledTimes(1)
      expect(prisma.auditLogEntry.create).toHaveBeenCalledWith({
        data: {
          actorId: payload.userId,
          actorName: 'System',
          action: payload.action,
          entityType: payload.entity,
          entityId: payload.entityId,
          newData: payload.metadata,
          ip: payload.ipAddress,
          userAgent: payload.userAgent,
        },
      })
      expect(result).toEqual(mockAuditLog)
    })
  })

  describe('getLogs', () => {
    it('combines findMany + count with correct pagination', async () => {
      const result = await service.getLogs({ page: 2, limit: 10 })
      expect(prisma.auditLogEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 })
      )
      expect(prisma.auditLogEntry.count).toHaveBeenCalled()
      expect(result.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 1,
        totalPages: 1,
      })
      expect(result.items).toEqual([mockAuditLog])
    })

    it('filters by userId, action, entity, entityId when provided', async () => {
      await service.getLogs({
        page: 1,
        limit: 25,
        userId: 'user-7',
        action: 'DELETE',
        entity: 'Ticket',
        entityId: 'T-42',
      })
      const where = (prisma.auditLogEntry.findMany as jest.Mock).mock.calls[0][0].where
      expect(where).toEqual({
        actorId: 'user-7',
        action: 'DELETE',
        entityType: 'Ticket',
        entityId: 'T-42',
      })
    })
  })

  describe('getAuditStats', () => {
    it('returns aggregated statistics for date range', async () => {
      const startDate = new Date('2025-01-01')
      const endDate = new Date('2025-12-31')

      ;(mockPrisma.auditLogEntry.count as jest.Mock).mockResolvedValue(100)
      ;(mockPrisma.auditLogEntry.groupBy as jest.Mock)
        .mockResolvedValueOnce([
          { action: 'CREATE', _count: 50 },
          { action: 'UPDATE', _count: 30 },
        ])
        .mockResolvedValueOnce([
          { entityType: 'Content', _count: 60 },
          { entityType: 'User', _count: 40 },
        ])
        .mockResolvedValueOnce([
          { actorId: 'user-1', _count: 20 },
          { actorId: 'user-2', _count: 15 },
        ])

      const stats = await service.getAuditStats({ startDate, endDate })

      expect(stats.totalLogs).toBe(100)
      expect(stats.logsByAction).toHaveLength(2)
      expect(stats.logsByEntity).toHaveLength(2)
      expect(stats.topUsers).toHaveLength(2)
      expect(mockPrisma.auditLogEntry.groupBy).toHaveBeenCalledTimes(3)
    })
  })

  describe('cleanupOldLogs', () => {
    it('deletes logs older than specified days', async () => {
      ;(mockPrisma.auditLogEntry.deleteMany as jest.Mock).mockResolvedValue({ count: 42 })

      const result = await service.cleanupOldLogs(90)

      expect(result.deleted).toBe(42)
      expect(result.cutoffDate).toBeInstanceOf(Date)
      expect(mockPrisma.auditLogEntry.deleteMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({ lt: expect.any(Date) }),
          }),
        })
      )
    })
  })
})
