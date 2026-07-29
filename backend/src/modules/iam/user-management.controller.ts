import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { UserManagementService } from './user-management.service'
import { JwtAuthGuard } from './jwt-auth.guard'

@ApiTags('User Management')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Get()
  @ApiOperation({ summary: 'List all users' })
  async findAll(
    @Query('status') status?: string,
    @Query('departmentId') departmentId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.userManagementService.findAll({
      status,
      departmentId,
      page: parseInt(page || '1'),
      limit: parseInt(limit || '20'),
    })
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id') id: string) {
    return this.userManagementService.findOne(id)
  }

  @Post()
  @ApiOperation({ summary: 'Create user (admin)' })
  async create(
    @Body()
    body: {
      personnelCode: string
      name: string
      email?: string
      mobile?: string
      departmentIds?: string[]
    }
  ) {
    return this.userManagementService.create(body)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  async update(@Param('id') id: string, @Body() body: any) {
    return this.userManagementService.update(id, body)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user (soft)' })
  async remove(@Param('id') id: string) {
    return this.userManagementService.remove(id)
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Toggle user status' })
  async toggleStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.userManagementService.toggleStatus(id, body.status)
  }

  @Post(':id/roles')
  @ApiOperation({ summary: 'Assign role to user' })
  async assignRole(
    @Param('id') id: string,
    @Body() body: { roleId: string; scopeType: string; scopeIds?: string[] }
  ) {
    return this.userManagementService.assignRole(id, body)
  }

  @Delete(':id/roles/:roleId')
  @ApiOperation({ summary: 'Remove role from user' })
  async removeRole(@Param('id') id: string, @Param('roleId') roleId: string) {
    return this.userManagementService.removeRole(id, roleId)
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: 'Get user effective permissions' })
  async getPermissions(@Param('id') id: string) {
    return this.userManagementService.getEffectivePermissions(id)
  }
}
