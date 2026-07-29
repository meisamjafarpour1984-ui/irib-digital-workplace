import { useQuery } from '@tanstack/react-query'
import { contentApi, localizedText, type ContentType } from '@/lib/services/content'
import type { HeroSlide } from '@/lib/portal-data'
import { latestNews, heroSlides } from '@/lib/portal-data'
import { formatRelativeTime } from '@/lib/jalali'

export type PortalNewsItem = {
  id: string
  title: string
  href: string
  time: string
  publishedAt?: string
}

export function mapFeedToNewsItems(
  items: Awaited<ReturnType<typeof contentApi.listFeed>>['items']
): PortalNewsItem[] {
  return items.map((item) => ({
    id: item.id,
    title: localizedText(item.title),
    href: `/news/${item.slug}`,
    time: item.publishedAt ? formatRelativeTime(item.publishedAt) : '',
  }))
}

export function mapFeedToHeroSlides(
  items: Awaited<ReturnType<typeof contentApi.listFeed>>['items']
): HeroSlide[] {
  return items.map((item) => {
    const metadata = (item.metadata ?? {}) as Record<string, unknown>
    return {
      id: item.id,
      category: typeof metadata.category === 'string' ? metadata.category : 'اخبار',
      title: localizedText(item.title),
      excerpt: localizedText(item.excerpt),
      cta: typeof metadata.cta === 'string' ? metadata.cta : 'مشاهده',
      image:
        typeof metadata.heroImage === 'string' ? metadata.heroImage : '/images/hero-mosque.png',
    }
  })
}

export function usePublishedContentFeed(type: ContentType, limit: number, enabled = true) {
  return useQuery({
    queryKey: ['content-feed', type, limit],
    queryFn: () => contentApi.listFeed({ type, limit }),
    enabled,
    staleTime: 60_000,
  })
}

export function usePortalNews(limit: number, seededItems?: PortalNewsItem[]) {
  const query = usePublishedContentFeed('NEWS', limit, !seededItems?.length)
  const items = seededItems?.length
    ? seededItems
    : query.data
      ? mapFeedToNewsItems(query.data.items)
      : latestNews.slice(0, limit)

  return { items, isLoading: query.isLoading && !seededItems?.length }
}

export function useHeroSlides(limit: number, seededSlides?: HeroSlide[]) {
  const query = usePublishedContentFeed('NEWS', limit, !seededSlides?.length)
  const slides = seededSlides?.length
    ? seededSlides
    : query.data
      ? mapFeedToHeroSlides(query.data.items)
      : heroSlides

  return { slides, isLoading: query.isLoading && !seededSlides?.length }
}
