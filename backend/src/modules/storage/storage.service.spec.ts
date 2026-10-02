import { Test, TestingModule } from '@nestjs/testing'
import { StorageService } from './storage.service'
import { PrismaService } from '../../prisma/prisma.service'
import { ConfigService } from '@nestjs/config'

describe('StorageService', () => {
  let service: StorageService
  let prisma: PrismaService

  const mockPrisma = {
    mediaAsset: {
      findUnique: jest
        .fn()
        .mockResolvedValue({
          id: 'ma-1',
          storageKey: 'uploads/abc/test.pdf',
          mimeType: 'application/pdf',
        }),
      create: jest.fn().mockResolvedValue({ id: 'ma-2' }),
      delete: jest.fn().mockResolvedValue({ id: 'ma-1' }),
    },
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const m: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile()
    service = m.get<StorageService>(StorageService)
    prisma = m.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => expect(service).toBeDefined())

  describe('getAssetUrl', () => {
    it('returns signed URL for existing asset', async () => {
      const r = await service.getAssetUrl('ma-1')
      expect(prisma.mediaAsset.findUnique).toHaveBeenCalledWith({ where: { id: 'ma-1' } })
      expect(r).toContain('uploads/abc/test.pdf')
    })
  })

  describe('deleteAsset', () => {
    it('deletes the asset record after removing the file', async () => {
      await service.deleteAsset('ma-1')
      expect(prisma.mediaAsset.delete).toHaveBeenCalledWith({
        where: { id: 'ma-1' },
      })
    })
  })
})
