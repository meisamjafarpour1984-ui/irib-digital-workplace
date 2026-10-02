import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { ContentType, ContentStatus } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import type {
  LayoutConfigEntry,
  ResolvedWidgetInstance,
  WidgetDataEnvelope,
} from './widget-layout.types'

function localizedText(value: unknown): string {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const record = value as Record<string, string>
    return record.fa ?? record.en ?? ''
  }
  return ''
}

@Injectable()
export class WidgetService {
  constructor(private readonly prisma: PrismaService) {}

  async getRegistry(category?: string) {
    return this.prisma.widgetManifest.findMany({
      where: category ? { category } : {},
      orderBy: { category: 'asc' },
    })
  }

  async getWidgetByKey(widgetKey: string) {
    const widget = await this.prisma.widgetManifest.findUnique({ where: { widgetKey } })
    if (!widget) throw new NotFoundException('Widget not found')
    return widget
  }

  async registerWidget(data: Record<string, unknown>) {
    const widgetKey = data.widgetKey as string
    const existing = await this.prisma.widgetManifest.findUnique({ where: { widgetKey } })
    if (existing) throw new ConflictException('Widget already exists')
    return this.prisma.widgetManifest.create({ data: data as never })
  }

  async updateWidget(widgetKey: string, data: Record<string, unknown>) {
    await this.getWidgetByKey(widgetKey)
    return this.prisma.widgetManifest.update({ where: { widgetKey }, data: data as never })
  }

  async deleteWidget(widgetKey: string) {
    await this.getWidgetByKey(widgetKey)
    return this.prisma.widgetManifest.delete({ where: { widgetKey } })
  }

  async getPageLayout(pageKey: string) {
    const layout = await this.findPublishedLayout(pageKey)
    if (!layout) {
      // Return default empty layout for homepage if not found
      if (pageKey === 'homepage') {
        return {
          pageKey: 'homepage',
          layoutConfig: [],
          widgets: [],
          instances: [],
          isDefault: true,
        }
      }
      throw new NotFoundException('Page layout not found')
    }
    return {
      ...layout,
      instances: this.toInstances(layout),
    }
  }

  async resolvePageInstances(pageKey: string): Promise<ResolvedWidgetInstance[] | null> {
    const layout = await this.findPublishedLayout(pageKey)
    if (!layout) {
      // Return empty array for homepage if not found
      if (pageKey === 'homepage') {
        return []
      }
      return null
    }
    return this.toInstances(layout)
  }

  async getRenderData(pageKey: string): Promise<WidgetDataEnvelope[]> {
    const instances = (await this.resolvePageInstances(pageKey)) ?? []
    const envelopes: WidgetDataEnvelope[] = []

    for (const instance of instances) {
      try {
        const data = await this.aggregateWidgetData(instance.widgetKey, instance.config)
        envelopes.push({
          instanceId: instance.instanceId,
          widgetKey: instance.widgetKey,
          config: instance.config,
          data,
          ssr: true,
          errors: [],
        })
      } catch (error) {
        envelopes.push({
          instanceId: instance.instanceId,
          widgetKey: instance.widgetKey,
          config: instance.config,
          data: {},
          ssr: true,
          errors: [error instanceof Error ? error.message : 'Widget data aggregation failed'],
        })
      }
    }

    return envelopes
  }

  async savePageLayout(pageKey: string, config: unknown, userId = 'system') {
    return this.prisma.pageLayout.create({
      data: {
        pageKey,
        layoutConfig: config as object,
        isDraft: true,
        createdBy: userId,
      },
    })
  }

  async publishLayout(pageKey: string, userId: string) {
    const draft = await this.prisma.pageLayout.findFirst({
      where: { pageKey, isDraft: true },
      orderBy: { version: 'desc' },
    })
    if (!draft) throw new NotFoundException('No draft found')

    return this.prisma.pageLayout.update({
      where: { id: draft.id },
      data: { isDraft: false, publishedAt: new Date(), createdBy: draft.createdBy ?? userId },
    })
  }

