import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { ScopeType } from '@prisma/client'

@Injectable()
export class UserManagementService {
  private readonly logger = new Logger(UserManagementService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    status?: string
    departmentId?: string
    page: number
    limit: number
    search?: string
    roleCode?: string
  }) {
    const { status, departmentId, page, limit, search, roleCode } = params
    const skip = (page - 1) * limit
    const where: any = { deletedAt: null }

    if (status) where.status = status
    if (departmentId) {
      where.departments = { some: { departmentId } }
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { personnelCode: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (roleCode) {
      where.roles = { some: { role: { code: roleCode } } }
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          departments: { include: { department: { select: { id: true, name: true } } } },
          roles: { include: { role: { select: { id: true, code: true, name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ])

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      include: {
        departments: { include: { department: true } },
        roles: { include: { role: true } },
        devices: true,
      },
    })
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  async findByPersonnelCode(personnelCode: string) {
    return this.prisma.user.findUnique({
      where: { personnelCode, deletedAt: null },
      include: {
        departments: { include: { department: true } },
        roles: { include: { role: true } },
      },
    })
  }

  async create(data: {
    personnelCode: string
    name: string
    nameFa?: string
    email?: string
    mobile?: string
    nationalCode?: string
    departmentIds?: string[]
    initialStatus?: string
  }) {
    try {
      const existing = await this.prisma.user.findFirst({
        where: {
          OR: [
            { personnelCode: data.personnelCode },
            ...(data.email ? [{ email: data.email }] : []),
            ...(data.nationalCode ? [{ nationalCode: data.nationalCode }] : []),
          ],
          deletedAt: null,
        },
      })
      if (existing) {
        if (existing.personnelCode === data.personnelCode) {
          throw new ConflictException('Personnel code already exists')
        }
        if (existing.email === data.email) {
          throw new ConflictException('Email already exists')
        }
        if (existing.nationalCode === data.nationalCode) {
          throw new ConflictException('National code already exists')
        }
      }

      return this.prisma.user.create({
        data: {
          personnelCode: data.personnelCode,
          name: data.name,
          nameFa: data.nameFa,
          email: data.email,
          mobile: data.mobile,
          nationalCode: data.nationalCode,
          status: (data.initialStatus || 'ACTIVE') as any,
          departments: data.departmentIds?.length
            ? { create: data.departmentIds.map((id) => ({ departmentId: id, isPrimary: false })) }
            : undefined,
        },
      })
    } catch (error) {
      this.logger.error('Error creating user:', error)
      if (error instanceof ConflictException) {
        throw error
      }
      throw new Error('Failed to create user')
    }
  }

  async update(
    id: string,
    data: {
      name?: string
      nameFa?: string
      email?: string
      mobile?: string
      nationalCode?: string
      departmentIds?: string[]
    }
  ) {
    await this.findOne(id)

    try {
      return this.prisma.user.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.nameFa && { nameFa: data.nameFa }),
          ...(data.email && { email: data.email }),
          ...(data.mobile && { mobile: data.mobile }),
          ...(data.nationalCode && { nationalCode: data.nationalCode }),
          ...(data.departmentIds && {
            departments: {
              deleteMany: {},
              create: data.departmentIds.map((id) => ({ departmentId: id, isPrimary: false })),
            },
          }),
        },
      })
    } catch (error) {
      this.logger.error(`Error updating user ${id}:`, error)
      throw new Error('Failed to update user')
    }
  }

  async remove(id: string) {
    await this.findOne(id)
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'DISABLED' },
    })
  }

  async restore(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })
    if (!user) throw new NotFoundException('User not found')
    if (!user.deletedAt) throw new Error('User is not deleted')

    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: null, status: 'ACTIVE' as any },
    })
  }

  async toggleStatus(id: string, status: string) {
    await this.findOne(id)
    return this.prisma.user.update({ where: { id }, data: { status: status as any } })
  }

  async assignRole(
    userId: string,
    data: {
      roleId: string
      scopeType: ScopeType
      scopeIds?: string[]
      deniedPermissions?: string[]
      grantedPermissions?: string[]
    }
  ) {
    await this.findOne(userId)

    // Check if assignment already exists
    const existing = await this.prisma.userRoleAssignment.findFirst({
      where: { userId, roleId: data.roleId, scopeType: data.scopeType },
    })

    if (existing) {
      throw new ConflictException('Role assignment already exists')
    }

    return this.prisma.userRoleAssignment.create({
      data: {
        userId,
        roleId: data.roleId,
        scopeType: data.scopeType,
        scopeIds: data.scopeIds || [],
        deniedPermissions: data.deniedPermissions || [],
        grantedPermissions: data.grantedPermissions || [],
      },
    })
  }

  async updateRoleAssignment(
    userId: string,
    roleId: string,
    data: {
      scopeType?: ScopeType
      scopeIds?: string[]
      deniedPermissions?: string[]
      grantedPermissions?: string[]
    }
  ) {
    const assignment = await this.prisma.userRoleAssignment.findFirst({
      where: { userId, roleId },
    })

    if (!assignment) {
      throw new NotFoundException('Role assignment not found')
    }

    return this.prisma.userRoleAssignment.update({
      where: { id: assignment.id },
      data: {
        ...(data.scopeType && { scopeType: data.scopeType }),
        ...(data.scopeIds && { scopeIds: data.scopeIds }),
        ...(data.deniedPermissions && { deniedPermissions: data.deniedPermissions }),
        ...(data.grantedPermissions && { grantedPermissions: data.grantedPermissions }),
      },
    })
  }

  async removeRole(userId: string, roleId: string) {
    return this.prisma.userRoleAssignment.deleteMany({
      where: { userId, roleId },
    })
  }

  async getUserStats() {
    const [total, active, disabled, byRole] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { status: 'ACTIVE', deletedAt: null } }),
      this.prisma.user.count({ where: { status: 'DISABLED', deletedAt: null } }),
      this.prisma.userRoleAssignment.groupBy({
        by: ['roleId'],
        _count: true,
      }),
    ])

    return {
      total,
      active,
      disabled,
      byRole: byRole.map((item) => ({
        roleId: item.roleId,
        count: item._count,
      })),
    }
  }

  async getEffectivePermissions(userId: string) {
    const assignments = await this.prisma.userRoleAssignment.findMany({
      where: { userId },
      include: { role: { include: { permissions: true } } },
    })

    const permissions = new Set<string>()
    const denied = new Set<string>()

    for (const a of assignments) {
      // Check for SUPER_ADMIN
      if (a.role.code === 'SUPER_ADMIN' && a.scopeType === 'GLOBAL') {
        return { permissions: ['*'], scopes: ['*'] }
      }

      // Collect denied permissions
      a.deniedPermissions.forEach((p) => denied.add(p))

      // Collect granted permissions from role
      for (const rp of a.role.permissions) {
        const key = `${rp.entity}.${rp.action}`
        if (!denied.has(key)) {
          permissions.add(key)
        }
      }

      // Collect explicitly granted permissions
      a.grantedPermissions.forEach((p) => {
        if (!denied.has(p)) permissions.add(p)
      })
    }

    return {
      permissions: Array.from(permissions),
      scopes: [...new Set(assignments.flatMap((a) => a.scopeIds))],
    }
  }
}
