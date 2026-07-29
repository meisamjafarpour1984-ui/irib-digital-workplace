import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async checkPermission(
    userId: string,
    entity: string,
    action: string,
    resourceScopeIds?: string[]
  ) {
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
  }

  async getEffectivePermissions(userId: string) {
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
  }

  async getPermissionMatrix() {
    const permissions = await this.prisma.atomicPermission.findMany({
      orderBy: [{ entity: 'asc' }, { action: 'asc' }],
    })

    const roles = await this.prisma.role.findMany({
      include: {
        permissions: true,
      },
    })

    return { permissions, roles }
  }
}
