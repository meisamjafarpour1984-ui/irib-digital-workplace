import { AlertTriangle, FileText } from 'lucide-react'
import { announcements } from '@/lib/portal-data'
import { PanelHeader } from './panel-header'
import { AccessibleButton } from '@/components/ui/AccessibleButton'

export function Announcements() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <PanelHeader title="اطلاعیه‌های اداری" moreLabel="مشاهده همه" moreHref="/announcements" />
      <ul>
        {announcements.map((item) => (
          <li key={item.id}>
            <AccessibleButton
              href={`/announcements/${item.id}`}
              className="group flex w-full items-start gap-2.5 border-b border-border py-3 last:border-0 last:pb-0 text-right"
            >
              <span
                className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md ${
                  item.urgent ? 'bg-warning/15 text-warning' : 'bg-brand-light text-brand'
                }`}
              >
                {item.urgent ? (
                  <AlertTriangle className="size-3.5" aria-hidden />
                ) : (
                  <FileText className="size-3.5" aria-hidden />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-sm font-medium leading-relaxed text-foreground transition-colors group-hover:text-brand">
                  {item.title}
                </h3>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            </AccessibleButton>
          </li>
        ))}
      </ul>
    </div>
  )
}
