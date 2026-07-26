import { cn } from '@/lib/utils'

interface GridLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4 | 6 | 12
  gap?: 'sm' | 'md' | 'lg'
  as?: React.ElementType
}

const colClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
  12: 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12',
}

const gapClasses = {
  sm: 'gap-3',
  md: 'gap-4 lg:gap-6',
  lg: 'gap-6 lg:gap-8',
}

export function GridLayout({
  className,
  children,
  cols = 12,
  gap = 'md',
  as: Component = 'div',
  ...props
}: GridLayoutProps) {
  return (
    <Component className={cn('grid', colClasses[cols], gapClasses[gap], className)} {...props}>
      {children}
    </Component>
  )
}
