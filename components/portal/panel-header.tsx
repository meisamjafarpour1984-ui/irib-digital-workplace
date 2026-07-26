import { ChevronLeft } from 'lucide-react'

export function PanelHeader({
  title,
  moreLabel = 'مشاهده همه',
}: {
  title: string
  moreLabel?: string
}) {
  return (
    <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
      <div className="flex items-center gap-2">
        <span className="h-5 w-1 rounded-full bg-brand" aria-hidden />
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
      </div>
      <a
        href="#"
        className="flex items-center gap-0.5 text-xs font-medium text-brand hover:underline"
      >
        {moreLabel}
        <ChevronLeft className="size-3.5" aria-hidden />
      </a>
    </div>
  )
}
