import { cn } from '@/lib/utils'

interface IdentityPatternProps {
  opacity?: number
  className?: string
}

export function IdentityPattern({ opacity = 0.03, className }: IdentityPatternProps) {
  return (
    <svg
      className={cn('pointer-events-none absolute inset-0 size-full', className)}
      aria-hidden="true"
      style={{ opacity }}
    >
      <defs>
        {/* Gereh-chini (Knotwork) pattern inspired by Blue Mosque tiles */}
        <pattern
          id="peds-knotwork"
          x="0"
          y="0"
          width="60"
          height="60"
          patternUnits="userSpaceOnUse"
        >
          {/* Central octagon */}
          <path
            d="M30 5 L45 12 L50 27 L45 42 L30 49 L15 42 L10 27 L15 12 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
          />
          {/* Inner star */}
          <path
            d="M30 15 L35 22 L42 22 L37 28 L39 35 L30 31 L21 35 L23 28 L18 22 L25 22 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.3"
          />
          {/* Corner diamonds */}
          <path d="M0 0 L8 4 L4 8 Z" fill="none" stroke="currentColor" strokeWidth="0.3" />
          <path d="M60 0 L52 4 L56 8 Z" fill="none" stroke="currentColor" strokeWidth="0.3" />
          <path d="M0 60 L8 56 L4 52 Z" fill="none" stroke="currentColor" strokeWidth="0.3" />
          <path d="M60 60 L52 56 L56 52 Z" fill="none" stroke="currentColor" strokeWidth="0.3" />
          {/* Connecting lines */}
          <line x1="0" y1="30" x2="10" y2="27" stroke="currentColor" strokeWidth="0.2" />
          <line x1="60" y1="30" x2="50" y2="27" stroke="currentColor" strokeWidth="0.2" />
          <line x1="30" y1="0" x2="45" y2="12" stroke="currentColor" strokeWidth="0.2" />
          <line x1="30" y1="60" x2="45" y2="42" stroke="currentColor" strokeWidth="0.2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#peds-knotwork)" />
    </svg>
  )
}
