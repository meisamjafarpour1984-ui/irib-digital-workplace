import { Test } from '@nestjs/testing'
import { HealthController } from './health.controller'
import { MetricsService } from './metrics.service'
import { PrismaService } from '../../prisma/prisma.service'
import { RedisCacheService } from '../../common/cache/redis-cache.service'

describe('HealthController', () => {
  const mockMetricsService = { getMetrics: jest.fn().mockResolvedValue('test') }
  const mockPrismaService = { $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]) }
  const mockRedisCacheService = { ping: jest.fn().mockResolvedValue(true) }

  it('reports process liveness', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: MetricsService, useValue: mockMetricsService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisCacheService, useValue: mockRedisCacheService },
      ],
    }).compile()

    expect(moduleRef.get(HealthController).live()).toEqual({
      status: 'ok',
      service: 'irib-dwp-backend',
    })
  })

  it('reports process readiness', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: MetricsService, useValue: mockMetricsService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisCacheService, useValue: mockRedisCacheService },
      ],
    }).compile()

    const r = await moduleRef.get(HealthController).ready()
    expect(r.status).toBe('ok')
    expect(r.dependencies).toEqual({ database: 'ok', redis: 'ok' })
    expect(r.timestamp).toBeDefined()
  })

  it('exposes prometheus metrics', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: MetricsService, useValue: mockMetricsService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisCacheService, useValue: mockRedisCacheService },
      ],
    }).compile()

    await moduleRef.get(HealthController).metrics()
    expect(mockMetricsService.getMetrics).toHaveBeenCalled()
  })
})
