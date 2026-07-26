import { cn } from '@/lib/utils'

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

export function Section({ className, children, ...props }: SectionProps) {
  return (
    <section className={cn('py-6', className)} {...props}>
      {children}
    </section>
  )
}
