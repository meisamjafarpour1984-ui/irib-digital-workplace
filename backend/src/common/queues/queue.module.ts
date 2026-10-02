/**
 * IRIB Digital Workplace Platform - Queue Module
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Module, forwardRef } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { QueueService } from './queue.service'
import { EmailProcessor } from './processors/email.processor'
import { NotificationProcessor } from './processors/notification.processor'
import { PdfProcessor } from './processors/pdf.processor'
import { IndexingProcessor } from './processors/indexing.processor'
import { SmsProcessor } from './processors/sms.processor'
import { CommonModule } from '../common.module'
import { SearchModule } from '../../modules/search/search.module'

@Module({
  imports: [
    CommonModule,
    forwardRef(() => SearchModule),
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
      {
        name: 'sms',
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      }
    ),
  ],
  providers: [
    QueueService,
    EmailProcessor,
    NotificationProcessor,
    PdfProcessor,
    IndexingProcessor,
    SmsProcessor,
  ],
  exports: [QueueService, BullModule],
})
export class QueueModule {}
