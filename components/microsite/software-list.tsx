import { Download } from 'lucide-react'
import { PanelHeader } from '@/components/portal/panel-header'
import { softwareList } from '@/lib/microsite-data'
import { useTranslations } from 'next-intl'

export function SoftwareList() {
  const t = useTranslations('microsite.softwareList')
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <PanelHeader title={t('title')} moreLabel={t('moreLabel')} />
      <ul className="flex flex-col gap-3">
        {softwareList.map((sw) => {
          const Icon = sw.icon
          return (
            <li
              key={sw.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:border-brand/40"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-brand">
                <Icon className="size-5.5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{sw.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {sw.version} · {sw.size}
                </p>
              </div>
              <button
                type="button"
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-brand/10 px-3 py-2 text-xs font-bold text-brand transition-colors hover:bg-brand hover:text-white"
              >
                <Download className="size-4" aria-hidden />
                {t('download')}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
