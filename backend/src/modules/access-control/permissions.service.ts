import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name)

  constructor(private readonly prisma: PrismaService) {}

  async checkPermission(
    userId: string,
    entity: string,
    action: string,
    resourceScopeIds?: string[]
  ) {
    try {
      // Get user's role assignments
      const assignments = await this.prisma.userRoleAssignment.findMany({
        where: {
          userId,
        },
        include: { role: true },
      })

      for (const assignment of assignments) {
        // Super Admin bypass
        if (assignment.role.code === 'SUPER_ADMIN' && assignment.scopeType === 'GLOBAL') {
          return true
        }

        // Check denied permissions
        if (assignment.deniedPermissions.includes(`${entity}.${action}`)) {
          continue
        }

        // Check role permissions
        const role = await this.prisma.role.findUnique({
          where: { id: assignment.roleId },
          include: { permissions: true },
        })

        if (!role?.permissions.some((p) => p.entity === entity && p.action === action)) continue

        // Check scope intersection
        if (assignment.scopeType === 'GLOBAL') return true
        if (
          resourceScopeIds?.length &&
          assignment.scopeIds.some((id) => resourceScopeIds.includes(id))
        ) {
          return true
        }
      }

      return false
    } catch (error) {
      this.logger.error(`Error checking permission for user ${userId}:`, error)
      return false
    }
  }

  async getEffectivePermissions(userId: string) {
    try {
      const assignments = await this.prisma.userRoleAssignment.findMany({
        where: {
          userId,
        },
        include: {
          role: {
            include: {
              permissions: true,
            },
          },
        },
      })

      const permissions = new Set<string>()
      const denied = new Set<string>()

      for (const assignment of assignments) {
        // Super Admin
        if (assignment.role.code === 'SUPER_ADMIN') {
          return { permissions: ['*'], scopes: ['*'] }
        }

        // Collect denied
        assignment.deniedPermissions.forEach((p) => denied.add(p))

        // Collect granted from role
        for (const rp of assignment.role.permissions) {
          const key = `${rp.entity}.${rp.action}`
          if (!denied.has(key)) {
            permissions.add(key)
          }
        }

        // Collect granted overrides
        assignment.grantedPermissions.forEach((p) => {
          if (!denied.has(p)) permissions.add(p)
        })
      }

      return {
        permissions: Array.from(permissions),
        scopes: [...new Set(assignments.flatMap((a) => a.scopeIds))],
      }
    } catch (error) {
      this.logger.error(`Error getting effective permissions for user ${userId}:`, error)
      return { permissions: [], scopes: [] }
    }
  }

  async getPermissionMatrix() {
    try {
      const permissions = await this.prisma.atomicPermission.findMany({
        orderBy: [{ entity: 'asc' }, { action: 'asc' }],
      })

      const roles = await this.prisma.role.findMany({
        include: {
          permissions: true,
        },
      })

      return { permissions, roles }
    } catch (error) {
      this.logger.error('Error getting permission matrix:', error)
      return { permissions: [], roles: [] }
    }
  }

  async createPermission(data: { entity: string; action: string; description?: string }) {
    try {
      return this.prisma.atomicPermission.create({
        data: {
          entity: data.entity,
          action: data.action,
          description: data.description,
        },
      })
    } catch (error) {
      this.logger.error('Error creating permission:', error)
      throw new Error('Failed to create permission')
    }
  }

  async updatePermission(
    id: string,
    data: { entity?: string; action?: string; description?: string }
  ) {
    try {
      await this.prisma.atomicPermission.findUnique({ where: { id } })
      return this.prisma.atomicPermission.update({
        where: { id },
        data,
      })
    } catch (error) {
      this.logger.error(`Error updating permission ${id}:`, error)
      throw new Error('Failed to update permission')
    }
  }

  async deletePermission(id: string) {
    try {
      await this.prisma.atomicPermission.findUnique({ where: { id } })
      return this.prisma.atomicPermission.delete({ where: { id } })
    } catch (error) {
      this.logger.error(`Error deleting permission ${id}:`, error)
      throw new Error('Failed to delete permission')
    }
  }

  async getPermissionsByEntity(entity: string) {
    return this.prisma.atomicPermission.findMany({
      where: { entity },
      orderBy: { action: 'asc' },
    })
  }

  async getAllEntities() {
    const permissions = await this.prisma.atomicPermission.findMany({
      select: { entity: true },
      distinct: ['entity'],
      orderBy: { entity: 'asc' },
    })
    return permissions.map((p) => p.entity)
  }
}
