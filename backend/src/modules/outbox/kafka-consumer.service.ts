import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs'

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name)
  private kafka!: Kafka
  private consumer: Consumer | null = null

  constructor() {
    // Only initialize Kafka if enabled
    const kafkaEnabled = process.env.KAFKA_ENABLED === 'true'

    if (!kafkaEnabled) {
      this.logger.log('Kafka is disabled via KAFKA_ENABLED environment variable')
      return
    }

    // Only initialize Kafka if brokers are configured
    const brokers = process.env.KAFKA_BROKERS || 'localhost:9092'

    this.kafka = new Kafka({
      clientId: 'dwp-event-consumer',
      brokers: [brokers],
    })
  }

  async onModuleInit() {
    // Skip initialization if Kafka is disabled
    if (!this.kafka) {
      this.logger.log('Kafka consumer skipped (disabled)')
      return
    }

    try {
      this.consumer = this.kafka.consumer({ groupId: 'dwp-consumer-group' })
      await this.consumer.connect()
      this.logger.log('Kafka consumer connected')

      // Create admin client to ensure topics exist
      const admin = this.kafka.admin()
      await admin.connect()

      const topics = [
        { topic: 'content.created', partitions: 1, replicationFactor: 1 },
        { topic: 'content.updated', partitions: 1, replicationFactor: 1 },
        { topic: 'content.deleted', partitions: 1, replicationFactor: 1 },
        { topic: 'user.created', partitions: 1, replicationFactor: 1 },
        { topic: 'user.updated', partitions: 1, replicationFactor: 1 },
        { topic: 'form.submitted', partitions: 1, replicationFactor: 1 },
      ]

      try {
        await admin.createTopics({ topics })
        this.logger.log('Kafka topics created')
      } catch {
        // Topics might already exist, which is fine
        this.logger.debug('Kafka topics already exist or could not be created')
      }

      await admin.disconnect()

      // Subscribe to relevant topics
      await this.consumer.subscribe({
        topics: [
          'content.created',
          'content.updated',
          'content.deleted',
          'user.created',
          'user.updated',
          'form.submitted',
        ],
      })

      // Start consuming
      await this.consumer.run({
        eachMessage: async (payload: EachMessagePayload) => {
          await this.handleMessage(payload)
        },
      })
    } catch (error) {
      this.logger.warn(
        'Kafka consumer initialization failed (this is expected if Kafka is not running):',
        String(error)
      )
      this.consumer = null
    }
  }

  async onModuleDestroy() {
    if (this.consumer) {
      await this.consumer.disconnect()
    }
  }

  private async handleMessage(payload: EachMessagePayload) {
    const { topic, message } = payload
    try {
      const messageValue = message.value ? message.value.toString() : '{}'
      const parsedMessage = JSON.parse(messageValue)
      this.logger.log(`Received message from ${topic}:`, parsedMessage)

      // Route to appropriate handler based on topic
      if (
        topic === 'content.created' ||
        topic === 'content.updated' ||
        topic === 'content.deleted'
      ) {
        await this.handleContentEvent(topic, parsedMessage)
      } else if (topic === 'user.created' || topic === 'user.updated') {
        await this.handleUserEvent(topic, parsedMessage)
      } else if (topic === 'form.submitted') {
        await this.handleFormEvent(parsedMessage)
      }
    } catch (error) {
      this.logger.error(`Error processing message from ${topic}:`, error)
    }
  }

  private async handleContentEvent(topic: string, _message: any) {
    // Handle content-related events
    this.logger.log(`Handling content event: ${topic}`)
    // Implement specific logic for content events
  }

  private async handleUserEvent(topic: string, _message: any) {
    // Handle user-related events
    this.logger.log(`Handling user event: ${topic}`)
    // Implement specific logic for user events
  }

  private async handleFormEvent(_message: any) {
    // Handle form-related events
    this.logger.log(`Handling form event: form.submitted`)
    // Implement specific logic for form events
  }
}
