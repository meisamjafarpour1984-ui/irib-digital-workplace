import { Module } from '@nestjs/common'
import { OutboxService } from './outbox.service'
import { KafkaConsumerService } from './kafka-consumer.service'
import { ScheduleModule } from '@nestjs/schedule'

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    OutboxService,
    {
      provide: KafkaConsumerService,
      useFactory: () => {
        // Only create Kafka consumer if Kafka is configured
        if (process.env.KAFKA_BROKERS) {
          return new KafkaConsumerService()
        }
        return null
      },
    },
  ],
  exports: [OutboxService],
})
export class OutboxModule {}
