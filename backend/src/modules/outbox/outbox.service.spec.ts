import { Test, TestingModule } from '@nestjs/testing'
import { OutboxService } from './outbox.service'
import { PrismaService } from '../../prisma/prisma.service'

describe('OutboxService', () => {
  let service: OutboxService
  let prisma: PrismaService

  const mockPrisma = {
    outboxEvent: {
      create: jest
        .fn()
        .mockResolvedValue({
          id: 'evt-1',
          aggregateType: 'User',
          aggregateId: 'u1',
          eventType: 'Created',
          payload: { name: 'Ali' },
        }),
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue({}),
    },
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const m: TestingModule = await Test.createTestingModule({
      providers: [OutboxService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile()
    service = m.get<OutboxService>(OutboxService)
    prisma = m.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => expect(service).toBeDefined())

  describe('publishEvent', () => {
    it('creates an outbox event with all fields', async () => {
      await service.publishEvent({
        aggregateType: 'User',
        aggregateId: 'u1',
        eventType: 'Created',
        payload: { name: 'Ali' },
      })

      expect(prisma.outboxEvent.create).toHaveBeenCalledWith({
        data: {
          aggregateType: 'User',
          aggregateId: 'u1',
          eventType: 'Created',
          payload: { name: 'Ali' },
          metadata: {},
        },
      })
    })
  })

  describe('retryFailedEvents', () => {
    it('fetches pending events and retries them when Kafka is available', async () => {
      mockPrisma.outboxEvent.findMany.mockResolvedValueOnce([
        {
          id: 'e1',
          aggregateType: 'User',
          eventType: 'Created',
          payload: {},
          metadata: {},
          retryCount: 0,
          maxRetries: 3,
        },
        {
          id: 'e2',
          aggregateType: 'User',
          eventType: 'Updated',
          payload: {},
          metadata: {},
          retryCount: 0,
          maxRetries: 3,
        },
      ])
      ;(service as unknown as { producer: { send: jest.Mock } }).producer = {
        send: jest.fn().mockResolvedValue(undefined),
      }

      await service.retryFailedEvents()

      expect(prisma.outboxEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ processedAt: null }),
          take: 100,
        })
      )
    })
  })
})
