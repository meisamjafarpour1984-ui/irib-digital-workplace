import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common'
import { JwtAuthGuard } from '../iam/jwt-auth.guard'
import { SmsService } from './sms.service'
// import { SmsTemplateService } from './sms-template.service'
// import { SmsCampaignService } from './sms-campaign.service'
import { RecipientResolverService } from './recipient-resolver.service'

@Controller('sms')
export class SmsController {
  constructor(
    private readonly smsService: SmsService,
    // private readonly templateService: SmsTemplateService,
    // private readonly campaignService: SmsCampaignService,
    private readonly recipientResolver: RecipientResolverService
  ) {}

  /**
   * Send single SMS
   * POST /sms/send
   */
  @Post('send')
  @UseGuards(JwtAuthGuard)
  async sendSms(
    @Body()
    data: {
      recipient: string
      message: string
      templateCode?: string
      params?: Record<string, any>
    }
  ) {
    return this.smsService.send(data.recipient, data.message, {
      templateCode: data.templateCode,
      params: data.params,
    })
  }

  /**
   * Send bulk SMS
   * POST /sms/send-bulk
   */
  @Post('send-bulk')
  @UseGuards(JwtAuthGuard)
  async sendBulkSms(
    @Body()
    data: {
      recipients: string[]
      message: string
      templateCode?: string
      params?: Record<string, any>
    }
  ) {
    return this.smsService.sendBulk(data.recipients, data.message, {
      templateCode: data.templateCode,
      params: data.params,
    })
  }

  /**
   * Get provider status
   * GET /sms/provider/status
   */
  @Get('provider/status')
  @UseGuards(JwtAuthGuard)
  async getProviderStatus() {
    return this.smsService.getProviderStatus()
  }

  /**
   * Update provider credit
   * POST /sms/provider/update-credit
   */
  @Post('provider/update-credit')
  @UseGuards(JwtAuthGuard)
  async updateCredit() {
    return this.smsService.updateCredit()
  }

  /**
   * Get all templates (disabled - service not available)
   * GET /sms/templates
   */
  @Get('templates')
  @UseGuards(JwtAuthGuard)
  async getTemplates() {
    return { message: 'Template service not available' }
  }

  /**
   * Get template by code (disabled - service not available)
   * GET /sms/templates/:code
   */
  @Get('templates/:code')
  @UseGuards(JwtAuthGuard)
  async getTemplate(@Param('code') _code: string) {
    return { message: 'Template service not available' }
  }

  /**
   * Create template (disabled - service not available)
   * POST /sms/templates
   */
  @Post('templates')
  @UseGuards(JwtAuthGuard)
  async createTemplate(@Body() _data: any) {
    return { message: 'Template service not available' }
  }

  /**
   * Create campaign (disabled - service not available)
   * POST /sms/campaigns
   */
  @Post('campaigns')
  @UseGuards(JwtAuthGuard)
  async createCampaign(@Body() _data: any, @Request() _req: any) {
    return { message: 'Campaign service not available' }
  }

  /**
   * Get campaigns (disabled - service not available)
   * GET /sms/campaigns
   */
  @Get('campaigns')
  @UseGuards(JwtAuthGuard)
  async getCampaigns() {
    return { message: 'Campaign service not available' }
  }

  /**
   * Get campaign by ID (disabled - service not available)
   * GET /sms/campaigns/:id
   */
  @Get('campaigns/:id')
  @UseGuards(JwtAuthGuard)
  async getCampaign(@Param('id') _id: string) {
    return { message: 'Campaign service not available' }
  }

  /**
   * Get available departments for targeting
   * GET /sms/targeting/departments
   */
  @Get('targeting/departments')
  @UseGuards(JwtAuthGuard)
  async getDepartments() {
    return this.recipientResolver.getAvailableDepartments()
  }

  /**
   * Get available roles for targeting
   * GET /sms/targeting/roles
   */
  @Get('targeting/roles')
  @UseGuards(JwtAuthGuard)
  async getRoles() {
    return this.recipientResolver.getAvailableRoles()
  }

  /**
   * Resolve recipients based on criteria
   * POST /sms/targeting/resolve
   */
  @Post('targeting/resolve')
  @UseGuards(JwtAuthGuard)
  async resolveRecipients(@Body() criteria: any) {
    return this.recipientResolver.resolveRecipients(criteria)
  }

  /**
   * Get recipient count
   * POST /sms/targeting/count
   */
  @Post('targeting/count')
  @UseGuards(JwtAuthGuard)
  async getRecipientCount(@Body() criteria: any) {
    return this.recipientResolver.getRecipientCount(criteria)
  }
}
