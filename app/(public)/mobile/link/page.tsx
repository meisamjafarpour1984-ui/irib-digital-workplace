'use client'

import { useState, useEffect } from 'react'
import { Container } from '@/components/layout/container'
import { Section } from '@/components/layout/section'
import { PortalLogo } from '@/components/portal/portal-logo'
import { QrCode, Smartphone, CheckCircle, RefreshCw, Clock } from 'lucide-react'

export default function MobileLinkPage() {
  const [status, setStatus] = useState<'waiting' | 'scanned' | 'linked' | 'expired'>('waiting')
  const [countdown, setCountdown] = useState(120)

  useEffect(() => {
    if (status !== 'waiting') return
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setStatus('expired')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [status])

  // Simulate scanning
  useEffect(() => {
    if (status !== 'waiting') return
    const timer = setTimeout(() => {
      setStatus('scanned')
      setTimeout(() => setStatus('linked'), 2000)
    }, 5000)
    return () => clearTimeout(timer)
  }, [status])

  const handleRetry = () => {
    setStatus('waiting')
    setCountdown(120)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-background">
      <Section>
        <Container>
          <div className="mx-auto max-w-md text-center">
            {/* Logo */}
            <div className="mb-8">
              <PortalLogo />
            </div>

            {/* Status */}
            {status === 'waiting' && (
              <>
                <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl border-2 border-dashed border-brand/30 bg-brand/5">
                  <QrCode className="size-10 text-brand" aria-hidden />
                </div>
                <h1 className="text-heading-1 text-foreground">اسکن کد QR</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  کد QR نمایش داده شده در دسکتاپ را با دوربین گوشی اسکن کنید
                </p>
                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="size-4" aria-hidden />
                  <span>
                    منقضی شدن تا:{' '}
                    <span className="font-bold text-foreground tabular-nums">
                      {formatTime(countdown)}
                    </span>
                  </span>
                </div>
              </>
            )}

            {status === 'scanned' && (
              <>
                <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-warning/10">
                  <Smartphone className="size-10 text-warning animate-pulse" aria-hidden />
                </div>
                <h1 className="text-heading-1 text-foreground">کد اسکن شد</h1>
                <p className="mt-2 text-sm text-muted-foreground">در حال تأیید هویت...</p>
              </>
            )}

            {status === 'linked' && (
              <>
                <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle className="size-10 text-success" aria-hidden />
                </div>
                <h1 className="text-heading-1 text-foreground">اتصال برقرار شد</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  دسکتاپ شما با موفقیت متصل شد. اکنون می‌توانید وارد شوید.
                </p>
              </>
            )}

            {status === 'expired' && (
              <>
                <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-muted">
                  <QrCode className="size-10 text-muted-foreground" aria-hidden />
                </div>
                <h1 className="text-heading-1 text-foreground">کد منقضی شد</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  لطفاً کد جدیدی از دسکتاپ دریافت کنید
                </p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-brand-hover"
                >
                  <RefreshCw className="size-4" aria-hidden />
                  تلاش مجدد
                </button>
              </>
            )}
          </div>
        </Container>
      </Section>
    </div>
  )
}
