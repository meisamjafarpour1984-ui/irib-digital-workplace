/**
 * IRIB Digital Workplace Platform - Notification Queue Processor
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger, Optional } from '@nestjs/common'
import { Job } from 'bullmq'
import { NotificationJobData } from '../queue.service'
import { NotificationService } from '@/modules/notification/notification.service'

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name)

  constructor(@Optional() private notificationService?: NotificationService) {
    super()
  }

  async process(job: Job<NotificationJobData>) {
    this.logger.log(`Processing notification job ${job.id}`)

    try {
      const { userId, type, title, body } = job.data

      if (this.notificationService) {
        // Create notification record
        await this.notificationService.send({
          userId,
          type,
          title,
          message: body,
          channels: ['IN_APP'],
          priority: 'NORMAL',
        })
      } else {
        // Fallback: log and skip
        this.logger.log(
          `Notification processing for user ${userId}: ${title} (service not available)`
        )
      }

      this.logger.log(`Notification processed for user ${userId}`)
      return { success: true, userId }
    } catch (error) {
      this.logger.error(`Failed to process notification:`, error)
      throw error
    }
  }
}
