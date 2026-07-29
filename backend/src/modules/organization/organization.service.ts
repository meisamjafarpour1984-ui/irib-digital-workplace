import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async getTree() {
    const units = await this.prisma.department.findMany({
      where: { isActive: true },
      include: { children: true },
      orderBy: { sortOrder: 'asc' },
    })
    return this.buildTree(units, null)
  }

  async getUnitBySlug(slug: string) {
    const unit = await this.prisma.department.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: true,
        microsite: true,
      },
    })
    if (!unit) throw new NotFoundException('Department not found')
    return unit
  }

  async getUnitById(id: string) {
    const unit = await this.prisma.department.findUnique({
      where: { id },
      include: { children: true, microsite: true },
    })
    if (!unit) throw new NotFoundException('Department not found')
    return unit
  }

  async create(data: any) {
    return this.prisma.department.create({ data })
  }

  async update(id: string, data: any) {
    return this.prisma.department.update({ where: { id }, data })
  }

  async getMicrosite(slug: string) {
    const unit = await this.getUnitById(slug)
    return this.prisma.micrositeConfig.findUnique({
      where: { departmentId: unit.id },
    })
  }

  async updateMicrosite(unitId: string, data: any) {
    return this.prisma.micrositeConfig.upsert({
      where: { departmentId: unitId },
      update: data,
      create: { departmentId: unitId, ...data },
    })
  }

  private buildTree(units: any[], parentId: string | null): any[] {
    return units
      .filter((u) => u.parentId === parentId)
      .map((u) => ({
        ...u,
        children: this.buildTree(units, u.id),
      }))
  }
}
