/**
 * IRIB Digital Workplace Platform - Analytics Service Unit Tests (P0-2)
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Test, TestingModule } from '@nestjs/testing'
import { AnalyticsService } from './analytics.service'
import { PrismaService } from '../../prisma/prisma.service'

describe('AnalyticsService', () => {
  let service: AnalyticsService
  let prisma: PrismaService

  const mockPrisma = {
    user: { count: jest.fn() },
    content: { count: jest.fn() },
    ticket: { count: jest.fn() },
    pageView: { count: jest.fn(), create: jest.fn() },
    auditLogEntry: { findMany: jest.fn() },
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnalyticsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile()
    service = module.get<AnalyticsService>(AnalyticsService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => expect(service).toBeDefined())

  describe('getKPIs', () => {
    it('counts active users + published content + open tickets in parallel', async () => {
      mockPrisma.user.count.mockResolvedValue(42)
      mockPrisma.content.count.mockResolvedValue(120)
      mockPrisma.ticket.count.mockResolvedValue(7)

      const kpis = await service.getKPIs()

      expect(kpis).toEqual({ activeUsers: 42, publishedContent: 120, openTickets: 7 })
      expect(prisma.user.count).toHaveBeenCalledWith({ where: { status: 'ACTIVE' } })
      expect(prisma.content.count).toHaveBeenCalledWith({ where: { status: 'PUBLISHED' } })
      expect(prisma.ticket.count).toHaveBeenCalledWith({
        where: { status: { in: ['NEW', 'IN_PROGRESS'] } },
      })
    })
  })

  describe('getContentStats', () => {
    const advanceTime = (iso: string) => {
      jest.useFakeTimers().setSystemTime(new Date(iso))
    }
    afterEach(() => jest.useRealTimers())

    it('defaults to the last 24 hours when period omitted', async () => {
      advanceTime('2026-09-07T12:00:00.000Z')
      mockPrisma.content.count.mockResolvedValue(5)
      mockPrisma.pageView.count.mockResolvedValue(100)

      const s = await service.getContentStats({})

      expect(s.period).toBe('day')
      expect(s.published).toBe(5)
      expect(s.views).toBe(100)
      const startDay = new Date('2026-09-06T12:00:00.000Z')
      expect(prisma.content.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ publishedAt: { gte: startDay } }),
        })
      )
    })

    it('uses last 7 days when period="week"', async () => {
      advanceTime('2026-09-07T12:00:00.000Z')
      mockPrisma.content.count.mockResolvedValue(20)
      mockPrisma.pageView.count.mockResolvedValue(500)
      const s = await service.getContentStats({ period: 'week' })
      expect(s.period).toBe('week')
      const startWeek = new Date('2026-08-31T12:00:00.000Z')
      expect(prisma.pageView.count).toHaveBeenCalledWith(
        expect.objectContaining({ where: { createdAt: { gte: startWeek } } })
      )
    })

    it('uses last 30 days when period="month"', async () => {
      advanceTime('2026-09-07T12:00:00.000Z')
      mockPrisma.content.count.mockResolvedValue(80)
      mockPrisma.pageView.count.mockResolvedValue(3000)
      const s = await service.getContentStats({ period: 'month' })
      expect(s.period).toBe('month')
      expect(s.published).toBe(80)
      expect(s.views).toBe(3000)
    })
  })

  describe('logPageView', () => {
    it('creates a pageView record with all fields', async () => {
      const view = { id: 'v1', path: '/news/1', userId: 'u1', ip: '1.1.1.1', userAgent: 'Bot' }
      mockPrisma.pageView.create.mockResolvedValue(view)
      const r = await service.logPageView({
        path: '/news/1',
        userId: 'u1',
        ip: '1.1.1.1',
        userAgent: 'Bot',
      })
      expect(prisma.pageView.create).toHaveBeenCalledWith({
        data: { path: '/news/1', userId: 'u1', ip: '1.1.1.1', userAgent: 'Bot' },
      })
      expect(r).toEqual(view)
    })

    it('allows optional fields to be omitted', async () => {
      mockPrisma.pageView.create.mockResolvedValue({})
      await service.logPageView({ path: '/about' })
      expect(prisma.pageView.create).toHaveBeenCalledWith({
        data: {
          path: '/about',
          userId: undefined,
          ip: undefined,
          userAgent: undefined,
        },
      })
    })
  })

  describe('getAuditLogs', () => {
    it('fetches audit logs ordered by createdAt desc', async () => {
      const rows = [{ id: 'a1' }]
      mockPrisma.auditLogEntry.findMany.mockResolvedValue(rows)
      const r = await service.getAuditLogs({ limit: 10 })
      expect(prisma.auditLogEntry.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        take: 10,
      })
      expect(r).toEqual(rows)
    })

    it('filters by entityType when provided', async () => {
      mockPrisma.auditLogEntry.findMany.mockResolvedValue([])
      await service.getAuditLogs({ entityType: 'User', limit: 50 })
      expect(prisma.auditLogEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { entityType: 'User' } })
      )
    })
  })
})
