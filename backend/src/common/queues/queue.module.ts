import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueService } from './queue.service';
import { EmailProcessor } from './processors/email.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { PdfProcessor } from './processors/pdf.processor';
import { IndexingProcessor } from './processors/indexing.processor';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
    }),
    BullModule.registerQueue(
      {
        name: 'emails',
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      },
      {
        name: 'notifications',
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      },
      {
        name: 'pdf-generation',
        defaultJobOptions: {
          attempts: 2,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      },
      {
        name: 'content-indexing',
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      },
    ),
  ],
  providers: [
    QueueService,
    EmailProcessor,
    NotificationProcessor,
    PdfProcessor,
    IndexingProcessor,
  ],
  exports: [QueueService, BullModule],
})
export class QueueModule {}
