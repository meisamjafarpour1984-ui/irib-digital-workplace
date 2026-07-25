'use client'

import { FileText, Clock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import type { WidgetProps } from './types'

const forms = [
  { id: 'f1', title: 'فرم درخواست نرم‌افزار', status: 'open', deadline: '۱۴۰۴/۰۳/۲۰', submissions: 45 },
  { id: 'f2', title: 'نظرسنجی رضایت کارکنان', status: 'open', deadline: '۱۴۰۴/۰۳/۲۵', submissions: 120 },
  { id: 'f3', title: 'فرم درخواست مرخصی', status: 'closed', deadline: '۱۴۰۴/۰۳/۱۰', submissions: 89 },
  { id: 'f4', title: 'فرم گزارش خرابی', status: 'open', deadline: 'ندارد', submissions: 23 },
]

const statusConfig = {
  open: { label: 'باز', icon: Clock, color: 'bg-success/10 text-success' },
  closed: { label: 'بسته شده', icon: CheckCircle, color: 'bg-muted text-muted-foreground' },
}

export function DeptFormsCenterWidget({ config }: WidgetProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-brand" aria-hidden />
          <h2 className="text-sm font-bold text-foreground">مرکز فرم‌ها</h2>
        </div>
        <span className="text-xs text-muted-foreground">{forms.filter(f => f.status === 'open').length} فرم فعال</span>
      </div>
      <ul className="space-y-2">
        {forms.map((form) => {
          const st = statusConfig[form.status as keyof typeof statusConfig]
          const Icon = st.icon
          return (
            <li key={form.id} className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-brand/40">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-brand">
                <FileText className="size-4.5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{form.title}</p>
                <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${st.color}`}>
                    <Icon className="size-3" aria-hidden />
                    {st.label}
                  </span>
                  <span>{form.submissions} ثبت‌نام</span>
                </div>
              </div>
              {form.status === 'open' && (
                <button type="button" className="flex shrink-0 items-center gap-1 rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand transition-colors hover:bg-brand hover:text-white">
                  تکمیل فرم
                  <ArrowLeft className="size-3" aria-hidden />
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
