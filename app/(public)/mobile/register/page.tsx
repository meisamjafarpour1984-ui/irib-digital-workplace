'use client'

import { useState } from 'react'
import { Container } from '@/components/layout/container'
import { Section } from '@/components/layout/section'
import { PortalLogo } from '@/components/portal/portal-logo'
import { Shield, Smartphone, KeyRound, CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { authApi } from '@/lib/services/auth'
import { useAuthStore } from '@/lib/stores/auth-store'

type Step = 'register' | 'otp' | 'pin' | 'success'

export default function MobileRegisterPage() {
  const setSession = useAuthStore((state) => state.setSession)
  const [step, setStep] = useState<Step>('register')
  const [personnelCode, setPersonnelCode] = useState('')
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [pin, setPin] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [challengeId, setChallengeId] = useState('')
  const [error, setError] = useState('')

  const startCountdown = () => {
    setCountdown(120)
    const timer = window.setInterval(() => {
      setCountdown((previous) => {
        if (previous <= 1) {
          window.clearInterval(timer)
          return 0
        }
        return previous - 1
      })
    }, 1000)
  }

  const sendOTP = async () => {
    setLoading(true)
    setError('')
    try {
      const challenge = await authApi.register({ personnelCode, mobile })
      setChallengeId(challenge.challengeId)
      setStep('otp')
      startCountdown()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'ثبت‌نام ناموفق بود')
    } finally {
      setLoading(false)
    }
  }

  const verifyOTP = async (code: string) => {
    setLoading(true)
    setError('')
    try {
      const session = await authApi.verifyOtp({ challengeId, code })
      apiClient.setToken(session.accessToken)
      setSession(session.user, session.accessToken)
      setStep('pin')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'کد تأیید معتبر نیست')
      setOtp(['', '', '', '', '', ''])
    } finally {
      setLoading(false)
    }
  }

  const setPinValue = async (value: string) => {
    setLoading(true)
    setError('')
    try {
      await authApi.setPin(value)
      setStep('success')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'ثبت PIN ناموفق بود')
      setPin(['', '', '', '', '', ''])
    } finally {
      setLoading(false)
    }
  }

  const handleOTPInput = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    // Auto-focus next input
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`)
      next?.focus()
    }
    // Auto-submit when complete
    if (newOtp.every((v) => v) && index === 5) {
      void verifyOTP(newOtp.join(''))
    }
  }

  const handlePinInput = (index: number, value: string) => {
    if (value.length > 1) return
    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)
    if (value && index < 5) {
      const next = document.getElementById(`pin-${index + 1}`)
      next?.focus()
    }
    if (newPin.every((v) => v) && index === 5) {
      void setPinValue(newPin.join(''))
    }
  }

  const steps = [
    { id: 'register', label: 'ثبت‌نام' },
    { id: 'otp', label: 'تأیید کد' },
    { id: 'pin', label: 'تنظیم PIN' },
    { id: 'success', label: 'تکمیل' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Section>
        <Container>
          <div className="mx-auto max-w-md">
            {/* Logo */}
            <div className="mb-8 text-center">
              <PortalLogo />
            </div>

            {/* Progress Steps */}
            <div className="mb-8 flex items-center justify-center gap-2">
              {steps.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div
                    className={`flex size-8 items-center justify-center rounded-full text-xs font-bold ${
                      steps.findIndex((x) => x.id === step) >= i
                        ? 'bg-brand text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {steps.findIndex((x) => x.id === step) > i ? (
                      <CheckCircle className="size-4" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`h-0.5 w-8 ${
                        steps.findIndex((x) => x.id === step) > i ? 'bg-brand' : 'bg-border'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Register Step */}
            {step === 'register' && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-6 text-center">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand/10">
                    <Smartphone className="size-7 text-brand" aria-hidden />
                  </div>
                  <h1 className="mt-3 text-heading-1 text-foreground">ثبت‌نام در پرتال</h1>
                  <p className="mt-1 text-sm text-muted-foreground">اطلاعات خود را وارد کنید</p>
                </div>

                <div className="space-y-4">
                  {error && (
                    <p role="alert" className="rounded-lg bg-error/10 p-3 text-sm text-error">
                      {error}
                    </p>
                  )}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      کد پرسنلی
                    </label>
                    <input
                      type="text"
                      value={personnelCode}
                      onChange={(e) => setPersonnelCode(e.target.value)}
                      placeholder="کد پرسنلی خود را وارد کنید"
                      className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      شماره موبایل
                    </label>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="09xxxxxxxxx"
                      className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                      dir="ltr"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => void sendOTP()}
                    disabled={!personnelCode || !mobile || loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover disabled:opacity-50"
                  >
                    {loading ? (
                      <RefreshCw className="size-4 animate-spin" aria-hidden />
                    ) : (
                      <Shield className="size-4" aria-hidden />
                    )}
                    ارسال کد تأیید
                  </button>
                </div>
              </div>
            )}

            {/* OTP Step */}
            {step === 'otp' && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                {error && (
                  <p role="alert" className="mb-4 rounded-lg bg-error/10 p-3 text-sm text-error">
                    {error}
                  </p>
                )}
                <div className="mb-6 text-center">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand/10">
                    <KeyRound className="size-7 text-brand" aria-hidden />
                  </div>
                  <h1 className="mt-3 text-heading-1 text-foreground">کد تأیید</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    کد ۶ رقمی ارسال شده به <span className="font-bold">{mobile}</span> را وارد کنید
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
                      ارسال مجدد کد تا{' '}
                      <span className="font-bold text-foreground tabular-nums">{countdown}</span>{' '}
                      ثانیه
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void sendOTP()}
                      className="text-sm font-medium text-brand hover:underline"
                    >
                      ارسال مجدد کد
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setStep('register')}
                  className="mt-4 flex w-full items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="size-4" aria-hidden />
                  بازگشت
                </button>
              </div>
            )}

            {/* PIN Step */}
            {step === 'pin' && (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                {error && (
                  <p role="alert" className="mb-4 rounded-lg bg-error/10 p-3 text-sm text-error">
                    {error}
                  </p>
                )}
                <div className="mb-6 text-center">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand/10">
                    <Shield className="size-7 text-brand" aria-hidden />
                  </div>
                  <h1 className="mt-3 text-heading-1 text-foreground">تنظیم PIN</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    یک کد ۶ رقمی برای ورود سریع انتخاب کنید
                  </p>
                </div>

                <div className="flex justify-center gap-2" dir="ltr">
                  {pin.map((digit, i) => (
                    <input
                      key={i}
                      id={`pin-${i}`}
                      type="password"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinInput(i, e.target.value)}
                      className="size-12 rounded-xl border border-input bg-background text-center text-lg font-bold text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                  ))}
                </div>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                  از این کد برای ورود سریع در دفعات بعدی استفاده خواهید کرد
                </p>
              </div>
            )}

            {/* Success Step */}
            {step === 'success' && (
              <div className="rounded-2xl border border-border bg-card p-8 shadow-sm text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle className="size-8 text-success" aria-hidden />
                </div>
                <h1 className="mt-4 text-heading-1 text-foreground">ثبت‌نام با موفقیت انجام شد</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  حساب شما با موفقیت ایجاد شد. اکنون می‌توانید وارد شوید.
                </p>
                <a
                  href="/"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover"
                >
                  رفتن به صفحه اصلی
                  <ArrowLeft className="size-4" aria-hidden />
                </a>
              </div>
            )}
          </div>
        </Container>
      </Section>
    </div>
  )
}
