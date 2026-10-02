'use client'

import { Container } from '@/components/layout/container'
import { Section } from '@/components/layout/section'
import { PortalLogo } from '@/components/portal/portal-logo'
import { Smartphone, ArrowLeft, Shield, Zap, Bell } from 'lucide-react'

export default function MobileWelcomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Section>
        <Container>
          <div className="mx-auto max-w-md text-center">
            {/* Logo */}
            <div className="mb-8">
              <PortalLogo />
            </div>

            {/* Hero */}
            <div className="mb-8">
              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-brand/10">
                <Smartphone className="size-10 text-brand" aria-hidden />
              </div>
              <h1 className="mt-6 text-display-lg text-foreground">درگاه IRIB در موبایل</h1>
              <p className="mt-3 text-body-lg text-muted-foreground">
                دسترسی سریع و آسان به تمام سرویس‌های سازمانی از گوشی خود
              </p>
            </div>

            {/* Features */}
            <div className="mb-8 space-y-4">
              <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-right">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Zap className="size-5" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">ورود سریع با PIN</p>
                  <p className="text-xs text-muted-foreground">بدون نیاز به رمز عبور هر بار</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-right">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Bell className="size-5" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">اعلان‌های لحظه‌ای</p>
                  <p className="text-xs text-muted-foreground">از اخبار و تیکت‌ها باخبر شوید</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-right">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Shield className="size-5" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">امنیت بالا</p>
                  <p className="text-xs text-muted-foreground">احراز هویت بیومتریک و OTP</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-3">
              <a
                href="/mobile/register"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover"
              >
                ثبت‌نام و شروع
                <ArrowLeft className="size-4" aria-hidden />
              </a>
              <p className="text-xs text-muted-foreground">
                قبلاً ثبت‌نام کرده‌اید؟ از درگاه دسکتاپ وارد شوید
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  )
}
