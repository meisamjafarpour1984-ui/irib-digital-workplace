/**
 * IRIB Digital Workplace Platform - Email Queue Processor
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { EmailJobData } from '../queue.service'
import { EmailService } from '../../services/email.service'

@Processor('emails')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name)

  constructor(private readonly emailService: EmailService) {
    super()
  }

  async process(job: Job<EmailJobData>) {
    this.logger.log(`Processing email job ${job.id}`)

    try {
      const { to, subject, template, data } = job.data

      // Send email using EmailService
      const success = await this.emailService.sendEmail({
        to,
        subject,
        template,
        templateData: data,
      })

      if (success) {
        this.logger.log(`Email sent successfully to ${to}`)
        return { success: true, to }
      } else {
        this.logger.error(`Failed to send email to ${to}`)
        throw new Error('Email sending failed')
      }
    } catch (error) {
      this.logger.error(`Failed to process email job ${job.id}:`, error)
      throw error
    }
  }
}
