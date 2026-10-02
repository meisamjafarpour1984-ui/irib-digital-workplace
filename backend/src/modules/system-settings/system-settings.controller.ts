import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger'
import { SystemSettingsService } from './system-settings.service'
import { SettingCategory } from '@prisma/client'
import { JwtAuthGuard } from '../iam/jwt-auth.guard'
import { PermissionsGuard, RequirePermission, RolesGuard, Roles } from '../../common/guards'

@ApiTags('System Settings')
@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class SystemSettingsController {
  constructor(private readonly settingsService: SystemSettingsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all settings',
    description:
      'Returns all system settings with optional filtering by category and public visibility. Requires SystemSettings.READ permission.',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by setting category',
    enum: ['GENERAL', 'SECURITY', 'NOTIFICATION', 'INTEGRATION', 'UI'],
  })
  @ApiQuery({
    name: 'isPublic',
    required: false,
    description: 'Filter for public settings only (true/false)',
  })
  @ApiResponse({ status: 200, description: 'Settings retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - SystemSettings.READ permission required' })
  @RequirePermission('SystemSettings.READ')
  async getSettings(
    @Query('category') category?: SettingCategory,
    @Query('isPublic') isPublic?: string
  ) {
    const isPublicBool = isPublic === 'true' ? true : isPublic === 'false' ? false : undefined
    return this.settingsService.getSettings(category, isPublicBool)
  }

  @Get('category/:category')
  @ApiOperation({
    summary: 'Get settings by category',
    description:
      'Returns all settings belonging to a specific category. Requires SystemSettings.READ permission.',
  })
  @ApiParam({
    name: 'category',
    description: 'Setting category',
    enum: ['GENERAL', 'SECURITY', 'NOTIFICATION', 'INTEGRATION', 'UI'],
  })
  @ApiResponse({ status: 200, description: 'Settings retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @RequirePermission('SystemSettings.READ')
  async getSettingsByCategory(@Param('category') category: SettingCategory) {
    return this.settingsService.getSettingsByCategory(category)
  }

  @Get(':key')
  @ApiOperation({
    summary: 'Get setting by key',
    description:
      'Returns a specific setting by its unique key. Requires SystemSettings.READ permission.',
  })
  @ApiParam({ name: 'key', description: 'Setting key (unique identifier)', example: 'site.name' })
  @ApiResponse({ status: 200, description: 'Setting retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Setting not found' })
  @RequirePermission('SystemSettings.READ')
  async getSetting(@Param('key') key: string) {
    return this.settingsService.getSetting(key)
  }

  @Get(':key/history')
  @ApiOperation({
    summary: 'Get setting change history',
    description:
      'Returns the change history for a specific setting. Requires SystemSettings.READ permission.',
  })
  @ApiParam({ name: 'key', description: 'Setting key' })
  @ApiResponse({ status: 200, description: 'Setting history retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Setting not found' })
  @RequirePermission('SystemSettings.READ')
  async getSettingHistory(@Param('key') key: string) {
    return this.settingsService.getSettingHistory(key)
  }

  @Post()
  @ApiOperation({
    summary: 'Create or update setting',
    description:
      'Creates a new setting or updates an existing one. Requires SystemSettings.UPDATE permission and ADMIN or MANAGER role.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          description: 'Setting key (unique identifier)',
          example: 'site.name',
        },
        category: {
          type: 'string',
          description: 'Setting category',
          enum: ['GENERAL', 'SECURITY', 'NOTIFICATION', 'INTEGRATION', 'UI'],
        },
        value: { description: 'Setting value (any type)', example: 'IRIB Digital Workplace' },
        type: { type: 'string', description: 'Data type', example: 'string' },
        description: {
          description: 'Setting description (can be localized)',
          example: '{ fa: "نام سایت", en: "Site name" }',
        },
        isPublic: {
          type: 'boolean',
          description: 'Whether setting is publicly accessible',
          example: false,
        },
        isEditable: {
          type: 'boolean',
          description: 'Whether setting can be edited by users',
          example: true,
        },
        updatedBy: { type: 'string', description: 'User ID who made the change' },
      },
      required: ['key', 'category', 'value'],
    },
  })
  @ApiResponse({ status: 200, description: 'Setting saved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - SystemSettings.UPDATE permission and ADMIN/MANAGER role required',
  })
  @RequirePermission('SystemSettings.UPDATE')
  @Roles('ADMIN', 'MANAGER')
  async upsertSetting(
    @Body()
    body: {
      key: string
      category: SettingCategory
      value: any
      type?: string
      description?: any
      isPublic?: boolean
      isEditable?: boolean
      updatedBy?: string
    }
  ) {
    return this.settingsService.upsertSetting(
      body.key,
      body.category,
      body.value,
      body.type,
      body.description,
      body.isPublic,
      body.isEditable,
      body.updatedBy
    )
  }

  @Post('initialize')
  @ApiOperation({
    summary: 'Initialize default settings',
    description:
      'Initializes the system with default settings values. Requires SystemSettings.UPDATE permission and ADMIN role.',
  })
  @ApiResponse({ status: 200, description: 'Default settings initialized successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - SystemSettings.UPDATE permission and ADMIN role required',
  })
  @RequirePermission('SystemSettings.UPDATE')
  @Roles('ADMIN')
  async initializeDefaults() {
    return this.settingsService.initializeDefaults()
  }

  @Post('export')
  @ApiOperation({
    summary: 'Export all settings',
    description:
      'Exports all system settings to a backup format. Requires SystemSettings.READ permission.',
  })
  @ApiResponse({ status: 200, description: 'Settings exported successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - SystemSettings.READ permission required' })
  @RequirePermission('SystemSettings.READ')
  async exportSettings() {
    return this.settingsService.exportSettings()
  }

  @Post('import')
  @ApiOperation({
    summary: 'Import settings from backup',
    description:
      'Imports system settings from a backup file. Requires SystemSettings.UPDATE permission.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        settings: { type: 'array', description: 'Array of setting objects to import' },
        updatedBy: { type: 'string', description: 'User ID who is performing the import' },
      },
      required: ['settings'],
    },
  })
  @ApiResponse({ status: 200, description: 'Settings imported successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - SystemSettings.UPDATE permission required',
  })
  @RequirePermission('SystemSettings.UPDATE')
  async importSettings(@Body() body: any) {
    return this.settingsService.importSettings(body.settings, body.updatedBy)
  }

  @Delete(':key')
  @ApiOperation({
    summary: 'Delete setting',
    description: 'Deletes a system setting by its key. Requires SystemSettings.DELETE permission.',
  })
  @ApiParam({ name: 'key', description: 'Setting key to delete' })
  @ApiResponse({ status: 200, description: 'Setting deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - SystemSettings.DELETE permission required',
  })
  @ApiResponse({ status: 404, description: 'Setting not found' })
  @RequirePermission('SystemSettings.DELETE')
  async deleteSetting(@Param('key') key: string) {
    return this.settingsService.deleteSetting(key)
  }
}
