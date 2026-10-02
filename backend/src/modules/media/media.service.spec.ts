import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MediaService } from './media.service'
import { PrismaService } from '../../prisma/prisma.service'

describe('MediaService', () => {
  let service: MediaService
  let prisma: PrismaService

  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024 * 1024,
    buffer: Buffer.from('fake-jpg'),
    destination: '',
    filename: '',
    path: '',
    stream: null as any,
  }

  const mockPrisma = {
    mediaAsset: {
      create: jest
        .fn()
        .mockResolvedValue({ id: 'ma-1', hash: 'abc123', storageKey: 'uploads/abc123/test.jpg' }),
      findUnique: jest.fn().mockResolvedValue({ id: 'ma-1' }),
      count: jest.fn().mockResolvedValue(1),
      aggregate: jest.fn().mockResolvedValue({ _sum: { size: 1024 } }),
      groupBy: jest.fn().mockResolvedValue([{ mimeType: 'image/jpeg', _count: 1 }]),
      delete: jest.fn().mockResolvedValue({ id: 'ma-1' }),
    },
  }

  const mockConfig = {
    get: jest.fn(
      (k: string) =>
        ({
          MINIO_ENDPOINT: 'http://localhost:9000',
          MINIO_ACCESS_KEY: 'minioadmin',
          MINIO_SECRET_KEY: 'minioadmin',
          MINIO_BUCKET: 'irib-dwp-media',
          USE_MINIO: 'false',
          MAX_FILE_SIZE: 50 * 1024 * 1024,
          ALLOWED_MIME_TYPES:
            'image/jpeg,image/png,image/gif,image/webp,image/svg+xml,video/mp4,video/webm,audio/mpeg,audio/wav,application/pdf',
        })[k]
    ),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const m: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile()
    service = m.get<MediaService>(MediaService)
    prisma = m.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => expect(service).toBeDefined())

  describe('upload', () => {
    it('rejects file larger than MAX_FILE_SIZE', async () => {
      const big = { ...mockFile, size: 100 * 1024 * 1024 }
      await expect(service.upload(big, 'u1')).rejects.toThrow(BadRequestException)
    })

    it('rejects disallowed MIME type', async () => {
      const bad = { ...mockFile, mimetype: 'application/x-executable' }
      await expect(service.upload(bad, 'u1')).rejects.toThrow(BadRequestException)
    })

    it('creates a new media asset when valid', async () => {
      const r = await service.upload(mockFile, 'u1')
      expect(prisma.mediaAsset.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ uploadedById: 'u1' }) })
      )
      expect(r).toEqual({ id: 'ma-1', hash: 'abc123', storageKey: 'uploads/abc123/test.jpg' })
    })
  })
})
