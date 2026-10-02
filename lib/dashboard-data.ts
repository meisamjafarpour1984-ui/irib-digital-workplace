import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  FileText,
  FileStack,
  Radio,
  Boxes,
  Users,
  ShieldCheck,
  Blocks,
  Megaphone,
  Ticket,
  BarChart3,
  Settings,
  ClipboardList,
  Bell,
  UserCheck,
  Activity as ActivityIcon,
  MessageSquare,
  Inbox,
  Package,
  Smartphone,
  Building2,
  File,
  Link2,
  Table2,
  Palette,
  Award,
} from 'lucide-react'

export type SidebarItem = {
  label: string
  icon: LucideIcon
  active?: boolean
  badge?: string
  href?: string
}

export const sidebarItems: SidebarItem[] = [
  { label: 'داشبورد', icon: LayoutDashboard, active: true, href: '/dashboard' },
  { label: 'محتوا', icon: FileText, href: '/dashboard/content' },
  { label: 'صفحه‌ها', icon: FileStack, href: '/dashboard/pages' },
  { label: 'رسانه', icon: Radio, href: '/dashboard/media' },
  { label: 'فرم‌ها', icon: ClipboardList, href: '/dashboard/forms' },
  { label: 'ارسال‌های فرم', icon: ClipboardList, href: '/dashboard/forms/submissions' },
  { label: 'کارتابل ارتباطات', icon: Inbox, href: '/dashboard/inbox' },
  { label: 'کاربران', icon: Users, badge: '۲۰۳', href: '/dashboard/users' },
  { label: 'نقش‌ها و دسترسی‌ها', icon: ShieldCheck, href: '/dashboard/roles' },
  { label: 'ویجت‌ها', icon: Blocks, href: '/dashboard/widgets' },
  { label: 'اطلاعیه‌ها', icon: Megaphone, href: '/dashboard/announcements' },
  { label: 'کارتابل‌ها', icon: Boxes, href: '/dashboard/workspaces' },
  { label: 'تیکت‌ها', icon: Ticket, badge: '۷', href: '/dashboard/tickets' },
  { label: 'پیامک', icon: MessageSquare, href: '/dashboard/sms' },
  { label: 'مدیریت سازمان', icon: Building2, href: '/dashboard/organization' },
  { label: 'متخصصین', icon: Award, href: '/dashboard/experts' },
  { label: 'دستگاه‌های موبایل', icon: Smartphone, href: '/dashboard/mobile' },
  { label: 'مرکز نرم‌افزار', icon: Package, href: '/dashboard/software' },
  { label: 'تولید PDF', icon: File, href: '/dashboard/pdf' },
  { label: 'سیستم Afish', icon: Table2, href: '/dashboard/afish' },
  { label: 'یکپارچه‌سازی', icon: Link2, href: '/dashboard/integrations' },
  { label: 'مدیریت Theme', icon: Palette, href: '/dashboard/theme' },
  { label: 'تحلیل و آمار', icon: BarChart3, href: '/dashboard/analytics' },
  { label: 'تنظیمات سیستم', icon: Settings, href: '/dashboard/settings' },
]

export type Kpi = {
  id: string
  label: string
  value: string
  delta: string
  trend: 'up' | 'down'
  icon: LucideIcon
}

export const kpis: Kpi[] = [
  {
    id: 'k1',
    label: 'بازدید امروز',
    value: '۲٬۷۴۵',
    delta: '۲۹٪+',
    trend: 'up',
    icon: ActivityIcon,
  },
  { id: 'k2', label: 'کاربران فعال', value: '۲۰۳', delta: '۱۳٪+', trend: 'up', icon: UserCheck },
  { id: 'k3', label: 'اطلاعیه‌ها', value: '۴۸', delta: '۹٪+', trend: 'up', icon: Bell },
  { id: 'k4', label: 'نظرسنجی‌ها', value: '۱۲۵', delta: '۱۸٪+', trend: 'up', icon: ClipboardList },
]

export type VisitPoint = { day: string; visits: number; unique: number }

export const visitsData: VisitPoint[] = [
  { day: '۶ خرداد', visits: 1320, unique: 820 },
  { day: '۷ خرداد', visits: 1610, unique: 980 },
  { day: '۸ خرداد', visits: 1440, unique: 910 },
  { day: '۹ خرداد', visits: 1980, unique: 1180 },
  { day: '۱۰ خرداد', visits: 1720, unique: 1040 },
  { day: '۱۱ خرداد', visits: 2380, unique: 1420 },
  { day: '۱۲ خرداد', visits: 2745, unique: 1610 },
]

export type TrafficSlice = { source: string; value: number; color: string }

export const trafficData: TrafficSlice[] = [
  { source: 'مستقیم', value: 70, color: 'var(--color-chart-1)' },
  { source: 'جستجو', value: 18, color: 'var(--color-chart-2)' },
  { source: 'شبکه‌های اجتماعی', value: 12, color: 'var(--color-chart-3)' },
]

export type ActivityRow = {
  id: string
  user: string
  action: string
  time: string
}

export const activities: ActivityRow[] = [
  { id: 'ac1', user: 'محمد احمدی', action: 'خبری را منتشر کرد', time: '۱۰:۱۵' },
  { id: 'ac2', user: 'علی رضایی', action: 'فرم نظرسنجی جدید ایجاد کرد', time: '۰۹:۴۲' },
  { id: 'ac3', user: 'سارا موسوی', action: 'اطلاعیه بیمه را ویرایش کرد', time: '۰۹:۲۰' },
  { id: 'ac4', user: 'رضا کریمی', action: 'کاربر جدید را تأیید کرد', time: '۰۸:۵۵' },
  { id: 'ac5', user: 'مریم حسنی', action: 'ویجت گالری را به صفحه اصلی افزود', time: '۰۸:۳۰' },
]

export type TicketRow = {
  id: string
  title: string
  status: 'در حال بررسی' | 'جدید' | 'پاسخ داده شد'
  time: string
}

export const tickets: TicketRow[] = [
  { id: 'tk1', title: 'مشکل در ورود به سامانه اتوماسیون', status: 'در حال بررسی', time: '۱۰:۱۵' },
  { id: 'tk2', title: 'خطای دریافت ایمیل سازمانی', status: 'جدید', time: '۰۹:۴۲' },
  { id: 'tk3', title: 'درخواست دسترسی به آرشیو تصویری', status: 'پاسخ داده شد', time: '۰۹:۱۰' },
  { id: 'tk4', title: 'کندی سرعت شبکه در طبقه سوم', status: 'در حال بررسی', time: '۰۸:۴۰' },
]

export type DashboardData = {
  dailyVisits: number
  activeUsers: number
  announcements: number
  polls: number
  recentActivity: unknown[]
  recentTickets: unknown[]
}

let dashboardCache: DashboardData | null = null

export function clearDashboardDataCache() {
  dashboardCache = null
}

export async function getDashboardData(): Promise<DashboardData> {
  if (dashboardCache) return dashboardCache

  const response = await globalThis.fetch('/api/v1/analytics/dashboard/overview')
  if (!response.ok) {
    throw new Error(`Dashboard request failed: ${response.status}`)
  }

  const data = (await response.json()) as DashboardData
  dashboardCache = data
  return data
}
