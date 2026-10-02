/**
 * IRIB Digital Workplace Platform - Permissions Management Controller
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { PermissionService } from '../services/permission.service'
import { JwtAuthGuard } from '../../modules/iam/jwt-auth.guard'
import { RequirePermission } from '../guards/permissions.guard'

@ApiTags('Permissions')
@Controller('api/v1/permissions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PermissionsController {
  constructor(private readonly permissionService: PermissionService) {}

  /**
   * Get all permissions for the current user
   */
  @Get('my-permissions')
  @ApiOperation({ summary: 'Get current user permissions' })
  @ApiResponse({ status: 200, description: 'Permissions retrieved successfully' })
  @RequirePermission('Permission.READ')
  async getMyPermissions(@Query('userId') userId?: string) {
    // If userId is provided, an admin can view another user's permissions
    // Otherwise, get the current user's permissions (would need to be extracted from JWT)
    const targetUserId = userId || 'current-user-id' // This should come from JWT
    return this.permissionService.getUserPermissions(targetUserId)
  }

  /**
   * Get all available atomic permissions
   */
  @Get('all')
  @ApiOperation({ summary: 'Get all available permissions' })
  @ApiResponse({ status: 200, description: 'Permissions retrieved successfully' })
  @RequirePermission('Permission.READ')
  async getAllPermissions() {
    return this.permissionService.getAllPermissions()
  }

  /**
   * Get all roles with their permissions
   */
  @Get('roles')
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully' })
  @RequirePermission('Role.READ')
  async getAllRoles() {
    return this.permissionService.getAllRoles()
  }

  /**
   * Check if a user has a specific permission
   */
  @Get('check')
  @ApiOperation({ summary: 'Check if user has permission' })
  @ApiResponse({ status: 200, description: 'Permission check result' })
  @RequirePermission('Permission.READ')
  async checkPermission(
    @Query('userId') userId: string,
    @Query('entity') entity: string,
    @Query('action') action: string,
    @Query('departmentId') departmentId?: string,
    @Query('unitId') unitId?: string,
    @Query('ownerId') ownerId?: string
  ) {
    return this.permissionService.hasPermission(userId, entity, action, {
      departmentId,
      unitId,
      ownerId,
    })
  }

  /**
   * Grant a permission to a user
   */
  @Post('grant')
  @ApiOperation({ summary: 'Grant permission to user' })
  @ApiResponse({ status: 200, description: 'Permission granted successfully' })
  @RequirePermission('Permission.GRANT')
  async grantPermission(
    @Body()
    body: {
      userId: string
      roleId: string
      permissionId: string
      scopeType?: string
      scopeIds?: string[]
    }
  ) {
    return this.permissionService.grantPermission(
      body.userId,
      body.roleId,
      body.permissionId,
      body.scopeType,
      body.scopeIds
    )
  }

  /**
   * Revoke a permission from a user
   */
  @Post('revoke')
  @ApiOperation({ summary: 'Revoke permission from user' })
  @ApiResponse({ status: 200, description: 'Permission revoked successfully' })
  @RequirePermission('Permission.REVOKE')
  async revokePermission(@Body() body: { userId: string; roleId: string; permissionId: string }) {
    return this.permissionService.revokePermission(body.userId, body.roleId, body.permissionId)
  }

  /**
   * Assign a role to a user
   */
  @Post('roles/assign')
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiResponse({ status: 200, description: 'Role assigned successfully' })
  @RequirePermission('Role.ASSIGN')
  async assignRole(
    @Body()
    body: {
      userId: string
      roleId: string
      scopeType?: string
      scopeIds?: string[]
      assignedBy?: string
    }
  ) {
    return this.permissionService.assignRole(
      body.userId,
      body.roleId,
      body.scopeType,
      body.scopeIds,
      body.assignedBy
    )
  }

  /**
   * Remove a role from a user
   */
  @Delete('roles/:userId/:roleId')
  @ApiOperation({ summary: 'Remove role from user' })
  @ApiResponse({ status: 200, description: 'Role removed successfully' })
  @RequirePermission('Role.REMOVE')
  async removeRole(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    return this.permissionService.removeRole(userId, roleId)
  }

  /**
   * Create a new permission
   */
  @Post('create')
  @ApiOperation({ summary: 'Create new permission' })
  @ApiResponse({ status: 201, description: 'Permission created successfully' })
  @RequirePermission('Permission.CREATE')
  async createPermission(@Body() body: { entity: string; action: string; description?: string }) {
    return this.permissionService.createPermission(body.entity, body.action, body.description)
  }

  /**
   * Create a new role
   */
  @Post('roles/create')
  @ApiOperation({ summary: 'Create new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  @RequirePermission('Role.CREATE')
  async createRole(
    @Body()
    body: {
      code: string
      name: { fa: string; en: string }
      description?: string
      isSystem?: boolean
    }
  ) {
    return this.permissionService.createRole(body.code, body.name, body.description, body.isSystem)
  }

  /**
   * Add permission to a role
   */
  @Post('roles/:roleId/permissions/:permissionId')
  @ApiOperation({ summary: 'Add permission to role' })
  @ApiResponse({ status: 200, description: 'Permission added to role successfully' })
  @RequirePermission('Role.UPDATE')
  async addPermissionToRole(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string
  ) {
    return this.permissionService.addPermissionToRole(roleId, permissionId)
  }
}
