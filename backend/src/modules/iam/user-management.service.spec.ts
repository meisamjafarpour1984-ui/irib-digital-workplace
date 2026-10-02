/**
 * IRIB Digital Workplace Platform - User Management Service Unit Tests
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException, ConflictException } from '@nestjs/common'
import { UserManagementService } from './user-management.service'
import { PrismaService } from '../../prisma/prisma.service'

describe('UserManagementService', () => {
  let service: UserManagementService

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    userRoleAssignment: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
      groupBy: jest.fn(),
      findMany: jest.fn(),
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserManagementService,
        {
          provide: PrismaService,
          useValue: mockPrismaService as any,
        },
      ],
    }).compile()

    service = module.get<UserManagementService>(UserManagementService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const mockUsers = [
        { id: '1', personnelCode: '123456', name: 'Test User 1', status: 'ACTIVE' },
        { id: '2', personnelCode: '789012', name: 'Test User 2', status: 'ACTIVE' },
      ]

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers)
      mockPrismaService.user.count.mockResolvedValue(2)

      const result = await service.findAll({ page: 1, limit: 20 })

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
          include: expect.any(Object),
          orderBy: expect.any(Object),
        })
      )
      expect(result).toHaveProperty('items')
      expect(result).toHaveProperty('pagination')
      expect(result.items).toHaveLength(2)
    })

    it('should filter by department', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([])
      mockPrismaService.user.count.mockResolvedValue(0)

      await service.findAll({ page: 1, limit: 20, departmentId: 'dept-123' })

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            departments: { some: { departmentId: 'dept-123' } },
          }),
        })
      )
    })
  })

  describe('findOne', () => {
    it('should return user by ID', async () => {
      const mockUser = { id: '1', personnelCode: '123456', name: 'Test User', status: 'ACTIVE' }
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser)

      const result = await service.findOne('1')

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1', deletedAt: null },
        include: expect.any(Object),
      })
      expect(result).toEqual(mockUser)
    })

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null)
      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        personnelCode: '123456',
        name: 'Test User',
        email: 'test@example.com',
        mobile: '09123456789',
      }

      const mockUser = { id: '1', ...createUserDto, status: 'ACTIVE' }
      mockPrismaService.user.findFirst.mockResolvedValue(null)
      mockPrismaService.user.create.mockResolvedValue(mockUser)

      const result = await service.create(createUserDto)

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { personnelCode: '123456' },
              { email: 'test@example.com' },
            ]),
          }),
        })
      )
      expect(mockPrismaService.user.create).toHaveBeenCalled()
      expect(result).toEqual(mockUser)
    })

    it('should throw ConflictException if user already exists', async () => {
      const createUserDto = { personnelCode: '123456', name: 'Test User' }
      mockPrismaService.user.findFirst.mockResolvedValue({ id: '1', personnelCode: '123456' })
      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException)
    })
  })

  describe('update', () => {
    it('should update user', async () => {
      const updateUserDto = { name: 'Updated Name' }
      const mockUser = { id: '1', personnelCode: '123456', name: 'Updated Name', status: 'ACTIVE' }

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: '1',
        personnelCode: '123456',
        name: 'Test User',
      })
      mockPrismaService.user.update.mockResolvedValue(mockUser)

      const result = await service.update('1', updateUserDto)

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'Updated Name' },
      })
      expect(result).toEqual(mockUser)
    })
  })

  describe('remove', () => {
    it('should soft-delete user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1', personnelCode: '123456' })
      mockPrismaService.user.update.mockResolvedValue({ id: '1', deletedAt: new Date() })

      await service.remove('1')

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { deletedAt: expect.any(Date), status: 'DISABLED' },
      })
    })
  })

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      mockPrismaService.user.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(80)
        .mockResolvedValueOnce(15)
      mockPrismaService.userRoleAssignment.groupBy.mockResolvedValue([{ roleId: 'r1', _count: 5 }])

      const result = await service.getUserStats()

      expect(result).toEqual({
        total: 100,
        active: 80,
        disabled: 15,
        byRole: [{ roleId: 'r1', count: 5 }],
      })
    })
  })
})
