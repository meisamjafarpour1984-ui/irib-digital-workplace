import { Injectable, NotFoundException, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        permissions: true,
      },
      orderBy: { code: 'asc' },
    })
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
        users: { select: { id: true, userId: true, scopeType: true, scopeIds: true } },
      },
    })
    if (!role) throw new NotFoundException('Role not found')
    return role
  }

  async findByCode(code: string) {
    return this.prisma.role.findUnique({
      where: { code },
      include: {
        permissions: true,
      },
    })
  }

  async create(data: { code: string; name: any; description?: string }) {
    // Check if role code already exists
    const existing = await this.prisma.role.findUnique({
      where: { code: data.code },
    })
    if (existing) {
      throw new Error(`Role with code ${data.code} already exists`)
    }

    return this.prisma.role.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
      },
    })
  }

  async update(id: string, data: any) {
    await this.findOne(id)
    return this.prisma.role.update({ where: { id }, data })
  }

  async remove(id: string) {
    const role = await this.findOne(id)
    if (role.isSystem) throw new Error('Cannot delete system role')
    return this.prisma.role.delete({ where: { id } })
  }

  async assignPermission(roleId: string, permissionId: string) {
    await this.findOne(roleId)
    return this.prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: { connect: { id: permissionId } },
      },
    })
  }

  async removePermission(roleId: string, permissionId: string) {
    await this.findOne(roleId)
    return this.prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: { disconnect: { id: permissionId } },
      },
    })
  }

  async getRolesWithPermissions() {
    return this.prisma.role.findMany({
      include: {
        permissions: true,
      },
      orderBy: { code: 'asc' },
    })
  }

  async assignPermissionToMany(roleId: string, permissionIds: string[]) {
    await this.findOne(roleId)
    return this.prisma.role.update({
      where: { id: roleId },
      data: {
        permissions: {
          connect: permissionIds.map((id) => ({ id })),
        },
      },
    })
  }

  async getRolePermissionsMatrix() {
    const roles = await this.prisma.role.findMany({
      include: {
        permissions: true,
      },
      orderBy: { code: 'asc' },
    })

    const permissions = await this.prisma.atomicPermission.findMany({
      orderBy: [{ entity: 'asc' }, { action: 'asc' }],
    })

    // Create matrix: { roleId: { permissionId: boolean } }
    const matrix: Record<string, Record<string, boolean>> = {}

    for (const role of roles) {
      matrix[role.id] = {}
      const rolePermissionIds = role.permissions.map((p) => p.id)

      for (const permission of permissions) {
        matrix[role.id][permission.id] = rolePermissionIds.includes(permission.id)
      }
    }

    return {
      roles,
      permissions,
      matrix,
    }
  }
}
