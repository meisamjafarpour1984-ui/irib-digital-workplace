import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { SmsCampaignStatus } from '@prisma/client'

@Injectable()
export class SmsCampaignService {
  private readonly logger = new Logger(SmsCampaignService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create SMS campaign
   */
  async createCampaign(data: {
    name: string
    description?: string
    templateId?: string
    providerConfigId: string
    scheduledAt?: Date
    createdBy?: string
  }) {
    return this.prisma.smsCampaign.create({
      data,
    })
  }

  /**
   * Get campaign by ID
   */
  async getCampaign(id: string) {
    return this.prisma.smsCampaign.findUnique({
      where: { id },
      include: {
        template: true,
        providerConfig: true,
        smsMessages: true,
      },
    })
  }

  /**
   * Get all campaigns
   */
  async getCampaigns(filters?: { status?: SmsCampaignStatus; createdBy?: string }) {
    return this.prisma.smsCampaign.findMany({
      where: filters as any,
      include: {
        template: true,
        providerConfig: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Update campaign status
   */
  async updateCampaignStatus(id: string, status: SmsCampaignStatus) {
    return this.prisma.smsCampaign.update({
      where: { id },
      data: {
        status,
        ...(status === 'SENDING' && { startedAt: new Date() }),
        ...(status === 'COMPLETED' && { completedAt: new Date() }),
      },
    })
  }

  /**
   * Update campaign statistics
   */
  async updateCampaignStats(
    id: string,
    stats: { sentCount?: number; deliveredCount?: number; failedCount?: number }
  ) {
    return this.prisma.smsCampaign.update({
      where: { id },
      data: stats,
    })
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(id: string) {
    return this.prisma.smsCampaign.delete({
      where: { id },
    })
  }
}
