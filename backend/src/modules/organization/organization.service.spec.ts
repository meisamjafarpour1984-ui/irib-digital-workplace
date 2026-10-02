import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { OrganizationService } from './organization.service'
import { PrismaService } from '../../prisma/prisma.service'

describe('OrganizationService', () => {
  let service: OrganizationService
  let prisma: PrismaService

  const leafDept = {
    id: 'd-leaf',
    name: 'واحد فناوری اطلاعات',
    slug: 'it',
    parentId: 'd-root',
    depth: 1,
    sortOrder: 1,
    isActive: true,
    children: [],
    members: [{ userId: 'u1' }],
  }
  const rootDept = {
    id: 'd-root',
    name: 'مدیریت کل',
    slug: 'management',
    parentId: null,
    depth: 0,
    sortOrder: 0,
    isActive: true,
    children: [leafDept],
    members: [{ userId: 'ceo' }],
  }

  const mockPrisma = {
    department: {
      findMany: jest.fn().mockResolvedValue([rootDept, leafDept]),
      findUnique: jest.fn().mockResolvedValue(rootDept),
      create: jest.fn().mockResolvedValue(rootDept),
      update: jest.fn().mockResolvedValue(rootDept),
    },
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const m: TestingModule = await Test.createTestingModule({
      providers: [OrganizationService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile()
    service = m.get<OrganizationService>(OrganizationService)
    prisma = m.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => expect(service).toBeDefined())

  describe('getTree', () => {
    it('fetches active departments with children + members, then builds tree', async () => {
      const r = await service.getTree()
      expect(prisma.department.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
          include: expect.objectContaining({
            children: true,
            members: { select: { userId: true } },
          }),
        })
      )
      expect(Array.isArray(r)).toBe(true)
    })

    it('throws a clean Error on prisma failure', async () => {
      ;(prisma.department.findMany as jest.Mock).mockRejectedValueOnce(new Error('db dead'))
      const origErr = console.error
      console.error = jest.fn()
      await expect(service.getTree()).rejects.toThrow('Failed to get organization tree')
      console.error = origErr
    })
  })

  describe('getTreeFlat', () => {
    it('fetches flat departments with parent', async () => {
      const r = await service.getTreeFlat()
      expect(prisma.department.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ include: { parent: true } })
      )
      expect(r).toEqual([rootDept, leafDept])
    })
  })

  describe('getUnitBySlug', () => {
    it('finds by slug and includes parent/children/microsite/members', async () => {
      const r = await service.getUnitBySlug('it')
      expect(prisma.department.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { slug: 'it' },
          include: expect.objectContaining({
            parent: true,
            microsite: true,
            members: expect.any(Object),
          }),
        })
      )
      expect(r).toEqual(rootDept)
    })

    it('throws NotFoundException when department missing', async () => {
      ;(prisma.department.findUnique as jest.Mock).mockResolvedValueOnce(null)
      await expect(service.getUnitBySlug('missing')).rejects.toThrow('Department not found')
    })
  })

  describe('getUnitById', () => {
    it('finds by id with children/microsite/members include', async () => {
      await service.getUnitById('d-root')
      expect(prisma.department.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'd-root' },
          include: expect.objectContaining({
            children: true,
            microsite: true,
            members: expect.any(Object),
          }),
        })
      )
    })
  })
})
