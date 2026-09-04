<<<<<<< C:/Users/meisam_jaf/Downloads/irib-digital-workplace/backend/src/common/guards/permissions.guard.ts
<<<<<<< C:/Users/meisam_jaf/Downloads/irib-digital-workplace/backend/src/common/guards/permissions.guard.ts
<<<<<<< C:/Users/meisam_jaf/Downloads/irib-digital-workplace/backend/src/common/guards/permissions.guard.ts
<<<<<<< C:/Users/meisam_jaf/Downloads/irib-digital-workplace/backend/src/common/guards/permissions.guard.ts
<<<<<<< C:/Users/meisam_jaf/Downloads/irib-digital-workplace/backend/src/common/guards/permissions.guard.ts
<<<<<<< C:/Users/meisam_jaf/Downloads/irib-digital-workplace/backend/src/common/guards/permissions.guard.ts
<<<<<<< C:/Users/meisam_jaf/Downloads/irib-digital-workplace/backend/src/common/guards/permissions.guard.ts
<<<<<<< C:/Users/meisam_jaf/Downloads/irib-digital-workplace/backend/src/common/guards/permissions.guard.ts
<<<<<<< C:/Users/meisam_jaf/Downloads/irib-digital-workplace/backend/src/common/guards/permissions.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata, Reflector } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

export const PERMISSION_KEY = 'permission'

export const RequirePermission = (permission: string) => {
  return SetMetadata(PERMISSION_KEY, permission)
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<string>(
      PERMISSION_KEY,
      context.getHandler(),
    )

    if (!requiredPermission) {
      return true // No permission required
    }

    const request = context.switchToHttp().getRequest()
    const userId = request.user?.id

    if (!userId) {
      throw new ForbiddenException('Authentication required')
    }

    // Check if user has the required permission
    const hasPermission = await this.checkPermission(userId, requiredPermission)

    if (!hasPermission) {
      throw new ForbiddenException(
        `Permission '${requiredPermission}' is required`,
      )
    }

    return true
  }

  private async checkPermission(userId: string, permission: string): Promise<boolean> {
    try {
      // Check if user has global admin role
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          roles: {
            where: {
              expiresAt: null,
              OR: [{ expiresAt: { gte: new Date() } }],
            },
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
        return false
      }

      // Check if user has admin role
      const isAdmin = user.roles.some((ra) =>
        ra.role.code === 'ADMIN',
      )
      if (isAdmin) {
        return true
      }

      // Parse permission (e.g., "content.create")
      const [entity, action] = permission.split('.')

      // Check if user has the specific permission
      for (const roleAssignment of user.roles) {
        for (const perm of roleAssignment.role.permissions) {
          if (perm.entity === entity && perm.action === action) {
            // Check scope if permission is scoped
            if (perm.scopeType === 'GLOBAL') {
              return true
            }

            // For scoped permissions, check if user has access to the resource
            // This will be handled at the resource level
            return true
          }
        }
      }

      return false
    } catch (error) {
      console.error('Error checking permission:', error)
      return false
    }
  }
}
=======
=======
>>>>>>> C:/Users/meisam_jaf/.windsurf/worktrees/irib-digital-workplace/irib-digital-workplace-oak-flywheel/backend/src/common/guards/permissions.guard.ts
=======
>>>>>>> C:/Users/meisam_jaf/.windsurf/worktrees/irib-digital-workplace/irib-digital-workplace-oak-flywheel/backend/src/common/guards/permissions.guard.ts
=======
>>>>>>> C:/Users/meisam_jaf/.windsurf/worktrees/irib-digital-workplace/irib-digital-workplace-oak-flywheel/backend/src/common/guards/permissions.guard.ts
=======
>>>>>>> C:/Users/meisam_jaf/.windsurf/worktrees/irib-digital-workplace/irib-digital-workplace-oak-flywheel/backend/src/common/guards/permissions.guard.ts
=======
>>>>>>> C:/Users/meisam_jaf/.windsurf/worktrees/irib-digital-workplace/irib-digital-workplace-oak-flywheel/backend/src/common/guards/permissions.guard.ts
=======
>>>>>>> C:/Users/meisam_jaf/.windsurf/worktrees/irib-digital-workplace/irib-digital-workplace-oak-flywheel/backend/src/common/guards/permissions.guard.ts
=======
>>>>>>> C:/Users/meisam_jaf/.windsurf/worktrees/irib-digital-workplace/irib-digital-workplace-oak-flywheel/backend/src/common/guards/permissions.guard.ts
=======
>>>>>>> C:/Users/meisam_jaf/.windsurf/worktrees/irib-digital-workplace/irib-digital-workplace-oak-flywheel/backend/src/common/guards/permissions.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PrismaService } from '../../prisma/prisma.service'

export const PERMISSION_KEY = 'permission'

export const RequirePermission = (permission: string) => {
  return SetMetadata(PERMISSION_KEY, permission)
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<string>(
      PERMISSION_KEY,
      context.getHandler(),
    )

    if (!requiredPermission) {
      return true // No permission required
    }

    const request = context.switchToHttp().getRequest()
    const userId = request.user?.id

    if (!userId) {
      throw new ForbiddenException('Authentication required')
    }

    // Check if user has the required permission
    const hasPermission = await this.checkPermission(userId, requiredPermission)

    if (!hasPermission) {
      throw new ForbiddenException(
        `Permission '${requiredPermission}' is required`,
      )
    }

    return true
  }

  private async checkPermission(userId: string, permission: string): Promise<boolean> {
    try {
      // Check if user has global admin role
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          roles: {
            where: {
              OR: [
                { expiresAt: null },
                { expiresAt: { gte: new Date() } },
              ],
            },
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
        return false
      }

      // Check if user has admin role
      const isAdmin = user.roles.some((ra) =>
        ra.role.code === 'ADMIN',
      )
      if (isAdmin) {
        return true
      }

      // Parse permission (e.g., "content.create")
      const [entity, action] = permission.split('.')

      // Check if user has the specific permission
      for (const roleAssignment of user.roles) {
        for (const perm of roleAssignment.role.permissions) {
          if (perm.entity === entity && perm.action === action) {
            // Check scope if permission is scoped
            if (roleAssignment.scopeType === 'GLOBAL') {
              return true
            }

            // For scoped permissions, check if user has access to the resource
            // This will be handled at the resource level
            return true
          }
        }
      }

      return false
    } catch (error) {
      console.error('Error checking permission:', error)
      return false
    }
  }
}
>>>>>>> C:/Users/meisam_jaf/.windsurf/worktrees/irib-digital-workplace/irib-digital-workplace-oak-flywheel/backend/src/common/guards/permissions.guard.ts
