import { Test, TestingModule } from '@nestjs/testing'
import { PageBuilderService } from './page-builder.service'
import { PrismaService } from '../../prisma/prisma.service'

describe('PageBuilderService', () => {
  let service: PageBuilderService
  let prisma: PrismaService

  const mockLayout = {
    id: 'lay-1',
    pageKey: 'home',
    layoutConfig: { sections: [] },
    isDraft: true,
    createdBy: 'system',
  }
  const mockPrisma = {
    pageLayout: {
      findMany: jest.fn().mockResolvedValue([mockLayout]),
      findUnique: jest.fn().mockResolvedValue(mockLayout),
      create: jest.fn().mockResolvedValue(mockLayout),
      update: jest.fn().mockResolvedValue({ ...mockLayout, pageKey: 'updated-home' }),
      delete: jest.fn().mockResolvedValue(mockLayout),
    },
    pageWidget: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest
        .fn()
        .mockResolvedValue({
          id: 'pw-1',
          pageLayoutId: 'lay-1',
          widgetKey: 'news-timeline',
          config: {},
        }),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
    },
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const m: TestingModule = await Test.createTestingModule({
      providers: [PageBuilderService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile()
    service = m.get<PageBuilderService>(PageBuilderService)
    prisma = m.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => expect(service).toBeDefined())

  describe('getLayouts', () => {
    it('lists all page layouts', async () => {
      const r = await service.getLayouts()
      expect(prisma.pageLayout.findMany).toHaveBeenCalled()
      expect(r).toHaveLength(1)
    })
  })

  describe('getLayoutById', () => {
    it('finds layout with widgets', async () => {
      const r = await service.getLayoutById('lay-1')
      expect(prisma.pageLayout.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'lay-1' }, include: { widgets: true } })
      )
      expect(r).toEqual(mockLayout)
    })
  })

  describe('createLayout', () => {
    it('creates new layout', async () => {
      const r = await service.createLayout({ name: 'New Page', layout: { sections: [] } })
      expect(prisma.pageLayout.create).toHaveBeenCalled()
      expect(r.pageKey).toBe('home')
    })
  })

  describe('addWidgetToLayout', () => {
    it('adds widget instance to layout', async () => {
      const r = await service.addWidgetToLayout('lay-1', {
        widgetId: 'news-timeline',
        config: { limit: 5 },
        order: 1,
      })
      expect(prisma.pageWidget.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            pageLayoutId: 'lay-1',
            widgetKey: 'news-timeline',
            config: { limit: 5 },
            gridPosition: expect.objectContaining({ y: 1 }),
          }),
        })
      )
      expect(r.widgetKey).toBe('news-timeline')
    })
  })
})
