import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { SmsCampaignService } from './sms-campaign.service'

@ApiTags('SMS Campaigns')
@Controller('sms/campaigns')
export class SmsCampaignController {
  constructor(private readonly campaignService: SmsCampaignService) {}

  @Post()
  @ApiOperation({ summary: 'Create SMS campaign' })
  @ApiResponse({ status: 201, description: 'Campaign created' })
  async createCampaign(@Body() body: any) {
    return this.campaignService.createCampaign(body)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get campaign by ID' })
  @ApiResponse({ status: 200, description: 'Campaign retrieved' })
  async getCampaign(@Param('id') id: string) {
    return this.campaignService.getCampaign(id)
  }

  @Get()
  @ApiOperation({ summary: 'Get all campaigns' })
  @ApiResponse({ status: 200, description: 'Campaigns retrieved' })
  async getCampaigns(@Query('status') status?: string, @Query('createdBy') createdBy?: string) {
    return this.campaignService.getCampaigns({ status: status as any, createdBy })
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update campaign status' })
  @ApiResponse({ status: 200, description: 'Campaign status updated' })
  async updateCampaignStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.campaignService.updateCampaignStatus(id, body.status as any)
  }

  @Patch(':id/stats')
  @ApiOperation({ summary: 'Update campaign statistics' })
  @ApiResponse({ status: 200, description: 'Campaign stats updated' })
  async updateCampaignStats(@Param('id') id: string, @Body() body: any) {
    return this.campaignService.updateCampaignStats(id, body)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete campaign' })
  @ApiResponse({ status: 200, description: 'Campaign deleted' })
  async deleteCampaign(@Param('id') id: string) {
    return this.campaignService.deleteCampaign(id)
  }
}
