/**
 * IRIB Digital Workplace Platform - Theme Controller
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { ThemeService } from './theme.service'
import { JwtAuthGuard } from '../iam/jwt-auth.guard'
import { PermissionsGuard, RequirePermission, RolesGuard, Roles } from '../../common/guards'
import {
  CreateThemeTokenDto,
  UpdateThemeTokenDto,
  ImportThemeDto,
  ThemePreviewDto,
} from './dto/theme.dto'

@ApiTags('Theme')
@Controller('theme')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class ThemeController {
  constructor(private readonly themeService: ThemeService) {}

  @Get('tokens')
  @ApiOperation({ summary: 'Get all theme tokens' })
  @RequirePermission('Theme.READ')
  async getAllTokens() {
    return this.themeService.getAllTokens()
  }

  @Get('tokens/category/:category')
  @ApiOperation({ summary: 'Get tokens by category' })
  @RequirePermission('Theme.READ')
  async getTokensByCategory(@Param('category') category: string) {
    return this.themeService.getTokensByCategory(category)
  }

  @Get('tokens/:id')
  @ApiOperation({ summary: 'Get token by ID' })
  @RequirePermission('Theme.READ')
  async getToken(@Param('id') id: string) {
    return this.themeService.getToken(id)
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active themes' })
  @RequirePermission('Theme.READ')
  async getActiveThemes() {
    return this.themeService.getActiveThemes()
  }

  @Get('scheduled')
  @ApiOperation({ summary: 'Get scheduled themes' })
  @RequirePermission('Theme.READ')
  async getScheduledThemes() {
    return this.themeService.getScheduledThemes()
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get theme statistics' })
  @RequirePermission('Theme.READ')
  async getStats() {
    return this.themeService.getThemeStats()
  }

  @Post('tokens')
  @ApiOperation({ summary: 'Create theme token' })
  @RequirePermission('Theme.MANAGE')
  @Roles('ADMIN', 'PORTAL_MANAGER')
  async createToken(@Body() data: CreateThemeTokenDto) {
    return this.themeService.createToken(data)
  }

  @Put('tokens/:id')
  @ApiOperation({ summary: 'Update theme token' })
  @RequirePermission('Theme.MANAGE')
  @Roles('ADMIN', 'PORTAL_MANAGER')
  async updateToken(@Param('id') id: string, @Body() data: UpdateThemeTokenDto) {
    return this.themeService.updateToken(id, data)
  }

  @Delete('tokens/:id')
  @ApiOperation({ summary: 'Delete theme token' })
  @RequirePermission('Theme.MANAGE')
  @Roles('ADMIN', 'PORTAL_MANAGER')
  async deleteToken(@Param('id') id: string) {
    return this.themeService.deleteToken(id)
  }

  @Post('tokens/:id/activate')
  @ApiOperation({ summary: 'Activate scheduled theme' })
  @RequirePermission('Theme.MANAGE')
  @Roles('ADMIN', 'PORTAL_MANAGER')
  async activateTheme(@Param('id') id: string) {
    return this.themeService.activateScheduledTheme(id)
  }

  @Post('preview')
  @ApiOperation({ summary: 'Get theme preview' })
  @RequirePermission('Theme.READ')
  async getPreview(@Body() data: ThemePreviewDto) {
    return this.themeService.getThemePreview(data.tokens)
  }

  @Get('export')
  @ApiOperation({ summary: 'Export theme' })
  @RequirePermission('Theme.READ')
  async exportTheme(@Query('category') category?: string) {
    return this.themeService.exportTheme(category)
  }

  @Post('import')
  @ApiOperation({ summary: 'Import theme' })
  @RequirePermission('Theme.MANAGE')
  @Roles('ADMIN', 'PORTAL_MANAGER')
  async importTheme(@Body() data: ImportThemeDto) {
    return this.themeService.importTheme(data)
  }
}
