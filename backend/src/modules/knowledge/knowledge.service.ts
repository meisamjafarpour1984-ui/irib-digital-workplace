import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class KnowledgeService {
  constructor(private readonly prisma: PrismaService) {}

  async getExperts(params: { departmentId?: string; isLegend?: boolean; limit: number }) {
    const where: Prisma.ExpertProfileWhereInput = {}
    if (params.departmentId) where.departmentId = params.departmentId
    if (params.isLegend !== undefined) where.isLegend = params.isLegend

    return this.prisma.expertProfile.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
        // skills: {
        //   include: {
        //     skill: true,
        //   },
        // },
      },
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

  async updateExpert(userId: string, data: Prisma.ExpertProfileUpdateInput & { skills?: unknown }) {
    const profileData = { ...data }
    delete profileData.skills

    // Update profile
    const profile = await this.prisma.expertProfile.upsert({
      where: { userId },
      update: profileData as Prisma.ExpertProfileUpdateInput,
      create: { userId, ...profileData } as Prisma.ExpertProfileCreateInput,
    })

    // Update skills if provided
    // if (skills && Array.isArray(skills)) {
    //   // Delete existing skills
    //   await this.prisma.expertSkill.deleteMany({
    //     where: { expertId: profile.id },
    //   })

    //   // Create new skills
    //   if (skills.length > 0) {
    //     await this.prisma.expertSkill.createMany({
    //       data: skills.map((skill: any) => ({
    //         expertId: profile.id,
    //         skillId: skill.skillId,
    //         proficiency: skill.proficiency || 'intermediate',
    //         years: skill.years,
    //       })),
    //     })
    //   }
    // }

    return this.prisma.expertProfile.findUnique({
      where: { id: profile.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        // skills: {
        //   include: {
        //     skill: true,
        //   },
        // },
      },
    })
  }

  async getLegends() {
    return this.prisma.expertProfile.findMany({
      where: { isLegend: true },
      include: { user: { select: { id: true, name: true } } },
    })
  }

  async getSkills() {
    return []
  }

  async getSkillBySlug(_slug: string) {
    return null
  }
}
