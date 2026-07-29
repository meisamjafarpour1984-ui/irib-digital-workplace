import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { RolesService } from './roles.service'
import { JwtAuthGuard } from '../iam/jwt-auth.guard'

@ApiTags('Roles')
@Controller('roles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'List all roles' })
  async findAll() {
    return this.rolesService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID' })
  async findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id)
  }

  @Post()
  @ApiOperation({ summary: 'Create new role' })
  async create(@Body() body: { code: string; name: any; description?: string }) {
    return this.rolesService.create(body)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update role' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.rolesService.update(id, body)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role' })
  async remove(@Param('id') id: string) {
    return this.rolesService.remove(id)
  }

  @Post(':id/permissions')
  @ApiOperation({ summary: 'Assign permission to role' })
  async assignPermission(@Param('id') id: string, @Body() body: { permissionId: string }) {
    return this.rolesService.assignPermission(id, body.permissionId)
  }

  @Delete(':id/permissions/:permissionId')
  @ApiOperation({ summary: 'Remove permission from role' })
  async removePermission(@Param('id') id: string, @Param('permissionId') permissionId: string) {
    return this.rolesService.removePermission(id, permissionId)
  }
}
