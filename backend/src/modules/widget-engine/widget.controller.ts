import { Controller, Get, Post, Put, Param, Body, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { WidgetService } from './widget.service'
import { JwtAuthGuard } from '../iam/jwt-auth.guard'

@ApiTags('Widget Engine')
@Controller('widget-engine')
export class WidgetController {
  constructor(private readonly widgetService: WidgetService) {}

  @Get('registry')
  @ApiOperation({ summary: 'Get widget registry' })
  async getRegistry() {
    return this.widgetService.getRegistry()
  }

  @Get('pages/:pageKey')
  @ApiOperation({ summary: 'Get page layout' })
  async getPageLayout(@Param('pageKey') pageKey: string) {
    return this.widgetService.getPageLayout(pageKey)
  }

  @Get('pages/:pageKey/render-data')
  @ApiOperation({ summary: 'Get aggregated data for all widgets in a layout' })
  async getRenderData(@Param('pageKey') pageKey: string) {
    return this.widgetService.getRenderData(pageKey)
  }

  @Post('pages/:pageKey')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save page layout' })
  async saveLayout(@Param('pageKey') pageKey: string, @Body() body: any, @Request() req: any) {
    return this.widgetService.savePageLayout(pageKey, body.config, req.user.sub)
  }

  @Post('pages/:pageKey/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish page layout' })
  async publishLayout(@Param('pageKey') pageKey: string, @Request() req: any) {
    return this.widgetService.publishLayout(pageKey, req.user.sub)
  }

  @Get('theme/tokens')
  @ApiOperation({ summary: 'Get theme tokens' })
  async getThemeTokens() {
    return this.widgetService.getThemeTokens()
  }

  @Put('theme/tokens')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update theme tokens' })
  async updateThemeTokens(@Body() body: any, @Request() req: any) {
    return this.widgetService.updateThemeTokens(body.tokens, req.user.sub)
  }
}
