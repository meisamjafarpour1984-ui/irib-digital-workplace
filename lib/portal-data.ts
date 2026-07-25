import type { LucideIcon } from 'lucide-react'
import {
  LayoutGrid,
  Newspaper,
  GraduationCap,
  Palette,
  Cpu,
  Info,
  Phone,
  Users,
  FileText,
  Mail,
  CalendarClock,
  ShieldCheck,
  Image as ImageIcon,
  Video,
  FolderArchive,
  Network,
  MessageSquare,
  Download,
  HelpCircle,
  Ticket,
} from 'lucide-react'

export type NavItem = { label: string; href: string; active?: boolean }

export const navItems: NavItem[] = [
  { label: 'صفحه اصلی', href: '#', active: true },
  { label: 'معاونت‌ها', href: '#' },
  { label: 'اخبار', href: '#' },
  { label: 'خدمات و سامانه‌ها', href: '#' },
  { label: 'آموزش', href: '#' },
  { label: 'فرهنگ و هنر', href: '#' },
  { label: 'فناوری اطلاعات', href: '/it' },
  { label: 'درباره ما', href: '#' },
  { label: 'تماس با ما', href: '#' },
]

export const navIcons: LucideIcon[] = [
  LayoutGrid,
  Users,
  Newspaper,
  LayoutGrid,
  GraduationCap,
  Palette,
  Cpu,
  Info,
  Phone,
]

export type HeroSlide = {
  id: string
  category: string
  title: string
  excerpt: string
  cta: string
  image: string
}

export const heroSlides: HeroSlide[] = [
  {
    id: 'h1',
    category: 'رسانه ملی',
    title: 'رسانه ملی، پیام‌رسان اتحاد و توسعه آذربایجان',
    excerpt: 'با هم برای فرهنگی پویا، سازمانی هوشمند و آینده‌ای روشن',
    cta: 'مشاهده آخرین اخبار',
    image: '/images/hero-mosque.png',
  },
  {
    id: 'h2',
    category: 'زیرساخت',
    title: 'استودیوی جدید مرکز، گامی نو در تولید محتوای فاخر',
    excerpt: 'بهره‌برداری از تجهیزات پیشرفته پخش و ضبط در مرکز تبریز',
    cta: 'مشاهده گزارش',
    image: '/images/hero-broadcast.png',
  },
  {
    id: 'h3',
    category: 'فرهنگ و هنر',
    title: 'میراث فرهنگی آذربایجان، سرمایه‌ای ماندگار',
    excerpt: 'روایت هنر و معماری این دیار کهن در قاب رسانه ملی',
    cta: 'مشاهده برنامه‌ها',
    image: '/images/hero-culture.png',
  },
]

export type QuickLink = { label: string; icon: LucideIcon; href: string }

export const quickLinks: QuickLink[] = [
  { label: 'پیوند دیجیتال', icon: Network, href: '#' },
  { label: 'آرشیو خبری', icon: Newspaper, href: '#' },
  { label: 'آرشیو تصویر', icon: ImageIcon, href: '#' },
  { label: 'تقویم و وقایع', icon: CalendarClock, href: '#' },
  { label: 'دسترسی اداری', icon: FileText, href: '#' },
  { label: 'اتوماسیون اداری', icon: LayoutGrid, href: '#' },
  { label: 'سامانه مکاتبات', icon: Mail, href: '#' },
  { label: 'دسترسی‌های دیگر', icon: MessageSquare, href: '#' },
]

export type NewsItem = {
  id: string
  title: string
  time: string
  tag: 'اخبار مرکز' | 'روابط عمومی' | 'اداری و مالی'
}

export const latestNews: NewsItem[] = [
  { id: 'n1', title: 'برگزاری نشست هم‌اندیشی مدیران صدا و سیمای استان', time: '۳ ساعت پیش', tag: 'اخبار مرکز' },
  { id: 'n2', title: 'انعقاد تفاهم‌نامه همکاری با دانشگاه تبریز', time: '۵ ساعت پیش', tag: 'روابط عمومی' },
  { id: 'n3', title: 'بازدید رئیس سازمان از شبکه استانی سهند', time: '۲ روز پیش', tag: 'اخبار مرکز' },
  { id: 'n4', title: 'برنامه ویژه عید سعید غدیر خم از شبکه سما و رادیو', time: '۲ روز پیش', tag: 'روابط عمومی' },
  { id: 'n5', title: 'اجرای طرح آراستگی محیط اداری در معاونت‌ها', time: '۳ روز پیش', tag: 'اداری و مالی' },
]

