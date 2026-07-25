'use client'

import { Container } from '@/components/layout/container'
import { Section } from '@/components/layout/section'
import { WifiOff, RefreshCw } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background">
      <Section>
        <Container>
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-muted">
                <WifiOff className="size-10 text-muted-foreground" aria-hidden />
              </div>
              <h1 className="mt-6 text-display-lg text-foreground">ارتباط برقرار نیست</h1>
              <p className="mt-3 max-w-md text-body-lg text-muted-foreground">
                شما در حال حاضر به اینترنت متصل نیستید. لطفاً اتصال خود را بررسی کنید و مجدداً تلاش کنید.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover"
              >
                <RefreshCw className="size-4" aria-hidden />
                تلاش مجدد
              </button>
              <p className="mt-4 text-xs text-muted-foreground/60">
                محتوای کش شده ممکن است در دسترس باشد
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  )
}
