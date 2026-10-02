import { Test, TestingModule } from '@nestjs/testing'
import { IntegrationService } from './integration.service'
import { PrismaService } from '../../prisma/prisma.service'

describe('IntegrationService', () => {
  let service: IntegrationService
  let prisma: PrismaService

  const mockConnector = { id: 'c1', name: 'Legacy HR', type: 'REST', config: {} }
  const mockPrisma = {
    legacyConnector: {
      findMany: jest.fn().mockResolvedValue([mockConnector]),
      findUnique: jest.fn().mockResolvedValue(mockConnector),
      update: jest.fn().mockResolvedValue(mockConnector),
    },
    webhookEndpoint: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest
        .fn()
        .mockResolvedValue({
          id: 'w1',
          name: 'Webhook',
          url: 'https://example.com/webhook',
          events: ['user.created'],
          isActive: true,
        }),
      delete: jest.fn().mockResolvedValue({ id: 'w1' }),
    },
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const m: TestingModule = await Test.createTestingModule({
      providers: [IntegrationService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile()
    service = m.get<IntegrationService>(IntegrationService)
    prisma = m.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => expect(service).toBeDefined())

  describe('connectors', () => {
    it('lists all connectors', async () => {
      const r = await service.getConnectors()
      expect(prisma.legacyConnector.findMany).toHaveBeenCalled()
      expect(r).toEqual([mockConnector])
    })

    it('syncs a connector', async () => {
      const r = await service.syncLegacyData('c1')
      expect(prisma.legacyConnector.update).toHaveBeenCalledWith({
        where: { id: 'c1' },
        data: { lastSyncAt: expect.any(Date) },
      })
      expect(r).toEqual({ status: 'synced', connector: 'Legacy HR' })
    })
  })

  describe('webhooks', () => {
    it('registers a webhook endpoint', async () => {
      const r = await service.createWebhook({
        name: 'Webhook',
        url: 'https://example.com/webhook',
        events: ['user.created'],
      })
      expect(prisma.webhookEndpoint.create).toHaveBeenCalled()
      expect(r.url).toBe('https://example.com/webhook')
    })
  })
})
