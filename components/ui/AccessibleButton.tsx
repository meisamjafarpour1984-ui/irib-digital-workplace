'use client'

import { useRouter } from 'next/navigation'
import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react'

interface AccessibleButtonProps extends DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> {
  href?: string
  onClick?: () => void
}

export function AccessibleButton({ href, onClick, children, ...props }: AccessibleButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else if (onClick) {
      onClick()
    }
  }

  return (
    <button type="button" onClick={handleClick} {...props}>
      {children}
    </button>
  )
}
