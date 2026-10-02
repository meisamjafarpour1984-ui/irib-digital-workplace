import { Controller, Get, Post, Param, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { DeliveryTrackingService } from './delivery-tracking.service'

@ApiTags('SMS Delivery Tracking')
@Controller('sms/delivery-tracking')
export class DeliveryTrackingController {
  constructor(private readonly deliveryTrackingService: DeliveryTrackingService) {}

  @Post('track/:messageId')
  @ApiOperation({ summary: 'Track delivery status for a specific message' })
  @ApiResponse({ status: 200, description: 'Delivery status retrieved' })
  async trackDelivery(@Param('messageId') messageId: string) {
    return this.deliveryTrackingService.trackDelivery(messageId)
  }

  @Post('campaign/:campaignId')
  @ApiOperation({ summary: 'Update delivery status for a campaign' })
  @ApiResponse({ status: 200, description: 'Campaign status updated' })
  async updateCampaignStatus(@Param('campaignId') campaignId: string) {
    return this.deliveryTrackingService.updateCampaignStatus(campaignId)
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get delivery statistics' })
  @ApiResponse({ status: 200, description: 'Delivery statistics' })
  async getStats(@Query('campaignId') campaignId?: string) {
    return this.deliveryTrackingService.getStats(campaignId)
  }

  @Get('campaign/:campaignId/report')
  @ApiOperation({ summary: 'Get delivery report for a campaign' })
  @ApiResponse({ status: 200, description: 'Campaign report' })
  async getCampaignReport(@Param('campaignId') campaignId: string) {
    return this.deliveryTrackingService.getCampaignReport(campaignId)
  }
}
