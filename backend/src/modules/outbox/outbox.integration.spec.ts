/**
 * IRIB Digital Workplace Platform - Outbox Pattern Integration Tests (P1-3)
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Test, TestingModule } from '@nestjs/testing'
import { OutboxService } from './outbox.service'
import { PrismaService } from '../../prisma/prisma.service'
import { Kafka } from 'kafkajs'

describe('OutboxService Integration Tests', () => {
  let service: OutboxService
  let prisma: any
  let mockProducer: any

  const mockPrisma = {
    outboxEvent: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    // Mock Kafka producer
    mockProducer = {
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
      send: jest.fn().mockResolvedValue(undefined),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [OutboxService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile()

    service = module.get<OutboxService>(OutboxService)
    prisma = (module as any).get(PrismaService) as any

    // Manually inject mock Kafka producer
    ;(service as any).kafka = { producer: jest.fn().mockReturnValue(mockProducer) }
    ;(service as any).producer = mockProducer
  })

  afterEach(async () => {
    if (mockProducer) {
      await mockProducer.disconnect()
    }
  })

  describe('publishEvent - Integration with Kafka', () => {
    it('should save event to outbox table and publish to Kafka successfully', async () => {
      const mockEvent = {
        id: 'evt-1',
        aggregateId: 'user-123',
        aggregateType: 'User',
        eventType: 'Created',
        payload: { name: 'Ali', email: 'ali@example.com' },
        metadata: {},
        processedAt: null,
        createdAt: new Date(),
      }

      mockPrisma.outboxEvent.create.mockResolvedValue(mockEvent)
      mockPrisma.outboxEvent.update.mockResolvedValue({ ...mockEvent, processedAt: new Date() })

      await service.publishEvent({
        aggregateId: 'user-123',
        aggregateType: 'User',
        eventType: 'Created',
        payload: { name: 'Ali', email: 'ali@example.com' },
      })

      // Verify event was saved to outbox
      expect(mockPrisma.outboxEvent.create).toHaveBeenCalledWith({
        data: {
          aggregateId: 'user-123',
          aggregateType: 'User',
          eventType: 'Created',
          payload: { name: 'Ali', email: 'ali@example.com' },
          metadata: {},
        },
      })

      // Verify event was published to Kafka using the current payload contract
      expect(mockProducer.send).toHaveBeenCalledWith({
        topic: 'user.created',
        messages: [
          {
            key: 'evt-1',
            value: JSON.stringify({
              id: 'evt-1',
              aggregateId: 'user-123',
              aggregateType: 'User',
              eventType: 'Created',
              payload: { name: 'Ali', email: 'ali@example.com' },
              metadata: {},
            }),
          },
        ],
      })

      // Verify event was marked as processed
      expect(mockPrisma.outboxEvent.update).toHaveBeenCalledWith({
        where: { id: 'evt-1' },
        data: { processedAt: expect.any(Date) },
      })
    })

    it('should handle Kafka publish failure gracefully and keep event in outbox', async () => {
      const mockEvent = {
        id: 'evt-1',
        aggregateId: 'user-123',
        aggregateType: 'User',
        eventType: 'Created',
        payload: { name: 'Ali' },
        metadata: {},
        processedAt: null,
        createdAt: new Date(),
      }

      mockPrisma.outboxEvent.create.mockResolvedValue(mockEvent)
      mockProducer.send.mockRejectedValue(new Error('Kafka connection failed'))

      await service.publishEvent({
        aggregateId: 'user-123',
        aggregateType: 'User',
        eventType: 'Created',
        payload: { name: 'Ali' },
      })

      // Event should still be saved to outbox
      expect(mockPrisma.outboxEvent.create).toHaveBeenCalled()

      // Event should NOT be marked as processed
      expect(mockPrisma.outboxEvent.update).not.toHaveBeenCalled()
    })

    it('should work when Kafka is not available (outbox only mode)', async () => {
      const mockEvent = {
        id: 'evt-1',
        aggregateId: 'user-123',
        aggregateType: 'User',
        eventType: 'Created',
        payload: { name: 'Ali' },
        metadata: {},
        processedAt: null,
        createdAt: new Date(),
      }

      mockPrisma.outboxEvent.create.mockResolvedValue(mockEvent)
      mockProducer.send.mockClear()
      ;(service as any).producer = null

      await service.publishEvent({
        aggregateId: 'user-123',
        aggregateType: 'User',
        eventType: 'Created',
        payload: { name: 'Ali' },
      })

      // Event should be saved to outbox
      expect(mockPrisma.outboxEvent.create).toHaveBeenCalled()

      // Kafka send should not be called
      expect(mockProducer.send).not.toHaveBeenCalled()
    })
  })

  describe('retryFailedEvents - Integration with Kafka', () => {
    it('should retry failed events and mark them as processed', async () => {
      const failedEvents = [
        {
          id: 'evt-1',
          aggregateId: 'user-1',
          aggregateType: 'User',
          eventType: 'Created',
          payload: { name: 'User1' },
          metadata: {},
          processedAt: null,
          retryCount: 0,
          maxRetries: 3,
        },
        {
          id: 'evt-2',
          aggregateId: 'user-2',
          aggregateType: 'User',
          eventType: 'Updated',
          payload: { name: 'User2' },
          metadata: {},
          processedAt: null,
          retryCount: 1,
          maxRetries: 3,
        },
      ]

      mockPrisma.outboxEvent.findMany.mockResolvedValue(failedEvents)
      mockPrisma.outboxEvent.update.mockResolvedValue({})

      await service.retryFailedEvents()

      // Should fetch failed events
      expect(mockPrisma.outboxEvent.findMany).toHaveBeenCalledWith({
        where: {
          processedAt: null,
        },
        take: 100,
      })

      // Should retry each event
      expect(mockProducer.send).toHaveBeenCalledTimes(2)

      // Should mark events as processed
      expect(mockPrisma.outboxEvent.update).toHaveBeenCalledTimes(2)
    })

    it('should increment retry count on retry failure', async () => {
      const failedEvent = {
        id: 'evt-1',
        aggregateId: 'user-1',
        aggregateType: 'User',
        eventType: 'Created',
        payload: { name: 'User1' },
        metadata: {},
        processedAt: null,
        retryCount: 0,
        maxRetries: 3,
      }

      mockPrisma.outboxEvent.findMany.mockResolvedValue([failedEvent])
      mockProducer.send.mockRejectedValue(new Error('Kafka still down'))
      mockPrisma.outboxEvent.update.mockResolvedValue({})

      await service.retryFailedEvents()

      // Should increment retry count on failure
      expect(mockPrisma.outboxEvent.update).toHaveBeenCalledWith({
        where: { id: 'evt-1' },
        data: { retryCount: { increment: 1 } },
      })
    })

    it('should skip events with retryCount >= 3', async () => {
      mockPrisma.outboxEvent.findMany.mockResolvedValue([
        {
          id: 'evt-1',
          aggregateId: 'user-1',
          aggregateType: 'User',
          eventType: 'Created',
          payload: { name: 'User1' },
          metadata: {},
          processedAt: null,
          retryCount: 3,
          maxRetries: 3,
        },
      ])
      mockProducer.send.mockClear()

      await service.retryFailedEvents()

      // The query should exclude retryCount >= 3, so no retry should be attempted.
      expect(mockPrisma.outboxEvent.findMany).toHaveBeenCalledWith({
        where: {
          processedAt: null,
        },
        take: 100,
      })
      expect(mockProducer.send).not.toHaveBeenCalled()
    })

    it('should skip retry when Kafka producer is not available', async () => {
      ;(service as any).producer = null

      await service.retryFailedEvents()

      // Should not fetch events
      expect(mockPrisma.outboxEvent.findMany).not.toHaveBeenCalled()
    })
  })

  describe('Kafka Connection Lifecycle', () => {
    it('should connect to Kafka on module init', async () => {
      await service.onModuleInit()

      expect(mockProducer.connect).toHaveBeenCalled()
    })

    it('should handle connection failure gracefully', async () => {
      mockProducer.connect.mockRejectedValue(new Error('Connection refused'))

      await service.onModuleInit()

      // Producer should be set to null on connection failure
      expect((service as any).producer).toBeNull()
    })

    it('should disconnect from Kafka on module destroy', async () => {
      await service.onModuleDestroy()

      expect(mockProducer.disconnect).toHaveBeenCalled()
    })
  })
})
