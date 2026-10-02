import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { KnowledgeService } from './knowledge.service'
import { PrismaService } from '../../prisma/prisma.service'

const expert1 = {
  id: 'e1',
  userId: 'u1',
  isLegend: true,
  departmentId: 'd1',
  user: { id: 'u1', name: 'دکتر رضایی', email: 'r@i.ir' },
}

describe('KnowledgeService', () => {
  let service: KnowledgeService
  let prisma: PrismaService

  const mockPrisma = {
    expertProfile: {
      findMany: jest.fn().mockResolvedValue([expert1]),
      findUnique: jest.fn().mockResolvedValue(expert1),
      upsert: jest.fn().mockResolvedValue(expert1),
    },
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const m: TestingModule = await Test.createTestingModule({
      providers: [KnowledgeService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile()
    service = m.get<KnowledgeService>(KnowledgeService)
    prisma = m.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => expect(service).toBeDefined())

  describe('getExperts', () => {
    it('fetches many with user include + take limit', async () => {
      const r = await service.getExperts({ limit: 10 })
      expect(prisma.expertProfile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          include: expect.objectContaining({ user: expect.any(Object) }),
        })
      )
      expect(r).toEqual([expert1])
    })

    it('applies departmentId filter', async () => {
      await service.getExperts({ departmentId: 'd42', limit: 10 })
      expect(prisma.expertProfile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { departmentId: 'd42' } })
      )
    })

    it('applies isLegend = true filter', async () => {
      await service.getExperts({ isLegend: true, limit: 10 })
      expect(prisma.expertProfile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { isLegend: true } })
      )
    })
  })

  describe('getExpertById', () => {
    it('finds by userId (PK of ExpertProfile relation) with user include', async () => {
      const r = await service.getExpertById('u1')
      expect(prisma.expertProfile.findUnique).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        include: { user: { select: { id: true, name: true, email: true } } },
      })
      expect(r).toEqual(expert1)
    })

    it('throws NotFoundException when expert missing', async () => {
      ;(prisma.expertProfile.findUnique as jest.Mock).mockResolvedValueOnce(null)
      await expect(service.getExpertById('u-none')).rejects.toThrow('Expert not found')
    })
  })

  describe('updateExpert', () => {
    it('upserts expert profile by userId then returns findUnique with include', async () => {
      const data = { title: 'استاد', isLegend: false, skills: null }
      await service.updateExpert('u1', data)
      expect(prisma.expertProfile.upsert).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        update: { title: 'استاد', isLegend: false },
        create: { userId: 'u1', title: 'استاد', isLegend: false },
      })
      expect(prisma.expertProfile.findUnique).toHaveBeenLastCalledWith(
        expect.objectContaining({ include: expect.objectContaining({ user: expect.any(Object) }) })
      )
    })
  })

  describe('getLegends', () => {
    it('fetches legends with include', async () => {
      mockPrisma.expertProfile.findMany.mockResolvedValueOnce([expert1])
      const r = await service.getLegends()
      expect(r).toEqual([expert1])
      expect(prisma.expertProfile.findMany).toHaveBeenCalled()
    })
  })
})
