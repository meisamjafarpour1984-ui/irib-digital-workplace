/**
 * IRIB Digital Workplace Platform - Roles Guard
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

export const ROLES_KEY = 'roles'

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles)

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name)

  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler())

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const userId = request.user?.sub

    if (!userId) {
      throw new ForbiddenException('Authentication required')
    }

    // Get user with their role assignments
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    })

    if (!user) {
      throw new ForbiddenException('User not found')
    }

    // Check if user is disabled
    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException('User account is not active')
    }

    // Check if user has any of the required roles
    const userRoles = user.roles.map((roleAssignment) => roleAssignment.role.code)
    const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role))

    if (!hasRequiredRole) {
      this.logger.warn(
        `Access denied for user ${userId}: Required roles [${requiredRoles.join(', ')}], User roles [${userRoles.join(', ')}]`
      )
      throw new ForbiddenException(
        `One of the following roles is required: ${requiredRoles.join(', ')}`
      )
    }

    return true
  }
}
