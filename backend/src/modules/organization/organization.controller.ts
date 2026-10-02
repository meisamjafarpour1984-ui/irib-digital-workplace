import { Controller, Get, Post, Put, Param, Body, UseGuards, Delete } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { OrganizationService } from './organization.service'
import { JwtAuthGuard } from '../iam/jwt-auth.guard'
import { PermissionsGuard, RequirePermission, RolesGuard, Roles } from '../../common/guards'

@ApiTags('Organization')
@Controller('organization')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get('tree')
  @ApiOperation({ summary: 'Get organization tree' })
  @RequirePermission('Organization.READ')
  async getTree() {
    return this.organizationService.getTree()
  }

  @Get('tree/flat')
  @ApiOperation({ summary: 'Get flat organization tree' })
  @RequirePermission('Organization.READ')
  async getTreeFlat() {
    return this.organizationService.getTreeFlat()
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get organization statistics' })
  @RequirePermission('Organization.READ')
  async getStats() {
    return this.organizationService.getOrgStats()
  }

  @Get('units/:slug')
  @ApiOperation({ summary: 'Get unit by slug' })
  @RequirePermission('Organization.READ')
  async getUnit(@Param('slug') slug: string) {
    return this.organizationService.getUnitBySlug(slug)
  }

  @Get('units/id/:id')
  @ApiOperation({ summary: 'Get unit by ID' })
  @RequirePermission('Organization.READ')
  async getUnitById(@Param('id') id: string) {
    return this.organizationService.getUnitById(id)
  }

  @Post('units')
  @ApiOperation({ summary: 'Create organization unit' })
  @RequirePermission('Organization.CREATE')
  @Roles('ADMIN', 'PORTAL_MANAGER')
  async createUnit(
    @Body()
    body: {
      name: any
      slug: string
      type?: string
      parentId?: string
      managerId?: string
      sortOrder?: number
    }
  ) {
    return this.organizationService.create(body)
  }

  @Put('units/:id')
  @ApiOperation({ summary: 'Update organization unit' })
  @RequirePermission('Organization.UPDATE')
  @Roles('ADMIN', 'PORTAL_MANAGER', 'DEPARTMENT_OFFICER')
  async updateUnit(@Param('id') id: string, @Body() body: any) {
    return this.organizationService.update(id, body)
  }

  @Delete('units/:id')
  @ApiOperation({ summary: 'Delete organization unit' })
  @RequirePermission('Organization.DELETE')
  @Roles('ADMIN', 'PORTAL_MANAGER')
  async deleteUnit(@Param('id') id: string) {
    return this.organizationService.delete(id)
  }

  @Post('units/:id/move')
  @ApiOperation({ summary: 'Move unit to new parent' })
  @RequirePermission('Organization.UPDATE')
  @Roles('ADMIN', 'PORTAL_MANAGER')
  async moveUnit(
    @Param('id') id: string,
    @Body() body: { newParentId: string | null; newIndex?: number }
  ) {
    return this.organizationService.moveUnit(id, body.newParentId, body.newIndex)
  }

  @Post('units/:id/manager')
  @ApiOperation({ summary: 'Assign manager to unit' })
  @RequirePermission('Organization.UPDATE')
  @Roles('ADMIN', 'PORTAL_MANAGER', 'DEPARTMENT_OFFICER')
  async assignManager(@Param('id') id: string, @Body() body: { managerId: string }) {
    return this.organizationService.assignManager(id, body.managerId)
  }

  @Post('units/:id/members')
  @ApiOperation({ summary: 'Add member to unit' })
  @RequirePermission('Organization.UPDATE')
  @Roles('ADMIN', 'PORTAL_MANAGER', 'DEPARTMENT_OFFICER')
  async addMember(@Param('id') id: string, @Body() body: { userId: string; isPrimary?: boolean }) {
    return this.organizationService.addMember(id, body.userId, body.isPrimary)
  }

  @Delete('units/:id/members/:userId')
  @ApiOperation({ summary: 'Remove member from unit' })
  @RequirePermission('Organization.UPDATE')
  @Roles('ADMIN', 'PORTAL_MANAGER', 'DEPARTMENT_OFFICER')
  async removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.organizationService.removeMember(id, userId)
  }

  @Get('microsites/:slug')
  @ApiOperation({ summary: 'Get microsite config' })
  @RequirePermission('Organization.READ')
  async getMicrosite(@Param('slug') slug: string) {
    return this.organizationService.getMicrosite(slug)
  }

  @Put('microsites/:unitId')
  @ApiOperation({ summary: 'Update microsite config' })
  @RequirePermission('Organization.UPDATE')
  @Roles('ADMIN', 'PORTAL_MANAGER', 'DEPARTMENT_OFFICER')
  async updateMicrosite(@Param('unitId') unitId: string, @Body() body: any) {
    return this.organizationService.updateMicrosite(unitId, body)
  }
}
