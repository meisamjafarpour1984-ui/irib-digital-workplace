/**
 * IRIB Digital Workplace Platform - Software Service Unit Tests
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { SoftwareService } from './software.service'
import { PrismaService } from '../../prisma/prisma.service'

describe('SoftwareService', () => {
  let service: SoftwareService
  let prismaService: PrismaService

  const mockPrismaService = {
    softwareEntry: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    softwareVersion: {
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    downloadLog: {
      create: jest.fn(),
      count: jest.fn(),
    },
    ticket: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SoftwareService,
        {
          provide: PrismaService,
          useValue: mockPrismaService as any,
        },
      ],
    }).compile()

    service = module.get<SoftwareService>(SoftwareService)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('findAll', () => {
    it('should return a list of software entries', async () => {
      const mockSoftware = [{ id: '1', name: 'Software 1', versions: [] }]
      mockPrismaService.softwareEntry.findMany.mockResolvedValue(mockSoftware)

      const result = await service.findAll({ limit: 10 })

      expect(result).toEqual(mockSoftware)
      expect(mockPrismaService.softwareEntry.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        take: 10,
      })
    })

    it('should filter by category if provided', async () => {
      mockPrismaService.softwareEntry.findMany.mockResolvedValue([])

      await service.findAll({ category: 'Utility', limit: 10 })

      expect(mockPrismaService.softwareEntry.findMany).toHaveBeenCalledWith({
        where: { category: 'Utility' },
        include: expect.any(Object),
        take: 10,
      })
    })
  })

  describe('findOne', () => {
    it('should return a single software entry', async () => {
      const mockSoftware = { id: '1', name: 'Software 1', versions: [] }
      mockPrismaService.softwareEntry.findUnique.mockResolvedValue(mockSoftware)

      const result = await service.findOne('1')

      expect(result).toEqual(mockSoftware)
      expect(mockPrismaService.softwareEntry.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: expect.any(Object),
      })
    })

    it('should throw NotFoundException if software not found', async () => {
      mockPrismaService.softwareEntry.findUnique.mockResolvedValue(null)

      await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException)
    })
  })

  describe('getStats', () => {
    it('should return software statistics', async () => {
      mockPrismaService.softwareEntry.count.mockResolvedValue(5)
      mockPrismaService.softwareVersion.count.mockResolvedValue(10)
      mockPrismaService.downloadLog.count.mockResolvedValue(100)
      mockPrismaService.softwareEntry.groupBy.mockResolvedValue([
        { category: 'Utility', _count: { id: 3 } },
      ])

      const result = await service.getStats()

      expect(result).toEqual({
        totalSoftware: 5,
        totalVersions: 10,
        totalDownloads: 100,
        categoryStats: expect.any(Array),
      })
    })
  })

  describe('upload', () => {
    it('should create a new version for existing software', async () => {
      const uploadData = {
        name: 'Test Software',
        version: '1.0.0',
        size: 1024,
        filename: 'test.exe',
        storageKey: 'key',
        sha256: 'hash',
      }

      mockPrismaService.softwareEntry.findFirst.mockResolvedValue({
        id: 'soft-123',
        name: 'Test Software',
      })
      mockPrismaService.softwareVersion.create.mockResolvedValue({ id: 'ver-123', ...uploadData })

      const result = await service.upload(uploadData)

      expect(mockPrismaService.softwareEntry.create).not.toHaveBeenCalled()
      expect(mockPrismaService.softwareVersion.create).toHaveBeenCalled()
      expect(result.id).toBe('ver-123')
    })

    it('should create software and version if software does not exist', async () => {
      const uploadData = {
        name: 'New Software',
        version: '1.0.0',
        size: 1024,
        filename: 'new.exe',
        storageKey: 'key2',
        sha256: 'hash2',
      }

      mockPrismaService.softwareEntry.findFirst.mockResolvedValue(null)
      mockPrismaService.softwareEntry.create.mockResolvedValue({
        id: 'soft-456',
        name: 'New Software',
      })
      mockPrismaService.softwareVersion.create.mockResolvedValue({ id: 'ver-456', ...uploadData })

      await service.upload(uploadData)

      expect(mockPrismaService.softwareEntry.create).toHaveBeenCalled()
      expect(mockPrismaService.softwareVersion.create).toHaveBeenCalled()
    })
  })
})
