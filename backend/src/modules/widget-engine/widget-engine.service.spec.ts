/**
 * IRIB Digital Workplace Platform - Widget Engine Service Unit Tests
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { WidgetEngineService } from './widget-engine.service'
import { PrismaService } from '../../prisma/prisma.service'

describe('WidgetEngineService', () => {
  let service: WidgetEngineService
  let prismaService: PrismaService

  const mockPrismaService = {
    widgetManifest: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    pageLayout: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WidgetEngineService,
        {
          provide: PrismaService,
          useValue: mockPrismaService as any,
        },
      ],
    }).compile()

    service = module.get<WidgetEngineService>(WidgetEngineService)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getRegistry', () => {
    it('should return all widgets from registry', async () => {
      const mockWidgets = [
        {
          id: '1',
          widgetKey: 'weather',
          name: 'Weather Widget',
          category: 'Utility',
          componentPath: '@/components/widgets/weather',
          permissions: ['Analytics.READ'],
          isSystem: true,
          isActive: true,
        },
        {
          id: '2',
          widgetKey: 'hero-media',
          name: 'Hero Media',
          category: 'Hero',
          componentPath: '@/components/widgets/hero-media',
          permissions: [],
          isSystem: true,
          isActive: true,
        },
      ]

      mockPrismaService.widgetManifest.findMany.mockResolvedValue(mockWidgets)

      const result = await service.getRegistry()

      expect(mockPrismaService.widgetManifest.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { category: 'asc' },
      })
      expect(result).toEqual(mockWidgets)
    })

    it('should filter by category', async () => {
      mockPrismaService.widgetManifest.findMany.mockResolvedValue([])

      await service.getRegistry('Utility')

      expect(mockPrismaService.widgetManifest.findMany).toHaveBeenCalledWith({
        where: {
          category: 'Utility',
        },
        orderBy: { category: 'asc' },
      })
    })
  })

  describe('getWidgetByKey', () => {
    it('should return widget by key', async () => {
      const mockWidget = {
        id: '1',
        widgetKey: 'weather',
        name: 'Weather Widget',
        category: 'Utility',
        componentPath: '@/components/widgets/weather',
        permissions: ['Analytics.READ'],
        isSystem: true,
        isActive: true,
      }

      mockPrismaService.widgetManifest.findUnique.mockResolvedValue(mockWidget)

      const result = await service.getWidgetByKey('weather')

      expect(mockPrismaService.widgetManifest.findUnique).toHaveBeenCalledWith({
        where: { widgetKey: 'weather' },
      })
      expect(result).toEqual(mockWidget)
    })

    it('should throw NotFoundException if widget not found', async () => {
      mockPrismaService.widgetManifest.findUnique.mockResolvedValue(null)

      await expect(service.getWidgetByKey('nonexistent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('registerWidget', () => {
    it('should register a new widget', async () => {
      const widgetData = {
        widgetKey: 'test-widget',
        name: 'Test Widget',
        category: 'Utility',
        componentPath: '@/components/widgets/test',
        permissions: ['User.READ'],
        isSystem: false,
      }

      const mockWidget = {
        id: '1',
        ...widgetData,
        isActive: true,
      }

      mockPrismaService.widgetManifest.findUnique.mockResolvedValue(null)
      mockPrismaService.widgetManifest.create.mockResolvedValue(mockWidget)

      const result = await service.registerWidget(widgetData)

      expect(mockPrismaService.widgetManifest.findUnique).toHaveBeenCalledWith({
        where: { widgetKey: 'test-widget' },
      })
      expect(mockPrismaService.widgetManifest.create).toHaveBeenCalledWith({
        data: widgetData,
      })
      expect(result).toEqual(mockWidget)
    })

    it('should throw ConflictException if widget already exists', async () => {
      const widgetData = {
        widgetKey: 'existing-widget',
        name: 'Existing Widget',
      }

      mockPrismaService.widgetManifest.findUnique.mockResolvedValue({
        id: '1',
        widgetKey: 'existing-widget',
      })

      await expect(service.registerWidget(widgetData)).rejects.toThrow()
    })
  })

  describe('updateWidget', () => {
    it('should update widget', async () => {
      const updateData = {
        name: 'Updated Widget Name',
      }

      const mockWidget = {
        id: '1',
        widgetKey: 'weather',
        name: 'Updated Widget Name',
        category: 'Utility',
      }

      mockPrismaService.widgetManifest.findUnique.mockResolvedValue({
        id: '1',
        widgetKey: 'weather',
      })
      mockPrismaService.widgetManifest.update.mockResolvedValue(mockWidget)

      const result = await service.updateWidget('weather', updateData)

      expect(mockPrismaService.widgetManifest.update).toHaveBeenCalledWith({
        where: { widgetKey: 'weather' },
        data: updateData,
      })
      expect(result).toEqual(mockWidget)
    })

    it('should throw NotFoundException if widget not found', async () => {
      mockPrismaService.widgetManifest.findUnique.mockResolvedValue(null)

      await expect(service.updateWidget('nonexistent', { name: 'Updated' })).rejects.toThrow(
        NotFoundException
      )
    })
  })

  describe('deleteWidget', () => {
    it('should delete widget', async () => {
      mockPrismaService.widgetManifest.findUnique.mockResolvedValue({
        id: '1',
        widgetKey: 'test-widget',
      })
      mockPrismaService.widgetManifest.delete.mockResolvedValue({ id: '1' })

      await service.deleteWidget('test-widget')

      expect(mockPrismaService.widgetManifest.delete).toHaveBeenCalledWith({
        where: { widgetKey: 'test-widget' },
      })
    })

    it('should throw NotFoundException if widget not found', async () => {
      mockPrismaService.widgetManifest.findUnique.mockResolvedValue(null)

      await expect(service.deleteWidget('nonexistent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('getPageLayout', () => {
    it('should return page layout', async () => {
      const mockLayout = {
        id: '1',
        pageKey: 'homepage',
        layout: {
          widgets: [
            { widgetKey: 'weather', position: { x: 0, y: 0 } },
            { widgetKey: 'hero-media', position: { x: 1, y: 0 } },
          ],
        },
      }

      mockPrismaService.pageLayout.findFirst.mockResolvedValue({
        ...mockLayout,
        isDraft: false,
        layoutConfig: [],
        widgets: [],
      })

      const result = await service.getPageLayout('homepage')

      expect(mockPrismaService.pageLayout.findFirst).toHaveBeenCalled()
      expect(result).toMatchObject({ id: '1', pageKey: 'homepage' })
    })

    it('should return null if layout not found', async () => {
      mockPrismaService.pageLayout.findFirst.mockResolvedValue(null)

      await expect(service.getPageLayout('nonexistent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('savePageLayout', () => {
    it('should create new page layout', async () => {
      const layoutData = {
        pageKey: 'test-page',
        layout: {
          widgets: [{ widgetKey: 'weather', position: { x: 0, y: 0 } }],
        },
      }

      const mockLayout = {
        id: '1',
        ...layoutData,
      }

      mockPrismaService.pageLayout.findFirst.mockResolvedValue(null)
      mockPrismaService.pageLayout.create.mockResolvedValue(mockLayout)

      const result = await service.savePageLayout(layoutData.pageKey, layoutData.layout)

      expect(mockPrismaService.pageLayout.create).toHaveBeenCalledWith({
        data: {
          pageKey: layoutData.pageKey,
          layoutConfig: layoutData.layout,
          isDraft: true,
          createdBy: 'system',
        },
      })
      expect(result).toEqual(mockLayout)
    })

    it('should update existing page layout', async () => {
      const layoutData = {
        pageKey: 'homepage',
        layout: {
          widgets: [{ widgetKey: 'weather', position: { x: 0, y: 0 } }],
        },
      }

      const mockLayout = {
        id: '1',
        ...layoutData,
      }

      mockPrismaService.pageLayout.findFirst.mockResolvedValue({
        id: '1',
        pageKey: 'homepage',
      })
      mockPrismaService.pageLayout.create.mockResolvedValue(mockLayout)
      mockPrismaService.pageLayout.update.mockResolvedValue(mockLayout)

      const result = await service.savePageLayout(layoutData.pageKey, layoutData.layout)

      expect(mockPrismaService.pageLayout.create).toHaveBeenCalled()
      expect(result).toEqual(mockLayout)
    })
  })
})
