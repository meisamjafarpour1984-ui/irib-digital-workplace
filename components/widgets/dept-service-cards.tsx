'use client'

import { Ticket, Download, GraduationCap, Network, ArrowLeft } from 'lucide-react'
import type { WidgetProps } from './types'

const services = [
  { id: 's1', title: 'ثبت تیکت پشتیبانی', desc: 'مشکلات فنی خود را گزارش دهید', icon: Ticket, href: '#' },
  { id: 's2', title: 'دانلود نرم‌افزار', desc: 'نرم‌افزارهای مجاز سازمانی', icon: Download, href: '#' },
  { id: 's3', title: 'آموزش IT', desc: 'دوره‌های آنلاین فناوری اطلاعات', icon: GraduationCap, href: '#' },
  { id: 's4', title: 'وضعیت شبکه', desc: 'مانیتورینگ لحظه‌ای زیرساخت', icon: Network, href: '#' },
]

export function DeptServiceCardsWidget({ config }: WidgetProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-brand" aria-hidden />
          <h2 className="text-sm font-bold text-foreground">سرویس‌های واحد</h2>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {services.map((service) => {
          const Icon = service.icon
          return (
            <a
              key={service.id}
              href={service.href}
              className="group flex flex-col items-start gap-3 rounded-xl border border-border p-4 transition-all hover:border-brand/50 hover:shadow-sm"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-brand-light text-brand transition-colors group-hover:bg-brand group-hover:text-primary-foreground">
                <Icon className="size-5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{service.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{service.desc}</p>
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-brand">
                مشاهده
                <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-1" aria-hidden />
              </span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
