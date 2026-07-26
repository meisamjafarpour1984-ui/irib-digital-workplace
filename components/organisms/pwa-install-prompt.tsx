'use client'

import { useState, useEffect } from 'react'
import { X, Download, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show prompt after 30 seconds if not dismissed
      const timer = setTimeout(() => {
        if (!localStorage.getItem('pwa-install-dismissed')) {
          setShowPrompt(true)
        }
      }, 30000)
      return () => clearTimeout(timer)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowPrompt(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  if (!showPrompt || dismissed || !deferredPrompt) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 lg:hidden">
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand/10">
            <Smartphone className="size-6 text-brand" aria-hidden />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-foreground">نصب پرتال IRIB</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              پرتال را روی گوشی خود نصب کنید تا دسترسی سریع‌تری داشته باشید
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleInstall}
                className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-brand-hover"
              >
                <Download className="size-3.5" aria-hidden />
                نصب
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
              >
                بعداً
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
            aria-label="بستن"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
