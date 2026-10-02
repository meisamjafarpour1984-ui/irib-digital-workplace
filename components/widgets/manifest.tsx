import { widgetRegistry } from './widget-registry'
import type { WidgetManifest, WidgetProps } from './types'
import {
  imageConfigSchema,
  serviceCardConfigSchema,
  newsConfigSchema,
  weatherConfigSchema,
  calendarConfigSchema,
} from './types'
import dynamic from 'next/dynamic'

// Widget Skeleton component for loading state
function WidgetSkeleton({ widgetId: _widgetId }: { widgetId: string }) {
  return (
    <div className="animate-pulse bg-gray-200 rounded-lg h-full w-full flex items-center justify-center">
      <span className="text-gray-400">...</span>
    </div>
  )
}

// Dynamic widget imports with loading skeleton
const HeroMediaWidget = dynamic(() => import('./hero-media').then((m) => m.HeroMediaWidget), {
  loading: () => <WidgetSkeleton widgetId="hero-media" />,
  ssr: true,
})

const QuickAccessWidget = dynamic(() => import('./quick-access').then((m) => m.QuickAccessWidget), {
  loading: () => <WidgetSkeleton widgetId="quick-access" />,
})

const NewsTimelineWidget = dynamic(
  () => import('./news-timeline').then((m) => m.NewsTimelineWidget),
  {
    loading: () => <WidgetSkeleton widgetId="news-timeline" />,
  }
)

const DeptAnnouncementsWidget = dynamic(
  () =>
    import('./dept-announcements').then((m) => {
      const { DeptAnnouncementsWidget } = m
      return function DeptAnnouncementsWidgetWrapper({ instance, config }: WidgetProps) {
        return <DeptAnnouncementsWidget instance={instance} config={config} />
      }
    }),
  {
    loading: () => <WidgetSkeleton widgetId="dept-announcements" />,
  }
)

const ResearchHighlightsWidget = dynamic(
  () => import('./research-highlights').then((m) => m.ResearchHighlightsWidget),
  {
    loading: () => <WidgetSkeleton widgetId="research-highlights" />,
  }
)

const CalendarPrayerWidget = dynamic(
  () => import('./calendar-prayer').then((m) => m.CalendarPrayerWidget),
  {
    loading: () => <WidgetSkeleton widgetId="calendar-prayer" />,
  }
)

const WeatherWidget = dynamic(() => import('./weather').then((m) => m.WeatherWidget), {
  loading: () => <WidgetSkeleton widgetId="weather" />,
  ssr: true,
})

const AdminKPIWidget = dynamic(() => import('./admin-kpi').then((m) => m.AdminKPIWidget), {
  loading: () => <WidgetSkeleton widgetId="admin-kpi" />,
})

// Portal widgets with wrapper components
const LoginCardWrapper = dynamic(
  () =>
    import('@/components/portal/login-card').then((m) => {
      const { LoginCard } = m
      return function LoginCardWidget({ config: _config }: WidgetProps) {
        return <LoginCard />
      }
    }),
  {
    loading: () => <WidgetSkeleton widgetId="login-card" />,
  }
)

const GalleryWrapper = dynamic(
  () =>
    import('@/components/portal/gallery').then((m) => {
      const { Gallery } = m
      return function GalleryWidget({ config: _config }: WidgetProps) {
        return <Gallery />
      }
    }),
  {
    loading: () => <WidgetSkeleton widgetId="gallery" />,
  }
)

const ITInfoWrapper = dynamic(
  () =>
    import('@/components/portal/it-info').then((m) => {
      const { ITInfo } = m
      return function ITInfoWidget({ config: _config }: WidgetProps) {
        return <ITInfo />
      }
    }),
  {
    loading: () => <WidgetSkeleton widgetId="it-info" />,
  }
)

const AnnouncementsWrapper = dynamic(
  () =>
    import('@/components/portal/announcements').then((m) => {
      const { Announcements } = m
      return function AnnouncementsWidget({ config }: WidgetProps) {
        return <Announcements config={config} />
      }
    }),
  {
    loading: () => <WidgetSkeleton widgetId="announcements" />,
  }
)

const ServicesGridWrapper = dynamic(
  () =>
    import('@/components/portal/services-grid').then((m) => {
      const { ServicesGrid } = m
      return function ServicesGridWidget({ config: _config }: WidgetProps) {
        return <ServicesGrid />
      }
    }),
  {
    loading: () => <WidgetSkeleton widgetId="services-grid" />,
  }
)

