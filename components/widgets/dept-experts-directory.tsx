'use client'

import { MessageSquare, Mail } from 'lucide-react'
import type { WidgetProps } from './types'

const experts = [
  {
    id: 'e1',
    name: 'دکتر علی محمدی',
    title: 'پژوهشگر ارشد',
    skills: ['هوش مصنوعی', 'پردازش زبان', 'یادگیری عمیق'],
    department: 'فناوری اطلاعات',
  },
  {
    id: 'e2',
    name: 'دکتر سارا احمدی',
    title: 'کارشناس رسانه',
    skills: ['تحلیل محتوا', 'رسانه دیجیتال', 'تولید محتوا'],
    department: 'روابط عمومی',
  },
  {
    id: 'e3',
    name: 'مهندس رضا کریمی',
    title: 'مدیر فنی',
    skills: ['شبکه', 'امنیت اطلاعات', 'سرور'],
    department: 'فناوری اطلاعات',
  },
  {
    id: 'e4',
    name: 'مهندس مریم حسنی',
    title: 'توسعه‌دهنده',
    skills: ['React', 'Node.js', 'TypeScript'],
    department: 'فناوری اطلاعات',
  },
]

export function DeptExpertsDirectoryWidget({ config }: WidgetProps) {
  const limit = (config?.limit as number) ?? 4
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-gold" aria-hidden />
          <h2 className="text-sm font-bold text-foreground">کارشناسان واحد</h2>
        </div>
        <span className="text-xs text-muted-foreground">{experts.length} نفر</span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {experts.slice(0, limit).map((expert) => (
          <div
            key={expert.id}
            className="flex items-start gap-3 rounded-xl border border-border p-3 transition-colors hover:border-brand/40"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-brand">
              {expert.name.slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{expert.name}</p>
              <p className="text-xs text-muted-foreground">{expert.title}</p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {expert.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-brand/10 hover:text-brand"
              aria-label="ارسال پیام"
            >
              <MessageSquare className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
