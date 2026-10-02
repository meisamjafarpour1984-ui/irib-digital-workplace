/**
 * IRIB Digital Workplace Platform - SMS Repository
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class SmsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveProvider() {
    return this.prisma.smsProviderConfig.findFirst({
      where: {
        isActive: true,
      },
      orderBy: {
        isDefault: 'desc',
      },
    })
  }

  async createProviderConfig(data: {
    providerName: string
    providerType: string
    apiUrl: string
    apiToken: string
    senderNumber?: string
    settings?: Record<string, any>
  }) {
    // SMS models don't exist in current schema
    // Return placeholder data
    return { id: 'placeholder', ...data, isActive: true }
  }

  async updateProviderConfig(
    providerId: string,
    data: {
      providerName?: string
      apiUrl?: string
      apiToken?: string
      senderNumber?: string
      settings?: Record<string, any>
      isActive?: boolean
    }
  ) {
    // SMS models don't exist in current schema
    // Return placeholder data
    return { id: providerId, ...data, isActive: true }
  }

  async updateProviderCredit(providerId: string, credit: number) {
    // SMS models don't exist in current schema
    // Return placeholder data
    return { id: providerId, creditBalance: credit, lastCheckedAt: new Date() }
  }

  async createMessage(data: {
    providerConfigId: string
    recipient: string
    content: string
    status: string
    providerMessageId?: string
    error?: string
    cost?: number
    sentAt?: Date
    campaignId?: string
    templateId?: string
  }) {
    // SMS models don't exist in current schema
    // Return placeholder data
    return { id: 'placeholder-' + Date.now(), ...data }
  }

  async updateMessageStatus(messageId: string, status: string, deliveredAt?: Date) {
    // SMS models don't exist in current schema
    // Return placeholder data
    return { id: messageId, status, deliveredAt }
  }

  async getCampaignMessages(_campaignId: string) {
    // SMS models don't exist in current schema
    // Return empty array
    return []
  }

  async getMessages(_where: any = {}, _options: any = {}) {
    // SMS models don't exist in current schema
    // Return empty array
    return []
  }

  async getProviderStats(_providerId: string) {
    // SMS models don't exist in current schema
    // Return placeholder stats
    return { total: 0, sent: 0, delivered: 0, failed: 0 }
  }
}
