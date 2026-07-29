import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class KnowledgeService {
  constructor(private readonly prisma: PrismaService) {}

  async getExperts(params: { departmentId?: string; isLegend?: boolean; limit: number }) {
    const where: any = { isPublic: true }
    if (params.departmentId) where.departmentId = params.departmentId
    if (params.isLegend !== undefined) where.isLegend = params.isLegend

    return this.prisma.expertProfile.findMany({
      where,
      include: { user: { select: { id: true, name: true } } },
      take: params.limit,
    })
  }

  async getExpertById(id: string) {
    const expert = await this.prisma.expertProfile.findUnique({
      where: { userId: id },
      include: { user: { select: { id: true, name: true, email: true } } },
    })
    if (!expert) throw new NotFoundException('Expert not found')
    return expert
  }

  async updateExpert(userId: string, data: any) {
    return this.prisma.expertProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    })
  }

  async getLegends() {
    return this.prisma.expertProfile.findMany({
      where: { isLegend: true },
      include: { user: { select: { id: true, name: true } } },
    })
  }

  async getSkills() {
    return [] // skillsTaxonomy not defined in Prisma Schema
  }
}
