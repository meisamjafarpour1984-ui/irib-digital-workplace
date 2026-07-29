import { latestNews } from '@/lib/portal-data'
import { PanelHeader } from './panel-header'
import { AccessibleButton } from '@/components/ui/AccessibleButton'

export function NewsTimeline() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <PanelHeader title="آخرین اخبار" />
      <ul>
        {latestNews.map((item) => (
          <li key={item.id}>
            <AccessibleButton
              href={`/news/${item.id}`}
              className="group flex flex-col gap-1 border-b border-border py-3 last:border-0 last:pb-0"
            >
              <h3 className="line-clamp-2 text-sm font-medium leading-relaxed text-foreground transition-colors group-hover:text-brand">
                {item.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-brand">
                  {item.tag}
                </span>
                <span>{item.time}</span>
              </div>
            </AccessibleButton>
          </li>
        ))}
      </ul>
    </div>
  )
}
