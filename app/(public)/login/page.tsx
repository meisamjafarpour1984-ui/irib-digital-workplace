'use client'

import { useState } from 'react'
import { PortalLogo } from '@/components/portal/portal-logo'
import { User, KeyRound, LogIn, Shield, Eye, EyeOff, RefreshCw } from 'lucide-react'

type Step = 'credentials' | 'otp' | 'success'

export default function LoginPage() {
  const [step, setStep] = useState<Step>('credentials')
  const [personnelCode, setPersonnelCode] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const handleLogin = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep('otp')
      setCountdown(120)
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }, 1500)
  }

  const verifyOTP = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep('success')
      window.location.href = '/dashboard'
    }, 1000)
  }

  const handleOTPInput = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
    if (newOtp.every((v) => v) && index === 5) {
      verifyOTP()
    }
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <PortalLogo />
          </div>

          {/* Credentials Step */}
          {step === 'credentials' && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-6 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand/10">
                  <Shield className="size-7 text-brand" aria-hidden />
                </div>
                <h1 className="mt-3 text-heading-1 text-foreground">ورود به پرتال</h1>
                <p className="mt-1 text-sm text-muted-foreground">اطلاعات خود را وارد کنید</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    کد پرسنلی
                  </label>
                  <div className="relative">
                    <User
                      className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden
                    />
                    <input
                      type="text"
                      value={personnelCode}
                      onChange={(e) => setPersonnelCode(e.target.value)}
                      placeholder="کد پرسنلی خود را وارد کنید"
                      className="h-11 w-full rounded-xl border border-input bg-background pe-9 ps-3 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    رمز عبور
                  </label>
                  <div className="relative">
                    <KeyRound
                      className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="رمز عبور"
                      className="h-11 w-full rounded-xl border border-input bg-background pe-9 ps-9 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? 'پنهان کردن رمز' : 'نمایش رمز'}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={!personnelCode || !password || loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <LogIn className="size-4" aria-hidden />
                  )}
                  ورود
                </button>
                <div className="flex items-center justify-between text-xs">
                  <a href="#" className="text-brand hover:underline">
                    فراموشی رمز عبور
                  </a>
                  <a href="/mobile/register" className="text-brand hover:underline">
                    ثبت‌نام جدید
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-6 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand/10">
                  <Shield className="size-7 text-brand" aria-hidden />
                </div>
                <h1 className="mt-3 text-heading-1 text-foreground">کد تأیید</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  کد ۶ رقمی ارسال شده را وارد کنید
                </p>
              </div>

              <div className="flex justify-center gap-2" dir="ltr">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOTPInput(i, e.target.value)}
                    className="size-12 rounded-xl border border-input bg-background text-center text-lg font-bold text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                ))}
              </div>

              <div className="mt-6 text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    ارسال مجدد تا{' '}
                    <span className="font-bold text-foreground tabular-nums">
                      {formatTime(countdown)}
                    </span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleLogin}
                    className="text-sm font-medium text-brand hover:underline"
                  >
                    ارسال مجدد کد
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="mt-4 flex w-full items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                بازگشت
              </button>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/10">
                <LogIn className="size-8 text-success" aria-hidden />
              </div>
              <h1 className="mt-4 text-heading-1 text-foreground">ورود موفق</h1>
              <p className="mt-2 text-sm text-muted-foreground">در حال انتقال به داشبورد...</p>
            </div>
          )}

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            صدا و سیمای مرکز آذربایجان شرقی © ۱۴۰۴
          </p>
        </div>
      </div>
    </div>
  )
}