  async getThemeTokens() {
    return this.prisma.themeToken.findMany()
  }

  async updateThemeTokens(tokens: unknown, userId: string) {
    return this.prisma.themeToken.upsert({
      where: { name: 'current-theme' },
      update: { tokens: tokens as object },
      create: {
        name: 'current-theme',
        category: 'brand',
        tokens: tokens as object,
        isDefault: true,
        isActive: true,
        createdBy: userId,
      },
    })
  }

  private async findPublishedLayout(pageKey: string) {
    return this.prisma.pageLayout.findFirst({
      where: { pageKey, isDraft: false },
      orderBy: { version: 'desc' },
      include: { widgets: true },
    })
  }

  private toInstances(layout: any): ResolvedWidgetInstance[] {
    // If layout has widgets array, use it
    if (layout.widgets && layout.widgets.length > 0) {
      return layout.widgets.map((widget: any) => ({
        instanceId: widget.instanceId,
        widgetKey: widget.widgetKey,
        config: (widget.config as Record<string, unknown>) ?? {},
        gridPosition: widget.gridPosition as ResolvedWidgetInstance['gridPosition'],
      }))
    }

    // Otherwise, try to parse from layoutConfig
    if (!Array.isArray(layout.layoutConfig)) return []

    return (layout.layoutConfig as LayoutConfigEntry[]).map((entry) => ({
      instanceId: entry.instanceId,
      widgetKey: entry.widgetKey,
      config: entry.config ?? {},
      gridPosition: entry.grid
        ? { x: entry.grid.x, y: entry.grid.y, w: entry.grid.w, h: entry.grid.h }
        : undefined,
    }))
  }

  private async aggregateWidgetData(
    widgetKey: string,
    config: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    switch (widgetKey) {
      case 'hero-media':
        return { slides: await this.fetchHeroSlides(config) }
      case 'news-timeline':
        return { items: await this.fetchContentFeed('NEWS', config) }
      case 'dept-announcements':
      case 'dept-announcements-basic':
        return { items: await this.fetchContentFeed('ANNOUNCEMENT', config) }
      case 'media-gallery':
        return { items: await this.fetchContentFeed('GALLERY', config) }
      case 'occasion-banner':
        return { items: await this.fetchContentFeed('BANNER', { ...config, limit: 1 }) }
      default:
        return {}
    }
  }

  private async fetchHeroSlides(config: Record<string, unknown>) {
    const limit = typeof config.limit === 'number' ? config.limit : 5
    const items = await this.prisma.content.findMany({
      where: {
        deletedAt: null,
        status: ContentStatus.PUBLISHED,
        contentType: { in: [ContentType.NEWS, ContentType.BANNER] },
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    })

    return items.map((item) => {
      const metadata = (item.metadata as Record<string, unknown>) ?? {}
      return {
        id: item.id,
        category: localizedText(metadata.category) || 'اخبار',
        title: localizedText(item.title),
        excerpt: localizedText(item.excerpt),
        cta: localizedText(metadata.cta) || 'مشاهده',
        image: (metadata.heroImage as string) || '/images/hero-mosque.png',
        href: `/news/${item.slug}`,
      }
    })
  }

  private async fetchContentFeed(contentType: ContentType, config: Record<string, unknown>) {
    const limit = typeof config.limit === 'number' ? Math.min(config.limit, 50) : 10
    const items = await this.prisma.content.findMany({
      where: {
        deletedAt: null,
        status: ContentStatus.PUBLISHED,
        contentType,
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    })

    return items.map((item) => ({
      id: item.id,
      title: localizedText(item.title),
      excerpt: localizedText(item.excerpt),
      href: `/news/${item.slug}`,
      publishedAt: item.publishedAt?.toISOString() ?? item.createdAt.toISOString(),
    }))
  }
}
