/**
 * IRIB Digital Workplace Platform - Page Builder Controller
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { PageBuilderService } from './page-builder.service'
import { JwtAuthGuard } from '../iam/jwt-auth.guard'
import { PermissionsGuard, RequirePermission, RolesGuard, Roles } from '../../common/guards'

@ApiTags('Page Builder')
@Controller('page-builder')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class PageBuilderController {
  constructor(private readonly pageBuilderService: PageBuilderService) {}

  @Get('pages')
  @ApiOperation({ summary: 'Get all pages' })
  @RequirePermission('Page.READ')
  async getAllPages() {
    return this.pageBuilderService.getAllPages()
  }

  @Get('pages/:id')
  @ApiOperation({ summary: 'Get page by ID' })
  @RequirePermission('Page.READ')
  async getPage(@Param('id') id: string) {
    return this.pageBuilderService.getPage(id)
  }

  @Get('pages/slug/:slug')
  @ApiOperation({ summary: 'Get page by slug' })
  @RequirePermission('Page.READ')
  async getPageBySlug(@Param('slug') slug: string) {
    return this.pageBuilderService.getPageBySlug(slug)
  }

  @Post('pages')
  @ApiOperation({ summary: 'Create page' })
  @RequirePermission('Page.MANAGE')
  @Roles('ADMIN', 'PORTAL_MANAGER', 'CONTENT_MANAGER')
  async createPage(
    @Body()
    data: {
      title: any
      slug: string
      layout: any
      widgets: any[]
      status?: string
      createdBy?: string
    }
  ) {
    return this.pageBuilderService.createPage(data)
  }

  @Put('pages/:id')
  @ApiOperation({ summary: 'Update page' })
  @RequirePermission('Page.MANAGE')
  @Roles('ADMIN', 'PORTAL_MANAGER', 'CONTENT_MANAGER')
  async updatePage(@Param('id') id: string, @Body() data: any) {
    return this.pageBuilderService.updatePage(id, data)
  }

  @Delete('pages/:id')
  @ApiOperation({ summary: 'Delete page' })
  @RequirePermission('Page.MANAGE')
  @Roles('ADMIN', 'PORTAL_MANAGER')
  async deletePage(@Param('id') id: string) {
    return this.pageBuilderService.deletePage(id)
  }

  @Post('pages/:id/publish')
  @ApiOperation({ summary: 'Publish page' })
  @RequirePermission('Page.MANAGE')
  @Roles('ADMIN', 'PORTAL_MANAGER', 'CONTENT_MANAGER')
  async publishPage(@Param('id') id: string) {
    return this.pageBuilderService.publishPage(id)
  }

  @Post('pages/:id/unpublish')
  @ApiOperation({ summary: 'Unpublish page' })
  @RequirePermission('Page.MANAGE')
  @Roles('ADMIN', 'PORTAL_MANAGER', 'CONTENT_MANAGER')
  async unpublishPage(@Param('id') id: string) {
    return this.pageBuilderService.unpublishPage(id)
  }
}
