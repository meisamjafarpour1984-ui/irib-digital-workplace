import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { ScopeType } from '@prisma/client'

@Injectable()
export class UserManagementService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: { status?: string; departmentId?: string; page: number; limit: number }) {
    const { status, departmentId, page, limit } = params
    const skip = (page - 1) * limit
    const where: any = { deletedAt: null }

    if (status) where.status = status
    if (departmentId) {
      where.departments = { some: { departmentId } }
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
      where: { id },
      include: {
        departments: { include: { department: true } },
        roles: { include: { role: true } },
        devices: true,
      },
    })
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  async create(data: {
    personnelCode: string
    name: string
    email?: string
    mobile?: string
    departmentIds?: string[]
  }) {
    const existing = await this.prisma.user.findFirst({
      where: { personnelCode: data.personnelCode },
    })
    if (existing) throw new ConflictException('Personnel code already exists')

    return this.prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        personnelCode: data.personnelCode,
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        status: 'ACTIVE',
        departments: data.departmentIds?.length
          ? { create: data.departmentIds.map((id) => ({ departmentId: id })) }
          : undefined,
      },
    })
  }

  async update(id: string, data: any) {
    await this.findOne(id)
    return this.prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        mobile: data.mobile,
      },
    })
  }

  async remove(id: string) {
    await this.findOne(id)
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'DISABLED' },
    })
  }

  async toggleStatus(id: string, status: string) {
    await this.findOne(id)
    return this.prisma.user.update({ where: { id }, data: { status } })
  }

  async assignRole(
    userId: string,
    data: { roleId: string; scopeType: string; scopeIds?: string[] }
  ) {
    await this.findOne(userId)
    return this.prisma.userRoleAssignment.create({
      data: {
        userId,
        roleId: data.roleId,
        scopeType: data.scopeType as any,
        scopeIds: data.scopeIds || [],
      },
    })
  }

  async removeRole(userId: string, roleId: string) {
    return this.prisma.userRoleAssignment.deleteMany({
      where: { userId, roleId },
    })
  }

  async getEffectivePermissions(userId: string) {
    const assignments = await this.prisma.userRoleAssignment.findMany({
      where: { userId },
      include: { role: { include: { permissions: true } } },
    })

    const permissions = new Set<string>()
    for (const a of assignments) {
      for (const rp of a.role.permissions) {
        permissions.add(`${rp.entity}.${rp.action}`)
      }
    }

    return {
      permissions: Array.from(permissions),
      scopes: [...new Set(assignments.flatMap((a) => a.scopeIds))],
    }
  }
}
