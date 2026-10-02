/**
 * IRIB Digital Workplace Platform - Page Builder Service
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class PageBuilderService {
  private readonly logger = new Logger(PageBuilderService.name)

  constructor(private readonly prisma: PrismaService) {}

  async getLayouts() {
    return this.getAllPages()
  }

  async getLayoutById(id: string) {
    return this.prisma.pageLayout.findUnique({
      where: { id },
      include: { widgets: true },
    })
  }

  async createLayout(data: { name: string; layout: any }) {
    const created = await this.prisma.pageLayout.create({
      data: {
        pageKey: data.name,
        layoutConfig: data.layout,
        isDraft: true,
        createdBy: 'system',
      },
    })
    return created
  }

  async addWidgetToLayout(
    layoutId: string,
    data: {
      widgetId: string
      config?: any
      order?: number
      widgetKey?: string
      instanceId?: string
      gridPosition?: any
    }
  ) {
    const widgetKey = data.widgetKey ?? data.widgetId
    const instanceId = data.instanceId ?? `${widgetKey}-${Date.now()}`
    const gridPosition = data.gridPosition ?? {
      x: 0,
      y: data.order ?? 0,
      w: 12,
      h: 4,
    }

    return this.prisma.pageWidget.create({
      data: {
        pageLayoutId: layoutId,
        widgetKey,
        instanceId,
        config: data.config || {},
        gridPosition,
      },
    })
  }

  async getAllPages() {
    try {
      return this.prisma.pageLayout.findMany({
        orderBy: { createdAt: 'desc' },
      })
    } catch (error) {
      this.logger.error('Error getting all pages:', error)
      throw new BadRequestException('Failed to get pages')
    }
  }

  async getPage(id: string) {
    try {
      const page = await this.prisma.pageLayout.findUnique({
        where: { id },
      })
      if (!page) throw new NotFoundException('Page not found')
      return page
    } catch (error) {
      this.logger.error(`Error getting page ${id}:`, error)
      throw error
    }
  }

  async getPageBySlug(slug: string) {
    try {
      const page = await this.prisma.pageLayout.findFirst({
        where: { pageKey: slug },
      })
      if (!page) throw new NotFoundException('Page not found')
      return page
    } catch (error) {
      this.logger.error(`Error getting page by slug ${slug}:`, error)
      throw error
    }
  }

  async createPage(data: {
    title: any
    slug: string
    layout: any
    widgets: any[]
    status?: string
    createdBy?: string
  }) {
    try {
      // Check if slug already exists
      const existing = await this.prisma.pageLayout.findFirst({
        where: { pageKey: data.slug },
      })
      if (existing) {
        throw new BadRequestException('Page with this slug already exists')
      }

      return this.prisma.pageLayout.create({
        data: {
          pageKey: data.slug,
          layoutConfig: data.layout,
          isDraft: data.status !== 'PUBLISHED',
          createdBy: data.createdBy,
        },
      })
    } catch (error) {
      this.logger.error('Error creating page:', error)
      throw new BadRequestException('Failed to create page')
    }
  }

  async updatePage(id: string, data: any) {
    try {
      await this.getPage(id)

      return this.prisma.pageLayout.update({
        where: { id },
        data: {
          layoutConfig: data.layout,
          isDraft: data.status !== 'PUBLISHED',
        },
      })
    } catch (error) {
      this.logger.error(`Error updating page ${id}:`, error)
      throw new BadRequestException('Failed to update page')
    }
  }

  async deletePage(id: string) {
    try {
      await this.getPage(id)

      return this.prisma.pageLayout.update({
        where: { id },
        data: { isDraft: true },
      })
    } catch (error) {
      this.logger.error(`Error deleting page ${id}:`, error)
      throw new BadRequestException('Failed to delete page')
    }
  }

  async publishPage(id: string) {
    try {
      return this.prisma.pageLayout.update({
        where: { id },
        data: { isDraft: false, publishedAt: new Date() },
      })
    } catch (error) {
      this.logger.error(`Error publishing page ${id}:`, error)
      throw new BadRequestException('Failed to publish page')
    }
  }

  async unpublishPage(id: string) {
    try {
      return this.prisma.pageLayout.update({
        where: { id },
        data: { isDraft: true, publishedAt: null },
      })
    } catch (error) {
      this.logger.error(`Error unpublishing page ${id}:`, error)
      throw new BadRequestException('Failed to unpublish page')
    }
  }
}
