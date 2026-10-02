/**
 * IRIB Digital Workplace Platform - SMS Queue Service
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Injectable, Logger } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'

export interface SmsJobData {
  recipient: string
  message: string
  templateCode?: string
  params?: Record<string, any>
  campaignId?: string
}

@Injectable()
export class SmsQueueService {
  private readonly logger = new Logger(SmsQueueService.name)

  constructor(@InjectQueue('sms') private readonly smsQueue: Queue) {}

  /**
   * Enqueue single SMS for processing
   */
  async enqueueSingle(data: SmsJobData, options?: { delay?: number; priority?: number }) {
    try {
      this.logger.log(`Enqueueing SMS for ${data.recipient}`)

      const job = await this.smsQueue.add('send-sms', data, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        ...options,
      })

      return { jobId: job.id, status: 'queued' }
    } catch (error) {
      this.logger.error('Error enqueuing SMS:', error)
      throw error
    }
  }

  /**
   * Enqueue bulk SMS for processing
   */
  async enqueueBulk(
    recipients: string[],
    message: string,
    options?: { templateCode?: string; params?: Record<string, any>; campaignId?: string }
  ) {
    this.logger.log(`Enqueueing ${recipients.length} SMS messages for bulk sending`)

    const jobs = []
    for (const recipient of recipients) {
      const job = await this.enqueueSingle({
        recipient,
        message,
        templateCode: options?.templateCode,
        params: options?.params,
        campaignId: options?.campaignId,
      })
      jobs.push(job)
    }

    return jobs
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    try {
      const counts = await this.smsQueue.getJobCounts()
      return counts
    } catch (error) {
      this.logger.error('Error getting queue stats:', error)
      return {}
    }
  }

  /**
   * Remove queued jobs (for cleanup)
   */
  async cleanQueue(grace: number = 5000) {
    try {
      await this.smsQueue.clean(grace, 0)
      this.logger.log('SMS queue cleaned')
    } catch (error) {
      this.logger.error('Error cleaning queue:', error)
    }
  }

  /**
   * Pause queue (for maintenance)
   */
  async pauseQueue() {
    try {
      await this.smsQueue.pause()
      this.logger.log('SMS queue paused')
    } catch (error) {
      this.logger.error('Error pausing queue:', error)
    }
  }

  /**
   * Resume queue
   */
  async resumeQueue() {
    try {
      await this.smsQueue.resume()
      this.logger.log('SMS queue resumed')
    } catch (error) {
      this.logger.error('Error resuming queue:', error)
    }
  }
}
