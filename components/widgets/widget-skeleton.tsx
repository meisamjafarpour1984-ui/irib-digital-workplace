import { Skeleton } from '@/components/ui/skeleton'

interface WidgetSkeletonProps {
  widgetId: string
}

export function WidgetSkeleton({ widgetId }: WidgetSkeletonProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="h-5 w-1 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
    </div>
  )
}