const HelpCardsWrapper = dynamic(
  () =>
    import('@/components/portal/help-cards').then((m) => {
      const { HelpCards } = m
      return function HelpCardsWidget({ config: _config }: WidgetProps) {
        return <HelpCards />
      }
    }),
  {
    loading: () => <WidgetSkeleton widgetId="help-cards" />,
  }
)

const OccasionBannerWrapper = dynamic(
  () =>
    import('@/components/portal/occasion-banner').then((m) => {
      const { OccasionBanner } = m
      return function OccasionBannerWidget({ instance, config }: WidgetProps) {
        return <OccasionBanner instance={instance} config={config} />
      }
    }),
  {
    loading: () => <WidgetSkeleton widgetId="occasion-banner" />,
  }
)

// Microsite widgets
const DeptDocumentCenterWidget = dynamic(
  () => import('./dept-document-center').then((m) => m.DeptDocumentCenterWidget),
  {
    loading: () => <WidgetSkeleton widgetId="dept-document-center" />,
  }
)

const DeptFormsCenterWidget = dynamic(
  () => import('./dept-forms-center').then((m) => m.DeptFormsCenterWidget),
  {
    loading: () => <WidgetSkeleton widgetId="dept-forms-center" />,
  }
)

const DeptExpertsDirectoryWidget = dynamic(
  () => import('./dept-experts-directory').then((m) => m.DeptExpertsDirectoryWidget),
  {
    loading: () => <WidgetSkeleton widgetId="dept-experts-directory" />,
  }
)

const DeptServiceCardsWidget = dynamic(
  () => import('./dept-service-cards').then((m) => m.DeptServiceCardsWidget),
  {
    loading: () => <WidgetSkeleton widgetId="dept-service-cards" />,
  }
)

