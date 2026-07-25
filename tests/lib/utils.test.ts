import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn utility', () => {
  it('merges class names', () => {
    const result = cn('text-red-500', 'text-blue-500')
    expect(result).toBe('text-blue-500')
  })

  it('handles conditional classes', () => {
    const isActive = true
    const isHidden = false
    const result = cn('base', isActive && 'active', isHidden && 'hidden')
    expect(result).toContain('base')
    expect(result).toContain('active')
    expect(result).not.toContain('hidden')
  })

  it('handles undefined and null', () => {
    const result = cn('base', undefined, null)
    expect(result).toBe('base')
  })
})
