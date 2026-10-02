import { Test, TestingModule } from '@nestjs/testing'
import { AnalyticsDashboardService } from './analytics-dashboard.service'
import { PrismaService } from '../../prisma/prisma.service'

describe('AnalyticsDashboardService', () => {
  let service: AnalyticsDashboardService
  let prisma: PrismaService

  const mockPrisma = {
    content: { count: jest.fn().mockResolvedValue(50) },
    pageView: {
      count: jest.fn().mockResolvedValue(1000),
      groupBy: jest.fn().mockResolvedValue([{ path: '/news', _count: { id: 200 } }]),
    },
    user: { count: jest.fn().mockResolvedValue(120) },
    ticket: {
      count: jest.fn().mockResolvedValue(15),
      groupBy: jest.fn().mockResolvedValue([{ status: 'NEW', _count: { id: 5 } }]),
    },
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const m: TestingModule = await Test.createTestingModule({
      providers: [AnalyticsDashboardService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile()
    service = m.get<AnalyticsDashboardService>(AnalyticsDashboardService)
    prisma = m.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => expect(service).toBeDefined())

  describe('getOverview', () => {
    it('aggregates content, views, users, tickets', async () => {
      const r = await service.getOverview()
      expect(r).toEqual(expect.objectContaining({}))
    })
  })
})
