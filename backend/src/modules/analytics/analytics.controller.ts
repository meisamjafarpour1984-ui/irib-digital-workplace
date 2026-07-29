import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AnalyticsService } from './analytics.service'
import { JwtAuthGuard } from '../iam/jwt-auth.guard'

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('kpi')
  @ApiOperation({ summary: 'Get KPI metrics' })
  async getKPIs() {
    return this.analyticsService.getKPIs()
  }

  @Get('content-stats')
  @ApiOperation({ summary: 'Get content statistics' })
  async getContentStats(@Query('period') period?: string) {
    return this.analyticsService.getContentStats({ period })
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs' })
  async getAuditLogs(@Query('entityType') entityType?: string, @Query('limit') limit?: string) {
    return this.analyticsService.getAuditLogs({ entityType, limit: parseInt(limit || '50') })
  }

  @Post('page-views')
  @ApiOperation({ summary: 'Log page view' })
  async logPageView(
    @Body() body: { path: string; userId?: string; ip?: string; userAgent?: string }
  ) {
    return this.analyticsService.logPageView(body)
  }
}
