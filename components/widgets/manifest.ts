import { widgetRegistry } from './widget-registry'
import type { WidgetManifest, WidgetProps } from './types'

// Widget imports
import { HeroMediaWidget } from './hero-media'
import { QuickAccessWidget } from './quick-access'
import { NewsTimelineWidget } from './news-timeline'
import { DeptAnnouncementsWidget } from './dept-announcements'
import { ResearchHighlightsWidget } from './research-highlights'
import { CalendarPrayerWidget } from './calendar-prayer'
import { WeatherWidget } from './weather'
import { AdminKPIWidget } from './admin-kpi'

// Portal widgets
import { LoginCard } from '@/components/portal/login-card'
import { Gallery } from '@/components/portal/gallery'
import { ITInfo } from '@/components/portal/it-info'
import { Announcements } from '@/components/portal/announcements'
import { ServicesGrid } from '@/components/portal/services-grid'
import { HelpCards } from '@/components/portal/help-cards'
import { OccasionBanner } from '@/components/portal/occasion-banner'

// Microsite widgets
import { DeptDocumentCenterWidget } from './dept-document-center'
import { DeptFormsCenterWidget } from './dept-forms-center'
import { DeptExpertsDirectoryWidget } from './dept-experts-directory'
import { DeptServiceCardsWidget } from './dept-service-cards'

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
    Component: LoginCard,
  },
  {
    manifest: {
      id: 'news-timeline',
      name: 'خط زمان اخبار',
      category: 'Content',
      description: 'آخرین اخبار و رویدادها',
      defaultSize: { cols: 8, rows: 10 },
      resizable: true,
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
    },
    Component: DeptAnnouncementsWidget,
  },
  {
    manifest: {
      id: 'media-gallery',
      name: 'گالری رویدادها',
      category: 'Media',
      description: 'تصاویر و GIF رویدادها',
      defaultSize: { cols: 6, rows: 8 },
    },
    Component: Gallery,
  },
  {
    manifest: {
      id: 'it-services',
      name: 'سرویس‌های IT',
      category: 'Services',
      description: 'کارت‌های خدمات فناوری اطلاعات',
      defaultSize: { cols: 4, rows: 10 },
    },
    Component: ITInfo,
  },
  {
    manifest: {
      id: 'dept-announcements-basic',
      name: 'اطلاعیه‌های اداری',
      category: 'Content',
      description: 'اطلاعیه‌های عمومی سازمان',
      defaultSize: { cols: 6, rows: 8 },
    },
    Component: Announcements,
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
    },
    Component: ServicesGrid,
  },
  {
    manifest: {
      id: 'help-cards',
      name: 'کارت‌های راهنما',
      category: 'Support',
      description: 'تیکت، FAQ و دسترسی پرکاربرد',
      defaultSize: { cols: 12, rows: 4 },
    },
    Component: HelpCards,
  },
  {
    manifest: {
      id: 'occasion-banner',
      name: 'بنر مناسبتی',
      category: 'Content',
      description: 'بنر تبریک مناسبت‌ها',
      defaultSize: { cols: 12, rows: 3 },
      draggable: true,
    },
    Component: OccasionBanner,
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
