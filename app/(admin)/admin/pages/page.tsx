'use client'

import { useState } from 'react'
import { Container } from '@/components/layout/container'
import { Section } from '@/components/layout/section'
import { widgetRegistry } from '@/components/widgets/manifest'
import { Monitor, Tablet, Smartphone, Save, Eye, Undo2, Redo2 } from 'lucide-react'

type DevicePreview = 'desktop' | 'tablet' | 'mobile'

export default function PageBuilderPage() {
  const [device, setDevice] = useState<DevicePreview>('desktop')
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null)

  const widgets = widgetRegistry.getAll()
  const categories = [...new Set(widgets.map((w) => w.manifest.category))]

  const deviceWidths: Record<DevicePreview, string> = {
    desktop: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
  }

  return (
    <div className="min-h-screen bg-background">
      <Section>
        <Container>
          {/* Toolbar */}
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <h1 className="text-heading-1 text-foreground">سازنده صفحه</h1>
              <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand">
                ویرایش
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Device Preview */}
              <div className="flex items-center gap-1 rounded-lg border border-border p-1">
                <button
                  type="button"
                  onClick={() => setDevice('desktop')}
                  className={`flex size-8 items-center justify-center rounded-md transition-colors ${
                    device === 'desktop'
                      ? 'bg-brand text-white'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                  aria-label="دسکتاپ"
                >
                  <Monitor className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDevice('tablet')}
                  className={`flex size-8 items-center justify-center rounded-md transition-colors ${
                    device === 'tablet'
                      ? 'bg-brand text-white'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                  aria-label="تبلت"
                >
                  <Tablet className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDevice('mobile')}
                  className={`flex size-8 items-center justify-center rounded-md transition-colors ${
                    device === 'mobile'
                      ? 'bg-brand text-white'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                  aria-label="موبایل"
                >
                  <Smartphone className="size-4" />
                </button>
              </div>

              <div className="h-6 w-px bg-border" />

              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="بازگردانی"
              >
                <Undo2 className="size-4" />
              </button>
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="انجام مجدد"
              >
                <Redo2 className="size-4" />
              </button>

              <div className="h-6 w-px bg-border" />

              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                <Eye className="size-4" aria-hidden />
                پیش‌نمایش
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover"
              >
                <Save className="size-4" aria-hidden />
                ذخیره
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            {/* Widget Palette (Left) */}
            <div className="col-span-12 lg:col-span-3">
              <div className="sticky top-24 rounded-2xl border border-border bg-card p-4 shadow-sm">
                <h2 className="mb-3 text-heading-1 text-foreground">ویجت‌ها</h2>
                {categories.map((cat) => (
                  <div key={cat} className="mb-4">
                    <h3 className="mb-2 text-xs font-medium text-muted-foreground">{cat}</h3>
                    <ul className="space-y-1.5">
                      {widgets
                        .filter((w) => w.manifest.category === cat)
                        .map((w) => (
                          <li key={w.manifest.id}>
                            <button
                              type="button"
                              onClick={() => setSelectedWidget(w.manifest.id)}
                              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                                selectedWidget === w.manifest.id
                                  ? 'bg-brand/10 text-brand'
                                  : 'text-foreground hover:bg-muted'
                              }`}
                            >
                              <span className="size-2 rounded-full bg-brand" aria-hidden />
                              {w.manifest.name}
                            </button>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Canvas (Center) */}
            <div className="col-span-12 lg:col-span-6">
              <div className={`mx-auto ${deviceWidths[device]} transition-all duration-300`}>
                <div className="min-h-[600px] rounded-2xl border-2 border-dashed border-border bg-background p-4">
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <p className="text-body-lg text-muted-foreground">
                        ویجت‌ها را اینجا رها کنید
                      </p>
                      <p className="mt-1 text-caption text-muted-foreground">
                        یا از پنل سمت راست انتخاب کنید
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Config Panel (Right) */}
            <div className="col-span-12 lg:col-span-3">
              <div className="sticky top-24 rounded-2xl border border-border bg-card p-4 shadow-sm">
                <h2 className="mb-3 text-heading-1 text-foreground">تنظیمات ویجت</h2>
                {selectedWidget ? (
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        نام ویجت
                      </label>
                      <p className="text-sm font-semibold text-foreground">
                        {widgetRegistry.getManifest(selectedWidget)?.name}
                      </p>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        اندازه پیش‌فرض
                      </label>
                      <p className="text-sm text-foreground">
                        {widgetRegistry.getManifest(selectedWidget)?.defaultSize.cols} ستون ×{' '}
                        {widgetRegistry.getManifest(selectedWidget)?.defaultSize.rows} ردیف
                      </p>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        دسته‌بندی
                      </label>
                      <p className="text-sm text-foreground">
                        {widgetRegistry.getManifest(selectedWidget)?.category}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    یک ویجت را برای مشاهده تنظیمات انتخاب کنید
                  </p>
                )}
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  )
}
