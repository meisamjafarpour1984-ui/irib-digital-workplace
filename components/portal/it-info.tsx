import { itInfo } from '@/lib/portal-data'
import { PanelHeader } from './panel-header'

export function ITInfo() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <PanelHeader title="فناوری اطلاعات" />
      <ul>
        {itInfo.map(({ id, title, time, icon: Icon }) => (
          <li key={id}>
            <a
              href="#"
              className="group flex items-start gap-2.5 border-b border-border py-3 last:border-0 last:pb-0"
            >
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-brand-light text-brand">
                <Icon className="size-3.5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-sm font-medium leading-relaxed text-foreground transition-colors group-hover:text-brand">
                  {title}
                </h3>
                <span className="text-xs text-muted-foreground">{time}</span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
