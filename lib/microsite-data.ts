import type { LucideIcon } from 'lucide-react'
import {
  Home,
  Package,
  FileText,
  LifeBuoy,
  BriefcaseBusiness,
  Phone,
  ShieldCheck,
  Database,
  Bug,
  FileSpreadsheet,
  Network,
  KeyRound,
  Wifi,
  BellRing,
  GraduationCap,
  Ticket,
  HelpCircle,
  LayoutGrid,
} from 'lucide-react'

export type MicroNav = { label: string; icon: LucideIcon; active?: boolean }

export const microNav: MicroNav[] = [
  { label: 'home', icon: Home, active: true },
  { label: 'software', icon: Package },
  { label: 'forms', icon: FileText },
  { label: 'services', icon: LifeBuoy },
  { label: 'inbox', icon: BriefcaseBusiness },
  { label: 'contact', icon: Phone },
]

export type Software = {
  id: string
  name: string
  version: string
  size: string
  icon: LucideIcon
}

export const softwareList: Software[] = [
  {
    id: 's1',
    name: 'نرم‌افزار مدیریت پروژه سازمانی',
    version: 'نسخه ۲٫۶٫۱',
    size: 'حجم ۴۵ مگابایت',
    icon: LayoutGrid,
  },
  {
    id: 's2',
    name: 'نرم‌افزار حسابداری پارسیان',
    version: 'نسخه ۵٫۰',
    size: 'حجم ۸۷ مگابایت',
    icon: FileSpreadsheet,
  },
  {
    id: 's3',
    name: 'نرم‌افزار آنتی‌ویروس سازمانی',
    version: 'نسخه ۲۰٫۴',
    size: 'حجم ۶۲ مگابایت',
    icon: ShieldCheck,
  },
  {
    id: 's4',
    name: 'نرم‌افزار اتوماسیون اداری',
    version: 'نسخه ۴٫۰٫۲',
    size: 'حجم ۳۹ مگابایت',
    icon: Database,
  },
]

export type ITAnnouncement = {
  id: string
  title: string
  time: string
  icon: LucideIcon
}

export const itAnnouncements: ITAnnouncement[] = [
  { id: 'i1', title: 'راه‌اندازی نسخه جدید درگاه کاربران', time: '۲ ساعت پیش', icon: Network },
  { id: 'i2', title: 'تغییر رمز عبور دوره‌ای (ضروری)', time: '۲ روز پیش', icon: KeyRound },
  { id: 'i3', title: 'اطلاعیه قطعی شبکه داخلی', time: '۳ روز پیش', icon: Wifi },
  { id: 'i4', title: 'آموزش کار با سامانه جدید تیکتینگ', time: '۳ روز پیش', icon: GraduationCap },
]

export type ITNews = { id: string; title: string; time: string }

export const itNews: ITNews[] = [
  { id: 'nn1', title: 'استقرار سرور مجازی‌سازی جدید در مرکز داده', time: '۱ روز پیش' },
  { id: 'nn2', title: 'راه‌اندازی سامانه مانیتورینگ شبکه (Cacti)', time: '۲ روز پیش' },
  { id: 'nn3', title: 'ارتقای پهنای باند اینترنت سازمانی', time: '۴ روز پیش' },
  { id: 'nn4', title: 'راه‌اندازی سامانه تیکتینگ نوین فناوری اطلاعات', time: '۵ روز پیش' },
]

export const microActions = [
  {
    id: 'ticket',
    title: 'ثبت تیکت پشتیبانی',
    desc: 'مشکل خود را ثبت و پیگیری کنید',
    cta: 'ثبت تیکت جدید',
    icon: Ticket,
  },
  {
    id: 'faq',
    title: 'پرسش‌های متداول',
    desc: 'پاسخ سوالات رایج فناوری اطلاعات',
    cta: 'مشاهده FAQ',
    icon: HelpCircle,
  },
  {
    id: 'report',
    title: 'گزارش خرابی',
    desc: 'اعلام اختلال سخت‌افزار و شبکه',
    cta: 'ثبت گزارش',
    icon: Bug,
  },
] as const

export const microStats = [
  { label: 'میانگین زمان پاسخ', value: '۱٫۸ ساعت' },
  { label: 'تیکت‌های حل‌شده', value: '۹۸٪' },
  { label: 'سامانه‌های فعال', value: '۲۴' },
  { label: 'آپ‌تایم شبکه', value: '۹۹٫۹٪' },
]

export const alertIcon = BellRing
