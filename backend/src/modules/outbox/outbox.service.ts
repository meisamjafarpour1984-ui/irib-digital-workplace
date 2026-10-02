import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { Kafka, Producer } from 'kafkajs'
import { Prisma } from '@prisma/client'

export interface OutboxEventInput {
  aggregateId: string
  aggregateType: string
  eventType: string
  payload: Prisma.InputJsonValue
  metadata?: Prisma.InputJsonValue
}

interface OutboxMessage {
  id: string
  aggregateId: string
  aggregateType: string
  eventType: string
  payload: Prisma.JsonValue
  metadata: Prisma.JsonValue
}

@Injectable()
export class OutboxService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxService.name)
  private kafka: Kafka | null = null
  private producer: Producer | null = null

  constructor(private readonly prisma: PrismaService) {
    // Only initialize Kafka if enabled
    const kafkaEnabled = process.env.KAFKA_ENABLED === 'true'

    if (!kafkaEnabled) {
      this.logger.log('Kafka is disabled via KAFKA_ENABLED environment variable')
      return
    }

    // Only initialize Kafka if brokers are configured
    const brokers = process.env.KAFKA_BROKERS
    if (brokers) {
      this.kafka = new Kafka({
        clientId: 'dwp-outbox-producer',
        brokers: [brokers],
      })
      this.producer = this.kafka.producer()
    }
  }

  async onModuleInit() {
    if (this.producer) {
      try {
        await this.producer.connect()
        this.logger.log('Kafka producer connected')
      } catch (error) {
        this.logger.warn(
          'Failed to connect to Kafka (this is expected if Kafka is not running):',
          String(error)
        )
        this.producer = null
      }
    }
  }

  async onModuleDestroy() {
    if (this.producer) {
      await this.producer.disconnect()
    }
  }

  async publishEvent(data: OutboxEventInput): Promise<void> {
    // Save to outbox table first
    const outboxEvent = await this.prisma.outboxEvent.create({
      data: {
        aggregateId: data.aggregateId,
        aggregateType: data.aggregateType,
        eventType: data.eventType,
        payload: data.payload,
        metadata: data.metadata ?? {},
      },
    })

    // Try to publish to Kafka if available
    if (this.producer) {
      try {
        await this.producer.send({
          topic: `${data.aggregateType.toLowerCase()}.${data.eventType.toLowerCase()}`,
          messages: [
            {
              key: outboxEvent.id,
              value: JSON.stringify({
                id: outboxEvent.id,
                aggregateId: data.aggregateId,
                aggregateType: data.aggregateType,
                eventType: data.eventType,
                payload: data.payload,
                metadata: outboxEvent.metadata,
              }),
            },
          ],
        })

        // Mark as processed
        await this.prisma.outboxEvent.update({
          where: { id: outboxEvent.id },
          data: { processedAt: new Date() },
        })

        this.logger.log(`Event published: ${data.aggregateType}.${data.eventType}`)
      } catch (error) {
        this.logger.error(`Failed to publish event ${outboxEvent.id}:`, error)
        // Event remains in outbox for retry by background job
      }
    } else {
      this.logger.log(
        `Kafka not available, event ${outboxEvent.id} saved to outbox for later processing`
      )
    }
  }

  async retryFailedEvents() {
    if (!this.producer) {
      this.logger.log('Kafka producer not available, skipping retry')
      return
    }

    const pendingEvents = await this.prisma.outboxEvent.findMany({
      where: {
        processedAt: null,
      },
      take: 100,
    })

    for (const event of pendingEvents) {
      if (event.retryCount >= event.maxRetries) {
        continue
      }

      try {
        const message: OutboxMessage = {
          id: event.id,
          aggregateId: event.aggregateId,
          aggregateType: event.aggregateType,
          eventType: event.eventType,
          payload: event.payload,
          metadata: event.metadata,
        }

        await this.producer.send({
          topic: `${event.aggregateType.toLowerCase()}.${event.eventType.toLowerCase()}`,
          messages: [
            {
              key: event.id,
              value: JSON.stringify(message),
            },
          ],
        })

        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: { processedAt: new Date() },
        })

        this.logger.log(`Retry succeeded for event ${event.id}`)
      } catch (error) {
        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: { retryCount: { increment: 1 } },
        })
        this.logger.error(`Retry failed for event ${event.id}:`, error)
      }
    }
  }
}
