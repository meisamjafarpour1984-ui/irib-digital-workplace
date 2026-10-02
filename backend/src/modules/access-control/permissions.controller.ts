import { Controller, Get, Post, Body, UseGuards, Request, Param, Delete, Put } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { PermissionsService } from './permissions.service'
import { JwtAuthGuard } from '../iam/jwt-auth.guard'
import { PermissionsGuard, RequirePermission, RolesGuard, Roles } from '../../common/guards'

@ApiTags('Access Control')
@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post('check')
  @ApiOperation({ summary: 'Check if user has permission' })
  async checkPermission(
    @Request() req: any,
    @Body() body: { entity: string; action: string; scopeIds?: string[] }
  ) {
    const hasPermission = await this.permissionsService.checkPermission(
      req.user.sub,
      body.entity,
      body.action,
      body.scopeIds
    )
    return { hasPermission }
  }

  @Get('effective')
  @ApiOperation({ summary: 'Get effective permissions for current user' })
  async getEffectivePermissions(@Request() req: any) {
    return this.permissionsService.getEffectivePermissions(req.user.sub)
  }

  @Get('matrix')
  @ApiOperation({ summary: 'Get full permission matrix (Admin only)' })
  @RequirePermission('Role.READ')
  async getPermissionMatrix() {
    return this.permissionsService.getPermissionMatrix()
  }

  @Get('entities')
  @ApiOperation({ summary: 'Get all available permission entities' })
  @RequirePermission('Role.READ')
  async getEntities() {
    return this.permissionsService.getAllEntities()
  }

  @Get('entity/:entity')
  @ApiOperation({ summary: 'Get permissions for a specific entity' })
  @RequirePermission('Role.READ')
  async getPermissionsByEntity(@Param('entity') entity: string) {
    return this.permissionsService.getPermissionsByEntity(entity)
  }

  @Post()
  @ApiOperation({ summary: 'Create new permission' })
  @RequirePermission('Role.MANAGE')
  @Roles('ADMIN', 'PORTAL_MANAGER')
  async createPermission(@Body() body: { entity: string; action: string; description?: string }) {
    return this.permissionsService.createPermission(body)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update permission' })
  @RequirePermission('Role.MANAGE')
  @Roles('ADMIN', 'PORTAL_MANAGER')
  async updatePermission(
    @Param('id') id: string,
    @Body() body: { entity?: string; action?: string; description?: string }
  ) {
    return this.permissionsService.updatePermission(id, body)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete permission' })
  @RequirePermission('Role.MANAGE')
  @Roles('ADMIN')
  async deletePermission(@Param('id') id: string) {
    return this.permissionsService.deletePermission(id)
  }
}