const manifests: { manifest: WidgetManifest; Component: React.ComponentType<WidgetProps> }[] = [
  {
    manifest: {
      id: 'hero-media',
      name: 'Hero Media Experience',
      category: 'Hero',
      description: 'اسلایدر سینمایی عکس/ویدیو',
      defaultSize: { cols: 12, rows: 8 },
      resizable: false,
      draggable: false,
      ssr: true,
      configSchema: imageConfigSchema,
    },
    Component: HeroMediaWidget,
  },
  {
    manifest: {
      id: 'quick-access',
      name: 'دسترسی سریع',
      category: 'Navigation',
      description: 'شبکه آیکونی سامانه‌ها',
      defaultSize: { cols: 4, rows: 6 },
      resizable: { minCols: 3, maxCols: 6 },
      configSchema: serviceCardConfigSchema,
    },
    Component: QuickAccessWidget,
  },
  {
    manifest: {
      id: 'internet-login',
      name: 'لاگین اینترنت سازمانی',
      category: 'Auth',
      description: 'فرم ورود به اینترنت سازمانی',
      defaultSize: { cols: 4, rows: 6 },
    },
    Component: LoginCardWrapper,
  },
  {
    manifest: {
      id: 'news-timeline',
      name: 'خط زمان اخبار',
      category: 'Content',
      description: 'آخرین اخبار و رویدادها',
      defaultSize: { cols: 8, rows: 10 },
      resizable: true,
      configSchema: newsConfigSchema,
    },
    Component: NewsTimelineWidget,
  },
  {
    manifest: {
      id: 'dept-announcements',
      name: 'اطلاعیه‌های واحدها',
      category: 'Content',
      description: 'اطلاعیه‌های تب‌دار واحدها',
      defaultSize: { cols: 6, rows: 8 },
      configSchema: newsConfigSchema,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Component: DeptAnnouncementsWidget as any,
  },
  {
    manifest: {
      id: 'media-gallery',
      name: 'گالری رویدادها',
      category: 'Media',
      description: 'تصاویر و GIF رویدادها',
      defaultSize: { cols: 6, rows: 8 },
      configSchema: imageConfigSchema,
    },
    Component: GalleryWrapper,
  },
  {
    manifest: {
      id: 'it-services',
      name: 'سرویس‌های IT',
      category: 'Services',
      description: 'کارت‌های خدمات فناوری اطلاعات',
      defaultSize: { cols: 4, rows: 10 },
      configSchema: serviceCardConfigSchema,
    },
    Component: ITInfoWrapper,
  },
  {
    manifest: {
      id: 'dept-announcements-basic',
      name: 'اطلاعیه‌های اداری',
      category: 'Content',
      description: 'اطلاعیه‌های عمومی سازمان',
      defaultSize: { cols: 6, rows: 8 },
      configSchema: newsConfigSchema,
    },
    Component: AnnouncementsWrapper,
  },
  {
    manifest: {
      id: 'research-highlights',
      name: 'برجسته‌های پژوهش',
      category: 'Knowledge',
      description: 'کارشناسان و ایده‌های برتر',
      defaultSize: { cols: 4, rows: 8 },
    },
    Component: ResearchHighlightsWidget,
  },
  {
    manifest: {
      id: 'calendar-prayer',
      name: 'تقویم و اوقات شرعی',
      category: 'Utility',
      description: 'تقویم شمسی و اوقات شرعی',
      defaultSize: { cols: 4, rows: 6 },
      configSchema: calendarConfigSchema,
    },
    Component: CalendarPrayerWidget,
  },
  {
    manifest: {
      id: 'weather-tabriz',
      name: 'آب و هوای تبریز',
      category: 'Utility',
      description: 'اطلاعات جوی لحظه‌ای',
      defaultSize: { cols: 3, rows: 4 },
      configSchema: weatherConfigSchema,
    },
    Component: WeatherWidget,
  },
  {
    manifest: {
      id: 'admin-kpi-stats',
      name: 'شاخص‌های کلیدی عملکرد',
      category: 'Admin',
      description: 'KPIهای لحظه‌ای مدیریتی',
      defaultSize: { cols: 12, rows: 4 },
      permissions: ['Analytics.View.KPI'],
    },
    Component: AdminKPIWidget,
  },
  {
    manifest: {
      id: 'services-grid',
      name: 'خدمات و سامانه‌ها',
      category: 'Services',
      description: 'گرید خدمات سازمانی',
      defaultSize: { cols: 12, rows: 6 },
      configSchema: serviceCardConfigSchema,
    },
    Component: ServicesGridWrapper,
  },
  {
    manifest: {
      id: 'help-cards',
      name: 'کارت‌های راهنما',
      category: 'Support',
      description: 'تیکت، FAQ و دسترسی پرکاربرد',
      defaultSize: { cols: 12, rows: 4 },
      configSchema: serviceCardConfigSchema,
    },
    Component: HelpCardsWrapper,
  },
  {
    manifest: {
      id: 'occasion-banner',
      name: 'بنر مناسبتی',
      category: 'Content',
      description: 'بنر تبریک مناسبت‌ها',
      defaultSize: { cols: 12, rows: 3 },
      draggable: true,
      configSchema: imageConfigSchema,
    },
    Component: OccasionBannerWrapper,
  },
  {
    manifest: {
      id: 'dept-document-center',
      name: 'مرکز اسناد',
      category: 'Department',
      description: 'فهرست اسناد و فایل‌های دانلودی',
      defaultSize: { cols: 12, rows: 8 },
    },
    Component: DeptDocumentCenterWidget,
  },
  {
    manifest: {
      id: 'dept-forms-center',
      name: 'مرکز فرم‌ها',
      category: 'Department',
      description: 'فرم‌های فعال واحد',
      defaultSize: { cols: 6, rows: 8 },
    },
    Component: DeptFormsCenterWidget,
  },
  {
    manifest: {
      id: 'dept-experts-directory',
      name: 'فهرست کارشناسان',
      category: 'Department',
      description: 'کارشناسان و متخصصان واحد',
      defaultSize: { cols: 6, rows: 8 },
    },
    Component: DeptExpertsDirectoryWidget,
  },
  {
    manifest: {
      id: 'dept-service-cards',
      name: 'کارت‌های خدمات',
      category: 'Department',
      description: 'سرویس‌های اختصاصی واحد',
      defaultSize: { cols: 12, rows: 6 },
      configSchema: serviceCardConfigSchema,
    },
    Component: DeptServiceCardsWidget,
  },
]

// Register all widgets
manifests.forEach(({ manifest, Component }) => {
  widgetRegistry.register(manifest, Component)
})

export { widgetRegistry }
export type { WidgetManifest }
