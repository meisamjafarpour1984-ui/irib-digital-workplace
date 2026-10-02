/**
 * IRIB Digital Workplace Platform - Delivery Tracking Service
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { MockSmsAdapter } from './adapters/mock-sms.adapter'
import { Cron, CronExpression } from '@nestjs/schedule'

@Injectable()
export class DeliveryTrackingService {
  private readonly logger = new Logger(DeliveryTrackingService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly mockSmsAdapter: MockSmsAdapter
  ) {}

  /**
   * Track delivery status for a specific message
   */
  async trackDelivery(messageId: string) {
    this.logger.log(`Tracking delivery for message ${messageId}`)

    try {
      const message = await this.prisma.smsMessage.findUnique({
        where: { id: messageId },
        include: {
          providerConfig: true,
        },
      })

      if (!message || !message.providerConfig) {
        this.logger.warn(`Message ${messageId} not found or no provider config`)
        return { success: false, error: 'Message not found' }
      }

      const providerConfig = {
        apiUrl: message.providerConfig.apiUrl,
        apiToken: message.providerConfig.apiToken,
        senderNumber: message.providerConfig.senderNumber,
      }

      const status = await this.mockSmsAdapter.getStatus(
        message.providerMessageId || '',
        providerConfig
      )

      // Update message status if changed
      if (status !== message.status) {
        await this.prisma.smsMessage.update({
          where: { id: messageId },
          data: {
            status,
            deliveredAt: status === 'DELIVERED' ? new Date() : null,
          },
        })
        this.logger.log(`Updated message ${messageId} status to ${status}`)
      }

      return { success: true, status }
    } catch (error) {
      this.logger.error(`Error tracking delivery for message ${messageId}:`, error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  /**
   * Update delivery status from provider for a campaign
   */
  async updateCampaignStatus(campaignId: string) {
    this.logger.log(`Updating delivery status for campaign ${campaignId}`)

    try {
      const messages = await this.prisma.smsMessage.findMany({
        where: {
          campaignId,
          status: {
            in: ['SENT', 'QUEUED'],
          },
        },
        take: 100, // Process in batches
      })

      const results = await Promise.all(messages.map((msg) => this.trackDelivery(msg.id)))

      return {
        processed: messages.length,
        results,
      }
    } catch (error) {
      this.logger.error(`Error updating campaign status:`, error)
      throw error
    }
  }

  /**
   * Get delivery statistics
   */
  async getStats(campaignId?: string) {
    const where = campaignId ? { campaignId } : {}

    const [total, sent, delivered, failed, queued] = await Promise.all([
      this.prisma.smsMessage.count({ where }),
      this.prisma.smsMessage.count({ where: { ...where, status: 'SENT' } }),
      this.prisma.smsMessage.count({ where: { ...where, status: 'DELIVERED' } }),
      this.prisma.smsMessage.count({ where: { ...where, status: 'FAILED' } }),
      this.prisma.smsMessage.count({ where: { ...where, status: 'QUEUED' } }),
    ])

    return { total, sent, delivered, failed, queued }
  }

  /**
   * Scheduled task to update delivery status for all pending messages
   * Runs every 5 minutes
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async updatePendingDeliveries() {
    this.logger.log('Running scheduled delivery status update')

    try {
      // Get messages that are still in SENT status and were sent within the last 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

      const messages = await this.prisma.smsMessage.findMany({
        where: {
          status: 'SENT',
          sentAt: {
            gte: oneDayAgo,
          },
        },
        take: 50, // Process in batches to avoid overwhelming the API
      })

      this.logger.log(`Found ${messages.length} messages to update`)

      for (const message of messages) {
        await this.trackDelivery(message.id)
      }

      this.logger.log(`Updated ${messages.length} message statuses`)
    } catch (error) {
      this.logger.error('Error in scheduled delivery update:', error)
    }
  }

  /**
   * Get delivery report for a campaign
   */
  async getCampaignReport(campaignId: string) {
    const stats = await this.getStats(campaignId)
    const messages = await this.prisma.smsMessage.findMany({
      where: { campaignId },
      orderBy: { sentAt: 'desc' },
      take: 100,
    })

    return {
      stats,
      recentMessages: messages,
    }
  }
}
