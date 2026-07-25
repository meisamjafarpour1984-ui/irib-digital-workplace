'use client'

import { Users, Lightbulb } from 'lucide-react'
import type { WidgetProps } from './types'

const experts = [
  { id: 'e1', name: 'دکتر علی محمدی', title: 'پژوهشگر ارشد', skills: ['هوش مصنوعی', 'پردازش زبان'] },
  { id: 'e2', name: 'دکتر سارا احمدی', title: 'کارشناس رسانه', skills: ['تحلیل محتوا', 'رسانه دیجیتال'] },
  { id: 'e3', name: 'مهندس رضا کریمی', title: 'مدیر فنی', skills: ['شبکه', 'امنیت'] },
]

const ideas = [
  { id: 'i1', title: 'سیستم توصیه‌گر محتوا با AI', author: 'علی محمدی' },
  { id: 'i2', title: 'تحلیل احساسات مخاطبان', author: 'سارا احمدی' },
  { id: 'i3', title: 'بهینه‌سازی پخش زنده', author: 'رضا کریمی' },
]

export function ResearchHighlightsWidget({ config }: WidgetProps) {
  const expertLimit = (config?.expertLimit as number) ?? 3
  const ideaLimit = (config?.ideaLimit as number) ?? 3

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-gold" aria-hidden />
          <h2 className="text-heading-1 text-foreground">برجسته‌های پژوهش</h2>
        </div>
      </div>

      <div className="space-y-4">
        {/* Experts */}
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Users className="size-3.5" aria-hidden />
            کارشناسان برتر
          </div>
          <ul className="space-y-2">
            {experts.slice(0, expertLimit).map((expert) => (
              <li key={expert.id} className="flex items-center gap-3 rounded-xl border border-border p-2.5 transition-colors hover:border-brand/40">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-brand">
                  {expert.name.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{expert.name}</p>
                  <p className="text-xs text-muted-foreground">{expert.title}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Ideas */}
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Lightbulb className="size-3.5" aria-hidden />
            ایده‌های نو
          </div>
          <ul className="space-y-2">
            {ideas.slice(0, ideaLimit).map((idea) => (
              <li key={idea.id} className="rounded-xl border border-border p-2.5 transition-colors hover:border-brand/40">
                <p className="text-sm font-medium text-foreground">{idea.title}</p>
                <p className="text-xs text-muted-foreground">{idea.author}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
