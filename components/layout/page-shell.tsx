import { cn } from '@/lib/utils'

interface PageShellProps {
  children: React.ReactNode
  variant?: 'public' | 'auth' | 'admin'
  className?: string
}

export function PageShell({ children, variant = 'public', className }: PageShellProps) {
  return (
    <div
      className={cn(
        'min-h-screen bg-background',
        variant === 'admin' && 'flex',
        className
      )}
    >
      {children}
    </div>
  )
}
