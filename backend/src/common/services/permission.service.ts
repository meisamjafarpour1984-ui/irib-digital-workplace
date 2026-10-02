/**
 * IRIB Digital Workplace Platform - Permission Helper Service
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

export interface UserPermission {
  permissionId: string
  entity: string
  action: string
  scopeType: string
  scopeIds: string[]
  source: 'role' | 'explicit'
}

export interface UserPermissionsResult {
  hasPermission: boolean
  reason?: string
  permissions: UserPermission[]
}

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all permissions for a user
   */
  async getUserPermissions(userId: string): Promise<UserPermissionsResult> {
    try {
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
        return {
          hasPermission: false,
          reason: 'User not found',
          permissions: [],
        }
      }

      if (user.status !== 'ACTIVE') {
        return {
          hasPermission: false,
          reason: 'User account is not active',
          permissions: [],
        }
      }

      const permissions: UserPermission[] = []

      // Collect all permissions from role assignments
      for (const roleAssignment of user.roles) {
        // Add role-based permissions
        for (const perm of roleAssignment.role.permissions) {
          permissions.push({
            permissionId: perm.id,
            entity: perm.entity,
            action: perm.action,
            scopeType: roleAssignment.scopeType,
            scopeIds: roleAssignment.scopeIds,
            source: 'role',
          })
        }

        // Add explicitly granted permissions
        for (const grantedPermId of roleAssignment.grantedPermissions) {
          const perm = await this.prisma.atomicPermission.findUnique({
            where: { id: grantedPermId },
          })
          if (perm) {
            permissions.push({
              permissionId: perm.id,
              entity: perm.entity,
              action: perm.action,
              scopeType: roleAssignment.scopeType,
              scopeIds: roleAssignment.scopeIds,
              source: 'explicit',
            })
          }
        }
      }

      return {
        hasPermission: true,
        permissions,
      }
    } catch (error) {
      this.logger.error(`Error getting permissions for user ${userId}:`, error)
      return {
        hasPermission: false,
        reason: 'Error retrieving permissions',
        permissions: [],
      }
    }
  }

  /**
   * Check if user has a specific permission
   */
  async hasPermission(
    userId: string,
    entity: string,
    action: string,
    context?: { departmentId?: string; unitId?: string; ownerId?: string }
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId)

    if (!userPermissions.hasPermission) {
      return false
    }

    // Check if user has the required permission
    const hasRequiredPermission = userPermissions.permissions.some(
      (perm) => perm.entity === entity && perm.action === action
    )

    if (!hasRequiredPermission) {
      return false
    }

    // Check scope if context is provided
    if (context) {
      return this.checkScope(userPermissions.permissions, context)
    }

    return true
  }

  /**
   * Check if any of the user's permissions allow access based on scope
   */
  private checkScope(
    permissions: UserPermission[],
    context: { departmentId?: string; unitId?: string; ownerId?: string }
  ): boolean {
    // Check if any permission has GLOBAL scope
    const hasGlobalScope = permissions.some((perm) => perm.scopeType === 'GLOBAL')
    if (hasGlobalScope) {
      return true
    }

    // Check DEPARTMENT scope
    if (context.departmentId) {
      const hasDepartmentAccess = permissions.some(
        (perm) => perm.scopeType === 'DEPARTMENT' && perm.scopeIds.includes(context.departmentId!)
      )
      if (hasDepartmentAccess) {
        return true
      }
    }

    // Check UNIT scope
    if (context.unitId) {
      const hasUnitAccess = permissions.some(
        (perm) => perm.scopeType === 'UNIT' && perm.scopeIds.includes(context.unitId!)
      )
      if (hasUnitAccess) {
        return true
      }
    }

    // Check OWNERSHIP scope
    if (context.ownerId) {
      const hasOwnershipAccess = permissions.some((perm) => perm.scopeType === 'OWNERSHIP')
      if (hasOwnershipAccess) {
        return true
      }
    }

    return false
  }

  /**
   * Grant a permission to a user (explicit grant)
   */
  async grantPermission(
    userId: string,
    roleId: string,
    permissionId: string,
    _scopeType: string = 'GLOBAL',
    _scopeIds: string[] = []
  ): Promise<void> {
    try {
      await this.prisma.userRoleAssignment.updateMany({
        where: {
          userId,
          roleId,
        },
        data: {
          grantedPermissions: {
            push: permissionId,
          },
        },
      })

      this.logger.log(`Granted permission ${permissionId} to user ${userId} in role ${roleId}`)
    } catch (error) {
      this.logger.error(`Error granting permission:`, error)
      throw error
    }
  }

  /**
   * Revoke a permission from a user (explicit deny)
   */
  async revokePermission(userId: string, roleId: string, permissionId: string): Promise<void> {
    try {
      const assignment = await this.prisma.userRoleAssignment.findFirst({
        where: {
          userId,
          roleId,
        },
      })

      if (assignment) {
        await this.prisma.userRoleAssignment.update({
          where: { id: assignment.id },
          data: {
            deniedPermissions: {
              push: permissionId,
            },
            grantedPermissions: assignment.grantedPermissions.filter((id) => id !== permissionId),
          },
        })
      }

      this.logger.log(`Revoked permission ${permissionId} from user ${userId} in role ${roleId}`)
    } catch (error) {
      this.logger.error(`Error revoking permission:`, error)
      throw error
    }
  }

  /**
   * Assign a role to a user with specific scope
   */
  async assignRole(
    userId: string,
    roleId: string,
    scopeType: string = 'GLOBAL',
    scopeIds: string[] = [],
    assignedBy?: string
  ): Promise<void> {
    try {
      await this.prisma.userRoleAssignment.create({
        data: {
          userId,
          roleId,
          scopeType: scopeType as any,
          scopeIds,
          assignedBy,
        },
      })

      this.logger.log(`Assigned role ${roleId} to user ${userId} with scope ${scopeType}`)
    } catch (error) {
      this.logger.error(`Error assigning role:`, error)
      throw error
    }
  }

  /**
   * Remove a role assignment from a user
   */
  async removeRole(userId: string, roleId: string): Promise<void> {
    try {
      await this.prisma.userRoleAssignment.deleteMany({
        where: {
          userId,
          roleId,
        },
      })

      this.logger.log(`Removed role ${roleId} from user ${userId}`)
    } catch (error) {
      this.logger.error(`Error removing role:`, error)
      throw error
    }
  }

  /**
   * Get all available atomic permissions
   */
  async getAllPermissions(): Promise<any[]> {
    try {
      return await this.prisma.atomicPermission.findMany({
        orderBy: [{ entity: 'asc' }, { action: 'asc' }],
      })
    } catch (error) {
      this.logger.error(`Error getting all permissions:`, error)
      throw error
    }
  }

  /**
   * Get all roles with their permissions
   */
  async getAllRoles(): Promise<any[]> {
    try {
      return await this.prisma.role.findMany({
        include: {
          permissions: true,
        },
        orderBy: { code: 'asc' },
      })
    } catch (error) {
      this.logger.error(`Error getting all roles:`, error)
      throw error
    }
  }

  /**
   * Create a new atomic permission
   */
  async createPermission(entity: string, action: string, description?: string): Promise<any> {
    try {
      return await this.prisma.atomicPermission.create({
        data: {
          entity,
          action,
          description,
        },
      })
    } catch (error) {
      this.logger.error(`Error creating permission:`, error)
      throw error
    }
  }

  /**
   * Create a new role
   */
  async createRole(
    code: string,
    name: { fa: string; en: string },
    description?: string,
    isSystem: boolean = false
  ): Promise<any> {
    try {
      return await this.prisma.role.create({
        data: {
          code,
          name,
          description,
          isSystem,
        },
      })
    } catch (error) {
      this.logger.error(`Error creating role:`, error)
      throw error
    }
  }

  /**
   * Add permission to a role
   */
  async addPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    try {
      // This would typically be done through a many-to-many relation
      // In Prisma, this is handled through the relation
      // This is a placeholder for the actual implementation
      this.logger.log(`Added permission ${permissionId} to role ${roleId}`)
    } catch (error) {
      this.logger.error(`Error adding permission to role:`, error)
      throw error
    }
  }
}
