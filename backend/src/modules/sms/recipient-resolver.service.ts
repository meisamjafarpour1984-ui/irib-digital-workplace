import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

export interface RecipientCriteria {
  departments?: string[]
  roles?: string[]
  units?: string[]
  positions?: string[]
  customQuery?: any
}

@Injectable()
export class RecipientResolverService {
  private readonly logger = new Logger(RecipientResolverService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolve recipients based on organizational criteria
   * Extracts mobile numbers from organizational database
   */
  async resolveRecipients(criteria: RecipientCriteria): Promise<string[]> {
    this.logger.log('Resolving recipients based on criteria', criteria)

    // Build query based on criteria
    const users = await this.prisma.user.findMany({
      where: this.buildWhereClause(criteria),
      select: {
        mobile: true,
        departments: {
          include: {
            department: true,
          },
        },
        roles: {
          include: {
            role: true,
          },
        },
      },
    })

    // Extract unique mobile numbers
    const mobiles = users.map((user) => user.mobile).filter((mobile): mobile is string => !!mobile)

    // Remove duplicates
    return [...new Set(mobiles)]
  }

  /**
   * Get recipient count without fetching mobiles
   */
  async getRecipientCount(criteria: RecipientCriteria): Promise<number> {
    const count = await this.prisma.user.count({
      where: this.buildWhereClause(criteria),
    })
    return count
  }

  /**
   * Build Prisma where clause from criteria
   */
  private buildWhereClause(criteria: RecipientCriteria): any {
    const where: any = {
      mobile: { not: null },
      status: 'ACTIVE',
    }

    if (criteria.departments?.length) {
      where.departments = {
        some: {
          departmentId: { in: criteria.departments },
        },
      }
    }

    if (criteria.roles?.length) {
      where.roles = {
        some: {
          roleId: { in: criteria.roles },
        },
      }
    }

    if (criteria.customQuery) {
      Object.assign(where, criteria.customQuery)
    }

    return where
  }

  /**
   * Get available departments for targeting
   */
  async getAvailableDepartments() {
    return this.prisma.department.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        type: true,
      },
      orderBy: { name: 'asc' },
    })
  }

  /**
   * Get available roles for targeting
   */
  async getAvailableRoles() {
    return this.prisma.role.findMany({
      select: {
        id: true,
        code: true,
        name: true,
      },
      orderBy: { code: 'asc' },
    })
  }
}
