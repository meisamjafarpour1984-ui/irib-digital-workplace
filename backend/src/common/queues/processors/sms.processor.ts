/**
 * IRIB Digital Workplace Platform - SMS Queue Processor
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
import { SmsJobData } from '../queue.service'
import { SmsService } from '@/modules/sms/sms.service'

@Processor('sms')
export class SmsProcessor extends WorkerHost {
  private readonly logger = new Logger(SmsProcessor.name)

  constructor(@Optional() private smsService?: SmsService) {
    super()
  }

  async process(job: Job<SmsJobData>) {
    this.logger.log(`Processing SMS job ${job.id} for ${job.data.recipient}`)

    try {
      const { recipient, message, templateCode, params } = job.data

      if (this.smsService) {
        // Send SMS via SmsService
        const result = await this.smsService.send(recipient, message, {
          templateCode,
          params,
        })

        if (result.success) {
          this.logger.log(`SMS sent successfully to ${recipient}`)
          return { success: true, recipient, messageId: result.messageId }
        } else {
          this.logger.error(`Failed to send SMS to ${recipient}: ${result.error}`)
          throw new Error(result.error)
        }
      } else {
        // Fallback: log and skip
        this.logger.log(`SMS processing for ${recipient}: ${message} (service not available)`)
        return { success: true, recipient, skipped: true }
      }
    } catch (error) {
      this.logger.error(`Failed to process SMS job ${job.id}:`, error)
      throw error
    }
  }
}
