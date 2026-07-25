import { UtilityBar } from '@/components/portal/utility-bar'
import { PortalHeader } from '@/components/portal/portal-header'
import { PortalFooter } from '@/components/portal/portal-footer'
import { WidgetRenderer } from '@/components/widgets/all-widgets'
import type { WidgetInstance } from '@/components/widgets/types'

// Ensure widgets are registered
import '@/components/widgets/manifest'

// Layout config — in production this comes from CMS via API
const homepageWidgets: WidgetInstance[] = [
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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <UtilityBar />
      <PortalHeader />

      <main className="mx-auto max-w-[1440px] px-4 py-6 md:px-6">
        {/* Hero + Sidebar */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 xl:col-span-9">
            <WidgetRenderer
              instances={homepageWidgets.filter(w => w.widgetId === 'hero-media')}
            />
          </div>
          <aside className="flex flex-col gap-5 lg:col-span-4 xl:col-span-3">
            <WidgetRenderer
              instances={homepageWidgets.filter(w =>
                ['internet-login', 'quick-access'].includes(w.widgetId)
              )}
            />
          </aside>
        </div>

        {/* Widget row */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <WidgetRenderer instances={homepageWidgets.filter(w => w.widgetId === 'media-gallery')} />
          <WidgetRenderer instances={homepageWidgets.filter(w => w.widgetId === 'news-timeline')} />
          <WidgetRenderer instances={homepageWidgets.filter(w => w.widgetId === 'dept-announcements-basic')} />
          <WidgetRenderer instances={homepageWidgets.filter(w => w.widgetId === 'it-services')} />
        </div>

        {/* Occasion banner */}
        <div className="mt-6">
          <WidgetRenderer instances={homepageWidgets.filter(w => w.widgetId === 'occasion-banner')} />
        </div>

        {/* Services */}
        <div className="mt-6">
          <WidgetRenderer instances={homepageWidgets.filter(w => w.widgetId === 'services-grid')} />
        </div>

        {/* Help */}
        <div className="mt-6">
          <WidgetRenderer instances={homepageWidgets.filter(w => w.widgetId === 'help-cards')} />
        </div>
      </main>

      <PortalFooter />
    </div>
  )
}
