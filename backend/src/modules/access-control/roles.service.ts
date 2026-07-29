import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class RolesService {
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

  async create(data: { code: string; name: any; description?: string }) {
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
}
