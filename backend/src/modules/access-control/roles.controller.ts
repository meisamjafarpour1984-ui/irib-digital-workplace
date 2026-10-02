import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { RolesService } from './roles.service'
import { JwtAuthGuard } from '../iam/jwt-auth.guard'
import { PermissionsGuard, RequirePermission, RolesGuard, Roles } from '../../common/guards'

@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'List all roles' })
  @RequirePermission('Role.READ')
  async findAll() {
    return this.rolesService.findAll()
  }

  @Get('matrix')
  @ApiOperation({ summary: 'Get permission matrix for all roles' })
  @RequirePermission('Role.READ')
  async getMatrix() {
    return this.rolesService.getRolePermissionsMatrix()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID' })
  @RequirePermission('Role.READ')
  async findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id)
  }

  @Post()
  @ApiOperation({ summary: 'Create new role' })
  @RequirePermission('Role.CREATE')
  @Roles('ADMIN', 'PORTAL_MANAGER')
  async create(@Body() body: { code: string; name: any; description?: string }) {
    return this.rolesService.create(body)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update role' })
  @RequirePermission('Role.UPDATE')
  @Roles('ADMIN', 'PORTAL_MANAGER')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.rolesService.update(id, body)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role' })
  @RequirePermission('Role.DELETE')
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    return this.rolesService.remove(id)
  }

  @Post(':id/permissions')
  @ApiOperation({ summary: 'Assign permission to role' })
  @RequirePermission('Role.MANAGE')
  @Roles('ADMIN', 'PORTAL_MANAGER')
  async assignPermission(@Param('id') id: string, @Body() body: { permissionId: string }) {
    return this.rolesService.assignPermission(id, body.permissionId)
  }

  @Post(':id/permissions/batch')
  @ApiOperation({ summary: 'Assign multiple permissions to role' })
  @RequirePermission('Role.MANAGE')
  @Roles('ADMIN', 'PORTAL_MANAGER')
  async assignPermissions(@Param('id') id: string, @Body() body: { permissionIds: string[] }) {
    return this.rolesService.assignPermissionToMany(id, body.permissionIds)
  }

  @Delete(':id/permissions/:permissionId')
  @ApiOperation({ summary: 'Remove permission from role' })
  @RequirePermission('Role.MANAGE')
  @Roles('ADMIN', 'PORTAL_MANAGER')
  async removePermission(@Param('id') id: string, @Param('permissionId') permissionId: string) {
    return this.rolesService.removePermission(id, permissionId)
  }
}
