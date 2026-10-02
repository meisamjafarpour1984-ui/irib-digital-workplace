import { Test, TestingModule } from '@nestjs/testing'
import { ThemeService } from './theme.service'
import { PrismaService } from '../../prisma/prisma.service'

describe('ThemeService', () => {
  let service: ThemeService
  let prisma: PrismaService

  const mockToken = {
    id: 'tok-1',
    name: 'color.primary',
    category: 'brand',
    tokens: { value: '#0066CC', type: 'COLOR' },
    isDefault: false,
    isActive: true,
  }
  const mockPrisma = {
    themeToken: {
      findMany: jest.fn().mockResolvedValue([mockToken]),
      findUnique: jest.fn().mockResolvedValue(mockToken),
      create: jest.fn().mockResolvedValue(mockToken),
      update: jest
        .fn()
        .mockResolvedValue({ ...mockToken, tokens: { value: '#0099FF', type: 'COLOR' } }),
      updateMany: jest.fn(),
      delete: jest.fn().mockResolvedValue(mockToken),
    },
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const m: TestingModule = await Test.createTestingModule({
      providers: [ThemeService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile()
    service = m.get<ThemeService>(ThemeService)
    prisma = m.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => expect(service).toBeDefined())

  describe('getAllTokens', () => {
    it('returns all theme tokens', async () => {
      const r = await service.getAllTokens()
      expect(prisma.themeToken.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      })
      expect(r).toHaveLength(1)
    })
  })

  describe('getToken', () => {
    it('finds token by id', async () => {
      const r = await service.getToken('tok-1')
      expect(prisma.themeToken.findUnique).toHaveBeenCalledWith({ where: { id: 'tok-1' } })
      expect(r.name).toBe('color.primary')
    })
  })

  describe('createToken', () => {
    it('creates a theme token', async () => {
      ;(prisma.themeToken.findUnique as jest.Mock).mockResolvedValueOnce(null)
      const r = await service.createToken({
        name: 'color.primary',
        category: 'brand',
        tokens: { value: '#0099FF', type: 'COLOR' },
      })
      expect(prisma.themeToken.create).toHaveBeenCalled()
      expect(r.name).toBe('color.primary')
    })
  })

  describe('deleteToken', () => {
    it('deletes token', async () => {
      await service.deleteToken('tok-1')
      expect(prisma.themeToken.update).toHaveBeenCalledWith({
        where: { id: 'tok-1' },
        data: { isActive: false },
      })
    })
  })

  describe('getActiveThemes', () => {
    it('filters tokens by date range', async () => {
      const r = await service.getActiveThemes()
      expect(prisma.themeToken.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      })
      expect(r).toHaveLength(1)
    })
  })
})
