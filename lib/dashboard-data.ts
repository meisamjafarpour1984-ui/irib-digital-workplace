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
} from 'lucide-react'

export type SidebarItem = { label: string; icon: LucideIcon; active?: boolean; badge?: string }

export const sidebarItems: SidebarItem[] = [
  { label: 'داشبورد', icon: LayoutDashboard, active: true },
  { label: 'محتوا', icon: FileText },
  { label: 'صفحه‌ها', icon: FileStack },
  { label: 'رسانه', icon: Radio },
  { label: 'فرم‌ها', icon: ClipboardList },
  { label: 'کاربران', icon: Users, badge: '۲۰۳' },
  { label: 'نقش‌ها و دسترسی‌ها', icon: ShieldCheck },
  { label: 'ویجت‌ها', icon: Blocks },
  { label: 'اطلاعیه‌ها', icon: Megaphone },
  { label: 'کارتابل‌ها', icon: Boxes },
  { label: 'تیکت‌ها', icon: Ticket, badge: '۷' },
  { label: 'تحلیل و آمار', icon: BarChart3 },
  { label: 'تنظیمات سیستم', icon: Settings },
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