export type Announcement = {
  id: string
  title: string
  time: string
  urgent?: boolean
}

export const announcements: Announcement[] = [
  { id: 'a1', title: 'قابل توجه همکاران محترم بازنشسته و شاغل', time: '۳ ساعت پیش', urgent: true },
  { id: 'a2', title: 'اطلاعیه شماره ۱۴۰۲ در خصوص بیمه تکمیلی', time: '۲ روز پیش' },
  { id: 'a3', title: 'قابل توجه دارندگان حساب کارتی', time: '۲ روز پیش', urgent: true },
  { id: 'a4', title: 'نمایشگاه هنر و رسانه (ایران‌کت)', time: '۳ روز پیش' },
  { id: 'a5', title: 'پذیرش در مجتمع تفریحی زیباکنار', time: '۴ روز پیش' },
]

export type ITInfo = {
  id: string
  title: string
  time: string
  icon: LucideIcon
}

export const itInfo: ITInfo[] = [
  { id: 'it1', title: 'راهنمای استفاده از سیستم تیکتینگ جدید', time: '۲ ساعت پیش', icon: Ticket },
  { id: 'it2', title: 'به‌روزرسانی نرم‌افزارهای سازمانی', time: '۳ روز پیش', icon: Download },
  { id: 'it3', title: 'آموزش امنیت اطلاعات کاربران', time: '۳ روز پیش', icon: ShieldCheck },
  { id: 'it4', title: 'دستورالعمل اتصال به WiFi سازمانی', time: '۴ روز پیش', icon: Network },
]

export type GalleryItem = { id: string; title: string; image: string }

export const galleryItems: GalleryItem[] = [
  { id: 'g1', title: 'نشست خبری مدیران مرکز', image: '/images/event-1.png' },
  { id: 'g2', title: 'اتاق فرمان تولید جدید', image: '/images/event-2.png' },
  { id: 'g3', title: 'جشنواره موسیقی نواحی', image: '/images/event-3.png' },
  { id: 'g4', title: 'مجمع عمومی معاونان', image: '/images/event-4.png' },
]

export type ServiceLink = { label: string; icon: LucideIcon; action: string }

export const services: ServiceLink[] = [
  { label: 'اتوماسیون اداری', icon: FileText, action: 'ورود به سامانه' },
  { label: 'ایمیل سازمانی', icon: Mail, action: 'ورود به سامانه' },
  { label: 'سامانه حضور و غیاب', icon: CalendarClock, action: 'ورود به سامانه' },
  { label: 'سامانه مالی و پشتیبانی', icon: LayoutGrid, action: 'ورود به سامانه' },
  { label: 'سامانه مکاتبات', icon: MessageSquare, action: 'ورود به سامانه' },
  { label: 'سامانه آموزش آنلاین', icon: GraduationCap, action: 'ورود به سامانه' },
  { label: 'پرتال پژوهش', icon: Users, action: 'ورود به سامانه' },
  { label: 'پرسش‌های متداول', icon: HelpCircle, action: 'مشاهده' },
]

export type ITCenterItem = { id: string; title: string; time: string; icon: LucideIcon }

export const helpCards = [
  {
    id: 'ticket',
    title: 'ثبت تیکت پشتیبانی',
    desc: 'مشکلات یا درخواست خود را ثبت و پیگیری نمایید',
    cta: 'ثبت تیکت جدید',
    icon: Ticket,
  },
  {
    id: 'faq',
    title: 'پرسش‌های متداول',
    desc: 'پاسخ سوالات رایج را اینجا بیابید',
    cta: 'مشاهده FAQ',
    icon: HelpCircle,
  },
  {
    id: 'sys',
    title: 'دسترسی پرکاربرد',
    desc: 'لینک سامانه‌های مهم فناوری اطلاعات',
    cta: 'مشاهده سامانه‌ها',
    icon: Cpu,
  },
] as const

export const videoIcon = Video
export const archiveIcon = FolderArchive
