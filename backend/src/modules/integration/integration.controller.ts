import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { IntegrationService } from './integration.service'
import { JwtAuthGuard } from '../iam/jwt-auth.guard'

@ApiTags('Integration')
@Controller('integrations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Get('connectors')
  @ApiOperation({ summary: 'List legacy connectors' })
  async getConnectors() {
    return this.integrationService.getConnectors()
  }

  @Post('connectors/:id/sync')
  @ApiOperation({ summary: 'Trigger legacy data sync' })
  async syncLegacy(@Param('id') id: string) {
    return this.integrationService.syncLegacyData(id)
  }

  @Get('webhooks')
  @ApiOperation({ summary: 'List webhooks' })
  async getWebhooks() {
    return this.integrationService.getWebhooks()
  }

  @Post('webhooks')
  @ApiOperation({ summary: 'Create webhook' })
  async createWebhook(@Body() body: { name: string; url: string; events: string[] }) {
    return this.integrationService.createWebhook(body)
  }

  @Delete('webhooks/:id')
  @ApiOperation({ summary: 'Delete webhook' })
  async deleteWebhook(@Param('id') id: string) {
    return this.integrationService.deleteWebhook(id)
  }
}
