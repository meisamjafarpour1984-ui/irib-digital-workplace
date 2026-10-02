import { Injectable, NotFoundException, Logger, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name)

  constructor(private readonly prisma: PrismaService) {}

  async getTree() {
    try {
      const units = await this.prisma.department.findMany({
        where: { isActive: true },
        include: {
          children: true,
          members: {
            select: { userId: true },
          },
        },
        orderBy: { sortOrder: 'asc' },
      })

      const tree = this.buildTree(units, null)

      // Add member counts
      return this.addMemberCounts(tree, units)
    } catch (error) {
      this.logger.error('Error getting organization tree:', error)
      throw new Error('Failed to get organization tree')
    }
  }

  async getTreeFlat() {
    try {
      return this.prisma.department.findMany({
        where: { isActive: true },
        include: {
          parent: true,
        },
        orderBy: [{ depth: 'asc' }, { sortOrder: 'asc' }],
      })
    } catch (error) {
      this.logger.error('Error getting flat organization tree:', error)
      throw new Error('Failed to get flat organization tree')
    }
  }

  async getUnitBySlug(slug: string) {
    try {
      const unit = await this.prisma.department.findUnique({
        where: { slug },
        include: {
          parent: true,
          children: true,
          microsite: true,
          members: {
            include: {
              user: {
                select: { id: true, name: true, personnelCode: true, mobile: true },
              },
            },
          },
        },
      })
      if (!unit) throw new NotFoundException('Department not found')
      return unit
    } catch (error) {
      this.logger.error(`Error getting unit by slug ${slug}:`, error)
      throw error
    }
  }

  async getUnitById(id: string) {
    try {
      const unit = await this.prisma.department.findUnique({
        where: { id },
        include: {
          children: true,
          microsite: true,
          members: {
            include: {
              user: {
                select: { id: true, name: true, personnelCode: true },
              },
            },
          },
        },
      })
      if (!unit) throw new NotFoundException('Department not found')
      return unit
    } catch (error) {
      this.logger.error(`Error getting unit by id ${id}:`, error)
      throw error
    }
  }

  async create(data: {
    name: any
    slug: string
    type?: string
    parentId?: string
    managerId?: string
    sortOrder?: number
  }) {
    try {
      // Check if slug already exists
      const existing = await this.prisma.department.findUnique({
        where: { slug: data.slug },
      })
      if (existing) {
        throw new ConflictException('Department slug already exists')
      }

      // If parent is specified, validate it exists
      if (data.parentId) {
        const parent = await this.prisma.department.findUnique({
          where: { id: data.parentId },
        })
        if (!parent) {
          throw new NotFoundException('Parent department not found')
        }

        // Calculate depth and path
        const parentDepth = parent.depth || 0
        const parentPath = parent.path || parent.id

        return this.prisma.department.create({
          data: {
            name: data.name,
            slug: data.slug,
            type: data.type || 'UNIT',
            parentId: data.parentId,
            managerId: data.managerId,
            sortOrder: data.sortOrder || 0,
            depth: parentDepth + 1,
            path: `${parentPath}.${data.slug}`,
            isActive: true,
          },
        })
      }

      // Root level department
      return this.prisma.department.create({
        data: {
          name: data.name,
          slug: data.slug,
          type: data.type || 'DEPARTMENT',
          managerId: data.managerId,
          sortOrder: data.sortOrder || 0,
          depth: 0,
          path: data.slug,
          isActive: true,
        },
      })
    } catch (error) {
      this.logger.error('Error creating department:', error)
      throw new Error('Failed to create department')
    }
  }

  async update(
    id: string,
    data: {
      name?: any
      slug?: string
      type?: string
      parentId?: string
      managerId?: string
      sortOrder?: number
      isActive?: boolean
    }
  ) {
    try {
      await this.getUnitById(id)

      // Check if new slug conflicts with existing
      if (data.slug) {
        const existing = await this.prisma.department.findFirst({
          where: {
            slug: data.slug,
            id: { not: id },
          },
        })
        if (existing) {
          throw new ConflictException('Department slug already exists')
        }
      }

      // If parent is being changed, update path and depth
      if (data.parentId !== undefined) {
        if (data.parentId) {
          const parent = await this.prisma.department.findUnique({
            where: { id: data.parentId },
          })
          if (!parent) {
            throw new NotFoundException('Parent department not found')
          }

          const parentDepth = parent.depth || 0
          const parentPath = parent.path || parent.id

          return this.prisma.department.update({
            where: { id },
            data: {
              ...data,
              depth: parentDepth + 1,
              path: `${parentPath}.${data.slug || (await this.getCurrentSlug(id))}`,
            },
          })
        } else {
          // Moving to root level
          return this.prisma.department.update({
            where: { id },
            data: {
              ...data,
              depth: 0,
              path: data.slug || (await this.getCurrentSlug(id)),
            },
          })
        }
      }

      return this.prisma.department.update({ where: { id }, data })
    } catch (error) {
      this.logger.error(`Error updating department ${id}:`, error)
      throw new Error('Failed to update department')
    }
  }

  async delete(id: string) {
    try {
      await this.getUnitById(id)

      return this.prisma.department.update({
        where: { id },
        data: { isActive: false },
      })
    } catch (error) {
      this.logger.error(`Error deleting department ${id}:`, error)
      throw error
    }
  }

  async moveUnit(id: string, newParentId: string | null, newIndex?: number) {
    try {
      const unit = await this.getUnitById(id)

      if (newParentId) {
        const newParent = await this.prisma.department.findUnique({
          where: { id: newParentId },
        })
        if (!newParent) {
          throw new NotFoundException('New parent department not found')
        }

        // Prevent circular reference
        if (newParentId === id) {
          throw new Error('Cannot move unit to itself')
        }

        const parentDepth = newParent.depth || 0
        const parentPath = newParent.path || newParent.id

        return this.prisma.department.update({
          where: { id },
          data: {
            parentId: newParentId,
            depth: parentDepth + 1,
            path: `${parentPath}.${unit.slug}`,
            ...(newIndex !== undefined && { sortOrder: newIndex }),
          },
        })
      } else {
        // Move to root
        return this.prisma.department.update({
          where: { id },
          data: {
            parentId: null,
            depth: 0,
            path: unit.slug,
            ...(newIndex !== undefined && { sortOrder: newIndex }),
          },
        })
      }
    } catch (error) {
      this.logger.error(`Error moving unit ${id}:`, error)
      throw new Error('Failed to move unit')
    }
  }

  async assignManager(unitId: string, managerId: string) {
    try {
      await this.getUnitById(unitId)

      // Verify user exists
      const user = await this.prisma.user.findUnique({
        where: { id: managerId },
      })
      if (!user) {
        throw new NotFoundException('User not found')
      }

      return this.prisma.department.update({
        where: { id: unitId },
        data: { managerId },
      })
    } catch (error) {
      this.logger.error(`Error assigning manager to unit ${unitId}:`, error)
      throw new Error('Failed to assign manager')
    }
  }

  async addMember(unitId: string, userId: string, isPrimary: boolean = false) {
    try {
      await this.getUnitById(unitId)

      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      })
      if (!user) {
        throw new NotFoundException('User not found')
      }

      // Check if already a member
      const existing = await this.prisma.userDepartmentScope.findFirst({
        where: { userId, departmentId: unitId },
      })
      if (existing) {
        throw new ConflictException('User is already a member of this department')
      }

      // If setting as primary, remove primary from other departments
      if (isPrimary) {
        await this.prisma.userDepartmentScope.updateMany({
          where: { userId, isPrimary: true },
          data: { isPrimary: false },
        })
      }

      return this.prisma.userDepartmentScope.create({
        data: {
          userId,
          departmentId: unitId,
          isPrimary,
        },
      })
    } catch (error) {
      this.logger.error(`Error adding member to unit ${unitId}:`, error)
      throw error
    }
  }

  async removeMember(unitId: string, userId: string) {
    try {
      return this.prisma.userDepartmentScope.deleteMany({
        where: { userId, departmentId: unitId },
      })
    } catch (error) {
      this.logger.error(`Error removing member from unit ${unitId}:`, error)
      throw new Error('Failed to remove member')
    }
  }

  async getMicrosite(slug: string) {
    try {
      const unit = await this.getUnitBySlug(slug)
      return this.prisma.micrositeConfig.findUnique({
        where: { departmentId: unit.id },
      })
    } catch (error) {
      this.logger.error(`Error getting microsite for ${slug}:`, error)
      throw error
    }
  }

  async updateMicrosite(
    unitId: string,
    data: {
      heroImage?: string
      heroTitle?: any
      heroSubtitle?: any
      themeOverrides?: any
      navItems?: any
      isActive?: boolean
    }
  ) {
    try {
      await this.getUnitById(unitId)

      return this.prisma.micrositeConfig.upsert({
        where: { departmentId: unitId },
        update: data,
        create: {
          departmentId: unitId,
          ...data,
          navItems: data.navItems || [],
          isActive: data.isActive !== undefined ? data.isActive : true,
        },
      })
    } catch (error) {
      this.logger.error(`Error updating microsite for unit ${unitId}:`, error)
      throw new Error('Failed to update microsite')
    }
  }

  async getOrgStats() {
    try {
      const [totalUnits, totalMembers, activeMembers, unitsByType] = await Promise.all([
        this.prisma.department.count({ where: { isActive: true } }),
        this.prisma.userDepartmentScope.count(),
        this.prisma.user.count({ where: { status: 'ACTIVE' } }),
        this.prisma.department.groupBy({
          by: ['type'],
          _count: true,
          where: { isActive: true },
        }),
      ])

      return {
        totalUnits,
        totalMembers,
        activeMembers,
        unitsByType: unitsByType.map((item) => ({
          type: item.type,
          count: item._count,
        })),
      }
    } catch (error) {
      this.logger.error('Error getting organization stats:', error)
      throw new Error('Failed to get organization stats')
    }
  }

  private buildTree(units: any[], parentId: string | null): any[] {
    return units
      .filter((u) => u.parentId === parentId)
      .map((u) => ({
        ...u,
        children: this.buildTree(units, u.id),
      }))
  }

  private addMemberCounts(tree: any[], allUnits: any[]): any[] {
    return tree.map((unit) => {
      const memberCount = allUnits.filter((u) => u.id === unit.id).length || 0
      return {
        ...unit,
        memberCount,
        children: this.addMemberCounts(unit.children, allUnits),
      }
    })
  }

  private async getCurrentSlug(id: string): Promise<string> {
    const unit = await this.prisma.department.findUnique({
      where: { id },
      select: { slug: true },
    })
    return unit?.slug || ''
  }
}
