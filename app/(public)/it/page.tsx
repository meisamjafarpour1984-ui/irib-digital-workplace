/**
 * IRIB Digital Workplace Platform - IT Department Page
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { UtilityBar } from '@/components/portal/utility-bar'
import { PortalHeader } from '@/components/portal/portal-header'
import { PortalFooter } from '@/components/portal/portal-footer'
import { SoftwareList } from '@/components/microsite/software-list'
import { ItAnnouncements } from '@/components/microsite/it-announcements'
import { ItNews } from '@/components/microsite/it-news'
import { MicroActions } from '@/components/microsite/micro-actions'
import { Shield, Server, Wifi, Database, Headphones, Wrench } from 'lucide-react'

export const metadata = {
  title: 'فناوری اطلاعات | درگاه دیجیتال کارکنان',
  description: 'خدمات و سامانه‌های فناوری اطلاعات مرکز صدا و سیمای آذربایجان شرقی',
}

const services = [
  {
    id: 'automation',
    title: 'اتوماسیون اداری',
    description: 'سامانه جامع مدیریت فرآیندها و کارتابل الکترونیک',
    icon: Server,
    status: 'active',
  },
  {
    id: 'email',
    title: 'ایمیل سازمانی',
    description: 'خدمات ایمیل سازمانی و مدیریت حساب‌های کاربری',
    icon: Database,
    status: 'active',
  },
  {
    id: 'network',
    title: 'شبکه و اینترنت',
    description: 'مدیریت اتصال شبکه و خدمات اینترنتی',
    icon: Wifi,
    status: 'active',
  },
  {
    id: 'support',
    title: 'پشتیبانی فنی',
    description: 'خدمات پشتیبانی و تیکتینگ IT',
    icon: Headphones,
    status: 'active',
  },
  {
    id: 'hardware',
    title: 'سخت‌افزار',
    description: 'مدیریت تجهیزات سخت‌افزاری و سیستم‌ها',
    icon: Wrench,
    status: 'active',
  },
  {
    id: 'security',
    title: 'امنیت اطلاعات',
    description: 'مدیریت امنیت و دسترسی‌ها',
    icon: Shield,
    status: 'active',
  },
]

export default function ITDepartmentPage() {
  return (
    <div className="min-h-screen bg-background">
      <UtilityBar />
      <PortalHeader />

      <main className="mx-auto max-w-[1440px] px-4 py-6 md:px-6">
        {/* Hero Section */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-brand/10">
            <Server className="size-10 text-brand" aria-hidden />
          </div>
          <h1 className="mt-6 text-heading-1 text-foreground">معاونت فناوری اطلاعات</h1>
          <p className="mt-3 text-body-lg text-muted-foreground max-w-2xl mx-auto">
            پشتیبانی از زیرساخت‌های فنی و ارائه خدمات نوین به کارکنان، همواره در مسیر تحول دیجیتال
            سازمان
          </p>
        </div>

        {/* Services Grid */}
        <div className="mb-8">
          <h2 className="mb-4 text-heading-1 text-foreground">خدمات و سامانه‌ها</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon
              return (
                <div
                  key={service.id}
                  className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-brand/40"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                      <Icon className="size-6" aria-hidden />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">{service.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>
                      <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                        <span className="size-1.5 rounded-full bg-success" />
                        فعال
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ItAnnouncements />
          <SoftwareList />
        </div>

        <div className="mt-6">
          <MicroActions />
        </div>

        <div className="mt-6">
          <ItNews />
        </div>
      </main>

      <PortalFooter />
    </div>
  )
}
