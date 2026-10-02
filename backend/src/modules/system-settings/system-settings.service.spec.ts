import { Test, TestingModule } from '@nestjs/testing'
import { SystemSettingsService } from './system-settings.service'
import { PrismaService } from '../../prisma/prisma.service'

describe('SystemSettingsService', () => {
  let service: SystemSettingsService
  let prisma: PrismaService

  const mockPrisma = {
    systemSetting: {
      findMany: jest.fn().mockResolvedValue([
        { key: 'site.name', value: 'IRIB DWP', type: 'STRING', description: 'Site name' },
        { key: 'feature.new-ui', value: 'true', type: 'BOOLEAN', description: 'Enable new UI' },
      ]),
      findUnique: jest
        .fn()
        .mockResolvedValue({ key: 'site.name', value: 'IRIB DWP', type: 'STRING' }),
      upsert: jest.fn().mockResolvedValue({ key: 'site.name', value: 'New Name', type: 'STRING' }),
    },
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const m: TestingModule = await Test.createTestingModule({
      providers: [SystemSettingsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile()
    service = m.get<SystemSettingsService>(SystemSettingsService)
    prisma = m.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => expect(service).toBeDefined())

  describe('getAll', () => {
    it('returns all settings with typed values', async () => {
      const r = await service.getAll()
      expect(r).toHaveLength(2)
      expect(r[0].value).toBe('IRIB DWP')
    })
  })

  describe('get', () => {
    it('returns single setting by key', async () => {
      const r = await service.get('site.name')
      expect(prisma.systemSetting.findUnique).toHaveBeenCalledWith({ where: { key: 'site.name' } })
      expect(r.value).toBe('IRIB DWP')
    })
  })

  describe('set', () => {
    it('upserts setting with typed value', async () => {
      const r = await service.set('site.name', 'New Portal', 'STRING', 'Portal name')
      expect(prisma.systemSetting.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { key: 'site.name' },
          update: expect.objectContaining({ value: 'New Portal' }),
        })
      )
      expect(r.value).toBe('New Name')
    })
  })

  describe('isFeatureEnabled', () => {
    it('returns true for enabled boolean flag', async () => {
      mockPrisma.systemSetting.findUnique.mockResolvedValueOnce({
        key: 'feature.x',
        value: 'true',
        type: 'BOOLEAN',
      })
      expect(await service.isFeatureEnabled('feature.x')).toBe(true)
    })
    it('returns false for missing or disabled flag', async () => {
      mockPrisma.systemSetting.findUnique.mockResolvedValueOnce(null)
      expect(await service.isFeatureEnabled('feature.missing')).toBe(false)
      mockPrisma.systemSetting.findUnique.mockResolvedValueOnce({
        key: 'feature.y',
        value: 'false',
        type: 'BOOLEAN',
      })
      expect(await service.isFeatureEnabled('feature.y')).toBe(false)
    })
  })
})
