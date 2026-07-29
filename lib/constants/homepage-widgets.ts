import type { WidgetInstance } from '@/components/widgets/types'

/** Default homepage layout when CMS / widget-engine has no published layout */
export const DEFAULT_HOMEPAGE_WIDGETS: WidgetInstance[] = [
  { id: 'w1', widgetId: 'hero-media', config: { autoPlay: true, interval: 5000 } },
  { id: 'w2', widgetId: 'quick-access', config: { maxItems: 8 } },
  { id: 'w3', widgetId: 'internet-login' },
  { id: 'w4', widgetId: 'news-timeline', config: { limit: 5 } },
  { id: 'w5', widgetId: 'media-gallery' },
  { id: 'w6', widgetId: 'dept-announcements-basic' },
  { id: 'w7', widgetId: 'it-services' },
  { id: 'w8', widgetId: 'occasion-banner' },
  { id: 'w9', widgetId: 'services-grid' },
  { id: 'w10', widgetId: 'help-cards' },
]

export const HOMEPAGE_PAGE_KEY = 'homepage'
