/**
 * IRIB Digital Workplace Platform - Storage Controller
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'
import { StorageService } from './storage.service'
import { JwtAuthGuard } from '../iam/jwt-auth.guard'
import { PermissionsGuard, RequirePermission, RolesGuard, Roles } from '../../common/guards'
import { UpdateStorageConfigDto } from './dto/storage.dto'

@ApiTags('Storage')
@Controller('storage')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get storage statistics' })
  @RequirePermission('Media.READ')
  async getStats() {
    return this.storageService.getStorageStats()
  }

  @Get('test-connection')
  @ApiOperation({ summary: 'Test storage connection' })
  @RequirePermission('Media.READ')
  async testConnection() {
    return this.storageService.testConnection()
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload single file' })
  @ApiConsumes('multipart/form-data')
  @RequirePermission('Media.CREATE')
  @Roles('ADMIN', 'PORTAL_MANAGER', 'CONTENT_MANAGER', 'DEPARTMENT_OFFICER')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@Body() body: any, @Body('metadata') metadata?: string) {
    const file = body.file
    if (!file) {
      throw new BadRequestException('No file provided')
    }
    const metadataObj = metadata ? JSON.parse(metadata) : undefined
    return this.storageService.uploadFile(file, undefined, metadataObj)
  }

  @Post('upload/multiple')
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @RequirePermission('Media.CREATE')
  @Roles('ADMIN', 'PORTAL_MANAGER', 'CONTENT_MANAGER', 'DEPARTMENT_OFFICER')
  @UseInterceptors(FileInterceptor('files'))
  async uploadMultipleFiles(@Body() body: any, @Body('metadata') metadata?: string) {
    const files = body.files
    if (!files) {
      throw new BadRequestException('No files provided')
    }
    const filesArray = Array.isArray(files) ? files : [files]
    const metadataObj = metadata ? JSON.parse(metadata) : undefined
    return this.storageService.uploadMultipleFiles(filesArray, undefined, metadataObj)
  }

  @Get('file/:id')
  @ApiOperation({ summary: 'Get file by ID' })
  @RequirePermission('Media.READ')
  async getFile(@Param('id') id: string) {
    return this.storageService.getAsset(id)
  }

  @Get('file/:id/url')
  @ApiOperation({ summary: 'Get file URL' })
  @RequirePermission('Media.READ')
  async getFileUrl(@Param('id') id: string) {
    return this.storageService.getAssetUrl(id)
  }

  @Get('file/:id/download')
  @ApiOperation({ summary: 'Download file' })
  @RequirePermission('Media.READ')
  async downloadFile(@Param('id') id: string) {
    return this.storageService.downloadFile(id)
  }

  @Delete('file/:id')
  @ApiOperation({ summary: 'Delete file' })
  @RequirePermission('Media.DELETE')
  @Roles('ADMIN', 'PORTAL_MANAGER', 'CONTENT_MANAGER')
  async deleteFile(@Param('id') id: string) {
    return this.storageService.deleteAsset(id)
  }

  @Post('config')
  @ApiOperation({ summary: 'Update storage configuration' })
  @RequirePermission('SystemSettings.UPDATE')
  @Roles('ADMIN')
  async updateConfig(@Body() config: UpdateStorageConfigDto) {
    // This would update environment variables or database config
    // For now, return success
    return { success: true, config }
  }

  @Get('config')
  @ApiOperation({ summary: 'Get current storage configuration' })
  @RequirePermission('SystemSettings.READ')
  async getConfig() {
    // Return current storage configuration (without secrets)
    return {
      provider: process.env.STORAGE_PROVIDER || 'local',
      uploadDir: process.env.UPLOAD_DIR || './uploads',
      // Don't return sensitive data like access keys
    }
  }
}
