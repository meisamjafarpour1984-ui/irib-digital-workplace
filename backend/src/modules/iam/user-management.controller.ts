import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger'
import { UserManagementService } from './user-management.service'
import { JwtAuthGuard } from './jwt-auth.guard'
import { PermissionsGuard, RequirePermission, RolesGuard, Roles } from '../../common/guards'
import { CreateUserDto, UpdateUserDto } from './dto/user.dto'

@ApiTags('User Management')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Get()
  @ApiOperation({
    summary: 'List all users',
    description:
      'Returns a paginated list of users with optional filtering by status, department, role, and search term. Requires User.READ permission.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by user status (ACTIVE, DISABLED, PENDING)',
  })
  @ApiQuery({ name: 'departmentId', required: false, description: 'Filter by department ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
    example: '1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 20)',
    example: '20',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by name, personnel code, or email',
  })
  @ApiQuery({ name: 'roleCode', required: false, description: 'Filter by role code' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - User.READ permission required' })
  @RequirePermission('User.READ')
  async findAll(
    @Query('status') status?: string,
    @Query('departmentId') departmentId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('roleCode') roleCode?: string
  ) {
    return this.userManagementService.findAll({
      status,
      departmentId,
      page: parseInt(page || '1'),
      limit: parseInt(limit || '20'),
      search,
      roleCode,
    })
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@Request() req: any) {
    return this.userManagementService.findOne(req.user.sub)
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMe(@Request() req: any, @Body() updateDto: UpdateUserDto) {
    return this.userManagementService.update(req.user.sub, updateDto)
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics' })
  @RequirePermission('User.READ')
  async getStats() {
    return this.userManagementService.getUserStats()
  }

  @Get('personnel/:personnelCode')
  @ApiOperation({ summary: 'Get user by personnel code' })
  @RequirePermission('User.READ')
  async findByPersonnelCode(@Param('personnelCode') personnelCode: string) {
    return this.userManagementService.findByPersonnelCode(personnelCode)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @RequirePermission('User.READ')
  async findOne(@Param('id') id: string) {
    return this.userManagementService.findOne(id)
  }

  @Post()
  @ApiOperation({ summary: 'Create user (admin)' })
  @RequirePermission('User.CREATE')
  @Roles('ADMIN', 'PORTAL_MANAGER', 'DEPARTMENT_OFFICER')
  async create(@Body() createDto: CreateUserDto) {
    return this.userManagementService.create(createDto)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  @RequirePermission('User.UPDATE')
  @Roles('ADMIN', 'PORTAL_MANAGER', 'DEPARTMENT_OFFICER')
  async update(@Param('id') id: string, @Body() updateDto: UpdateUserDto) {
    return this.userManagementService.update(id, updateDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user (soft)' })
  @RequirePermission('User.DELETE')
  @Roles('ADMIN', 'PORTAL_MANAGER')
  async remove(@Param('id') id: string) {
    return this.userManagementService.remove(id)
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore deleted user' })
  @RequirePermission('User.MANAGE')
  @Roles('ADMIN')
  async restore(@Param('id') id: string) {
    return this.userManagementService.restore(id)
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Toggle user status' })
  @RequirePermission('User.UPDATE')
  @Roles('ADMIN', 'PORTAL_MANAGER')
  async toggleStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.userManagementService.toggleStatus(id, body.status)
  }

  @Post(':id/roles')
  @ApiOperation({ summary: 'Assign role to user' })
  @RequirePermission('UserRole.MANAGE')
  @Roles('ADMIN', 'PORTAL_MANAGER')
  async assignRole(
    @Param('id') id: string,
    @Body()
    body: {
      roleId: string
      scopeType: string
      scopeIds?: string[]
      deniedPermissions?: string[]
      grantedPermissions?: string[]
    }
  ) {
    return this.userManagementService.assignRole(id, body as any)
  }

  @Put(':id/roles/:roleId')
  @ApiOperation({ summary: 'Update role assignment' })
  @RequirePermission('UserRole.MANAGE')
  @Roles('ADMIN', 'PORTAL_MANAGER')
  async updateRoleAssignment(
    @Param('id') id: string,
    @Param('roleId') roleId: string,
    @Body()
    body: {
      scopeType?: string
      scopeIds?: string[]
      deniedPermissions?: string[]
      grantedPermissions?: string[]
    }
  ) {
    return this.userManagementService.updateRoleAssignment(id, roleId, body as any)
  }

  @Delete(':id/roles/:roleId')
  @ApiOperation({ summary: 'Remove role from user' })
  @RequirePermission('UserRole.MANAGE')
  @Roles('ADMIN', 'PORTAL_MANAGER')
  async removeRole(@Param('id') id: string, @Param('roleId') roleId: string) {
    return this.userManagementService.removeRole(id, roleId)
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: 'Get user effective permissions' })
  @RequirePermission('User.READ')
  async getPermissions(@Param('id') id: string) {
    return this.userManagementService.getEffectivePermissions(id)
  }
}
