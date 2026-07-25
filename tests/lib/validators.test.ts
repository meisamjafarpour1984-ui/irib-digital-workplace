import { describe, it, expect } from 'vitest'
import { createContentSchema, loginSchema, otpSchema } from '@/lib/validators'

describe('Content Validators', () => {
  it('validates create content schema', () => {
    const valid = createContentSchema.safeParse({
      title: 'خبر جدید',
      contentType: 'news',
      scope: ['it'],
    })
    expect(valid.success).toBe(true)
  })

  it('rejects empty title', () => {
    const invalid = createContentSchema.safeParse({
      title: '',
      contentType: 'news',
      scope: ['it'],
    })
    expect(invalid.success).toBe(false)
  })

  it('rejects empty scope', () => {
    const invalid = createContentSchema.safeParse({
      title: 'خبر',
      contentType: 'news',
      scope: [],
    })
    expect(invalid.success).toBe(false)
  })
})

describe('Login Validators', () => {
  it('validates correct login', () => {
    const valid = loginSchema.safeParse({
      personnelCode: '12345',
      mobile: '09123456789',
    })
    expect(valid.success).toBe(true)
  })

  it('rejects short personnel code', () => {
    const invalid = loginSchema.safeParse({
      personnelCode: '12',
      mobile: '09123456789',
    })
    expect(invalid.success).toBe(false)
  })

  it('rejects invalid mobile', () => {
    const invalid = loginSchema.safeParse({
      personnelCode: '12345',
      mobile: '1234567890',
    })
    expect(invalid.success).toBe(false)
  })
})

describe('OTP Validators', () => {
  it('validates 6-digit OTP', () => {
    const valid = otpSchema.safeParse({ code: '123456' })
    expect(valid.success).toBe(true)
  })

  it('rejects short OTP', () => {
    const invalid = otpSchema.safeParse({ code: '12345' })
    expect(invalid.success).toBe(false)
  })
})
