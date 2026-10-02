/**
 * IRIB Digital Workplace Platform - RBAC Permission Guard
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
  Logger,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PrismaService } from '../../prisma/prisma.service'

export const PERMISSION_KEY = 'permission'
export const REQUIRE_SCOPE_KEY = 'requireScope'

export const RequirePermission = (permission: string) => {
  return SetMetadata(PERMISSION_KEY, permission)
}

export const RequireScope = (scopeType: 'GLOBAL' | 'DEPARTMENT' | 'UNIT' | 'OWNERSHIP') => {
  return SetMetadata(REQUIRE_SCOPE_KEY, scopeType)
}

interface PermissionCheckResult {
  hasPermission: boolean
  reason?: string
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name)

  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<string>(PERMISSION_KEY, context.getHandler())

    // If no permission is required, allow access
    if (!requiredPermission) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const userId = request.user?.sub

    if (!userId) {
      throw new ForbiddenException('Authentication required')
    }

    // Check if user has the required permission
    const permissionCheck = await this.checkPermission(userId, requiredPermission, request)

    if (!permissionCheck.hasPermission) {
      this.logger.warn(
        `Permission denied for user ${userId}: ${requiredPermission} - ${permissionCheck.reason}`
      )
      throw new ForbiddenException(
        `Permission '${requiredPermission}' is required. ${permissionCheck.reason || ''}`
      )
    }

    return true
  }

  /**
   * Parse permission string into entity and action
   * Example: "Content.CREATE" -> { entity: "Content", action: "CREATE" }
   */
  private parsePermission(permission: string): { entity: string; action: string } {
    const parts = permission.split('.')
    if (parts.length !== 2) {
      throw new Error(`Invalid permission format: ${permission}. Expected format: "Entity.Action"`)
    }
    return { entity: parts[0], action: parts[1] }
  }

  /**
   * Check if user has the required permission through RBAC
   */
  private async checkPermission(
    userId: string,
    requiredPermission: string,
    request: any
  ): Promise<PermissionCheckResult> {
    try {
      // Get user with their role assignments
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  permissions: true,
                },
              },
            },
          },
        },
      })

      if (!user) {
        return { hasPermission: false, reason: 'User not found' }
      }

      // Check if user is disabled
      if (user.status !== 'ACTIVE') {
        return { hasPermission: false, reason: 'User account is not active' }
      }

      // Parse the required permission
      const { entity, action } = this.parsePermission(requiredPermission)

      // Check explicit denies first (highest priority)
      for (const roleAssignment of user.roles) {
        if (roleAssignment.deniedPermissions.includes(requiredPermission)) {
          return { hasPermission: false, reason: 'Permission explicitly denied' }
        }
      }

      // Check explicit grants (second highest priority)
      for (const roleAssignment of user.roles) {
        if (roleAssignment.grantedPermissions.includes(requiredPermission)) {
          // If granted, check if scope allows access
          const scopeCheck = await this.checkScope(roleAssignment, request)
          if (scopeCheck.hasPermission) {
            return { hasPermission: true }
          }
          return { hasPermission: false, reason: scopeCheck.reason }
        }
      }

      // Check role-based permissions
      for (const roleAssignment of user.roles) {
        const rolePermissions = roleAssignment.role.permissions

        // Check if role has the required permission
        const hasRolePermission = rolePermissions.some(
          (perm) => perm.entity === entity && perm.action === action
        )

        if (hasRolePermission) {
          // If role has permission, check if scope allows access
          const scopeCheck = await this.checkScope(roleAssignment, request)
          if (scopeCheck.hasPermission) {
            return { hasPermission: true }
          }
          return { hasPermission: false, reason: scopeCheck.reason }
        }
      }

      return { hasPermission: false, reason: 'No role has the required permission' }
    } catch (error) {
      this.logger.error(`Error checking permission for user ${userId}:`, error)
      return { hasPermission: false, reason: 'Error checking permission' }
    }
  }

  /**
   * Check if the scope allows access to the resource
   */
  private async checkScope(roleAssignment: any, request: any): Promise<PermissionCheckResult> {
    const { scopeType, scopeIds } = roleAssignment

    // GLOBAL scope allows access to everything
    if (scopeType === 'GLOBAL') {
      return { hasPermission: true }
    }

    // DEPARTMENT scope - check if user has access to the resource's department
    if (scopeType === 'DEPARTMENT') {
      const resourceDepartmentId = this.extractResourceDepartmentId(request)
      if (!resourceDepartmentId) {
        // If no department context, deny access for non-global scopes
        return { hasPermission: false, reason: 'Resource department context not found' }
      }

      if (scopeIds.includes(resourceDepartmentId)) {
        return { hasPermission: true }
      }
      return { hasPermission: false, reason: 'User does not have access to this department' }
    }

    // UNIT scope - check if user has access to the resource's unit
    if (scopeType === 'UNIT') {
      const resourceUnitId = this.extractResourceUnitId(request)
      if (!resourceUnitId) {
        return { hasPermission: false, reason: 'Resource unit context not found' }
      }

      if (scopeIds.includes(resourceUnitId)) {
        return { hasPermission: true }
      }
      return { hasPermission: false, reason: 'User does not have access to this unit' }
    }

    // OWNERSHIP scope - check if user owns the resource
    if (scopeType === 'OWNERSHIP') {
      const resourceOwnerId = this.extractResourceOwnerId(request)
      if (!resourceOwnerId) {
        return { hasPermission: false, reason: 'Resource ownership context not found' }
      }

      const userId = request.user?.id
      if (resourceOwnerId === userId) {
        return { hasPermission: true }
      }
      return { hasPermission: false, reason: 'User does not own this resource' }
    }

    return { hasPermission: false, reason: 'Unknown scope type' }
  }

  /**
   * Extract department ID from the request context
   * This should be implemented based on your route structure
   */
  private extractResourceDepartmentId(request: any): string | null {
    // Try to get from params
    if (request.params?.departmentId) {
      return request.params.departmentId
    }

    // Try to get from body
    if (request.body?.departmentId) {
      return request.body.departmentId
    }

    // Try to get from query
    if (request.query?.departmentId) {
      return request.query.departmentId
    }

    // For content-related routes, try to get from content
    if (request.params?.id) {
      // This would require a database lookup in a real implementation
      // For now, return null to allow other checks
      return null
    }

    return null
  }

  /**
   * Extract unit ID from the request context
   */
  private extractResourceUnitId(request: any): string | null {
    if (request.params?.unitId) {
      return request.params.unitId
    }

    if (request.body?.unitId) {
      return request.body.unitId
    }

    if (request.query?.unitId) {
      return request.query.unitId
    }

    return null
  }

  /**
   * Extract owner ID from the request context
   */
  private extractResourceOwnerId(request: any): string | null {
    if (request.params?.userId) {
      return request.params.userId
    }

    if (request.body?.userId) {
      return request.body.userId
    }

    if (request.params?.id) {
      // For resources where the ID represents ownership
      // This would require a database lookup in a real implementation
      return null
    }

    return null
  }
}
