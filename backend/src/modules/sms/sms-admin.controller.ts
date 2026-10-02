/**
 * IRIB Digital Workplace Platform - SMS Admin Controller
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common'
import { JwtAuthGuard } from '../iam/jwt-auth.guard'
import { SmsService } from './sms.service'
// import { SmsTemplateService } from './sms-template.service'
// import { SmsCampaignService } from './sms-campaign.service'
import { SmsRepository } from './sms.repository'
import { RecipientResolverService } from './recipient-resolver.service'
// import { DeliveryTrackingService } from './delivery-tracking.service'
// import { SmsQueueService } from './sms-queue.service'

@Controller('admin/sms')
@UseGuards(JwtAuthGuard)
export class SmsAdminController {
  constructor(
    private readonly smsService: SmsService,
    // private readonly templateService: SmsTemplateService,
    // private readonly campaignService: SmsCampaignService,
    private readonly smsRepository: SmsRepository,
    private readonly recipientResolver: RecipientResolverService
    // private readonly trackingService: DeliveryTrackingService,
    // private readonly queueService: SmsQueueService,
  ) {}

  // ============================================================
  // Provider Configuration
  // ============================================================

  /**
   * Get provider configuration status
   * GET /admin/sms/provider/status
   */
  @Get('provider/status')
  async getProviderStatus() {
    return this.smsService.getProviderStatus()
  }

  /**
   * Configure SMS provider
   * POST /admin/sms/provider/configure
   */
  @Post('provider/configure')
  async configureProvider(
    @Body()
    data: {
      providerName: string
      providerType: string
      apiUrl: string
      apiToken: string
      senderNumber?: string
      settings?: Record<string, any>
    }
  ) {
    return this.smsRepository.createProviderConfig(data)
  }

  /**
   * Update provider configuration
   * PUT /admin/sms/provider/configure
   */
  @Put('provider/configure')
  async updateProvider(
    @Body()
    data: {
      id?: string
      providerName?: string
      apiUrl?: string
      apiToken?: string
      senderNumber?: string
      settings?: Record<string, any>
      isActive?: boolean
    }
  ) {
    if (!data.id) {
      return { error: 'Provider ID is required' }
    }
    return this.smsRepository.updateProviderConfig(data.id, data)
  }

  /**
   * Update provider credit balance
   * POST /admin/sms/provider/update-credit
   */
  @Post('provider/update-credit')
  async updateCredit() {
    return this.smsService.updateCredit()
  }

  /**
   * Get provider statistics
   * GET /admin/sms/provider/stats
   */
  @Get('provider/stats')
  async getProviderStats() {
    const providerConfig = await this.smsRepository.getActiveProvider()
    if (!providerConfig) {
      return { error: 'No active provider configured' }
    }
    return this.smsRepository.getProviderStats(providerConfig.id)
  }

  // ============================================================
  // Template Management (disabled - service not available)
  // ============================================================

  /**
   * Get all SMS templates (disabled)
   * GET /admin/sms/templates
   */
  @Get('templates')
  async getTemplates(@Param('category') _category?: string) {
    return { message: 'Template service not available' }
  }

  /**
   * Get template by code (disabled)
   * GET /admin/sms/templates/:code
   */
  @Get('templates/:code')
  async getTemplate(@Param('code') _code: string) {
    return { message: 'Template service not available' }
  }

  /**
   * Create new SMS template (disabled)
   * POST /admin/sms/templates
   */
  @Post('templates')
  async createTemplate(@Body() _data: any) {
    return { message: 'Template service not available' }
  }

  /**
   * Update SMS template (disabled)
   * PUT /admin/sms/templates/:code
   */
  @Put('templates/:code')
  async updateTemplate(@Param('code') _code: string, @Body() _data: any) {
    return { message: 'Template service not available' }
  }

  /**
   * Delete SMS template (disabled)
   * DELETE /admin/sms/templates/:code
   */
  @Delete('templates/:code')
  async deleteTemplate(@Param('code') _code: string) {
    return { message: 'Template service not available' }
  }

  // ============================================================
  // Campaign Management (disabled - service not available)
  // ============================================================

  /**
   * Get all campaigns (disabled)
   * GET /admin/sms/campaigns
   */
  @Get('campaigns')
  async getCampaigns(@Request() _req: any) {
    return { message: 'Campaign service not available' }
  }

  /**
   * Get campaign by ID with details (disabled)
   * GET /admin/sms/campaigns/:id
   */
  @Get('campaigns/:id')
  async getCampaign(@Param('id') _id: string) {
    return { message: 'Campaign service not available' }
  }

  /**
   * Create new SMS campaign (disabled)
   * POST /admin/sms/campaigns
   */
  @Post('campaigns')
  async createCampaign(@Body() _data: any, @Request() _req: any) {
    return { message: 'Campaign service not available' }
  }

  /**
   * Update campaign status (disabled)
   * PUT /admin/sms/campaigns/:id/status
   */
  @Put('campaigns/:id/status')
  async updateCampaignStatus(@Param('id') _id: string, @Body() _data: { status: string }) {
    return { message: 'Campaign service not available' }
  }

  /**
   * Delete campaign (disabled)
   * DELETE /admin/sms/campaigns/:id
   */
  @Delete('campaigns/:id')
  async deleteCampaign(@Param('id') _id: string) {
    return { message: 'Campaign service not available' }
  }

  // ============================================================
  // Recipient Targeting
  // ============================================================

  /**
   * Get available departments for targeting
   * GET /admin/sms/targeting/departments
   */
  @Get('targeting/departments')
  async getDepartments() {
    return this.recipientResolver.getAvailableDepartments()
  }

  /**
   * Get available roles for targeting
   * GET /admin/sms/targeting/roles
   */
  @Get('targeting/roles')
  async getRoles() {
    return this.recipientResolver.getAvailableRoles()
  }

  /**
   * Resolve recipients based on criteria
   * POST /admin/sms/targeting/resolve
   */
  @Post('targeting/resolve')
  async resolveRecipients(@Body() criteria: any) {
    return this.recipientResolver.resolveRecipients(criteria)
  }

  /**
   * Get recipient count based on criteria
   * POST /admin/sms/targeting/count
   */
  @Post('targeting/count')
  async getRecipientCount(@Body() criteria: any) {
    return this.recipientResolver.getRecipientCount(criteria)
  }

  // ============================================================
  // Message History & Reports
  // ============================================================

  /**
   * Get SMS message history
   * GET /admin/sms/messages
   */
  @Get('messages')
  async getMessages(@Request() req: any) {
    const { campaignId, status, limit = 50, offset = 0 } = req.query

    const where: any = {}
    if (campaignId) where.campaignId = campaignId
    if (status) where.status = status

    const messages = await this.smsRepository.getMessages(where, {
      take: Number(limit),
      skip: Number(offset),
      orderBy: { sentAt: 'desc' },
    })

    return messages
  }

  /**
   * Get delivery statistics for a campaign (disabled)
   * GET /admin/sms/campaigns/:id/delivery-stats
   */
  @Get('campaigns/:id/delivery-stats')
  async getCampaignDeliveryStats(@Param('id') _id: string) {
    return { message: 'Tracking service not available' }
  }

  /**
   * Get overall SMS statistics
   * GET /admin/sms/stats
   */
  @Get('stats')
  async getOverallStats() {
    const providerConfig = await this.smsRepository.getActiveProvider()
    if (!providerConfig) {
      return { error: 'No active provider configured' }
    }

    const stats = await this.smsRepository.getProviderStats(providerConfig.id)
    // const queueStats = await this.queueService.getQueueStats()

    return {
      provider: stats,
      campaigns: { total: 0, active: 0, completed: 0 },
      queue: { sms: { waiting: 0, active: 0, completed: 0, failed: 0 } },
    }
  }

  /**
   * Update delivery status for a campaign (disabled)
   * POST /admin/sms/campaigns/:id/update-status
   */
  @Post('campaigns/:id/update-status')
  async updateCampaignDeliveryStatus(@Param('id') _id: string) {
    return { message: 'Tracking service not available' }
  }

  /**
   * Get queue statistics (disabled)
   * GET /admin/sms/queue/stats
   */
  @Get('queue/stats')
  async getQueueStats() {
    return { message: 'Queue service not available' }
  }

  /**
   * Pause SMS queue (disabled)
   * POST /admin/sms/queue/pause
   */
  @Post('queue/pause')
  async pauseQueue() {
    return { message: 'Queue service not available' }
  }

  /**
   * Resume SMS queue (disabled)
   * POST /admin/sms/queue/resume
   */
  @Post('queue/resume')
  async resumeQueue() {
    return { message: 'Queue service not available' }
  }
}
