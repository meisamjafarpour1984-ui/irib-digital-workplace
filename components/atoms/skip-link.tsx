import { cn } from '@/lib/utils'

interface SkipLinkProps {
  href?: string
  className?: string
}

export function SkipLink({ href = '#main-content', className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'fixed left-4 top-4 z-[100] -translate-y-full rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg transition-transform focus:translate-y-0',
        className
      )}
    >
      رفتن به محتوای اصلی
    </a>
  )
}
