'use client'

import { useState } from 'react'
import { Container } from '@/components/layout/container'
import { Section } from '@/components/layout/section'
import { UtilityBar } from '@/components/portal/utility-bar'
import { PortalHeader } from '@/components/portal/portal-header'
import { PortalFooter } from '@/components/portal/portal-footer'
import { CheckCircle, ArrowLeft, ArrowRight, Printer, Upload } from 'lucide-react'

interface FormField {
  id: string
  type:
    'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'toggle' | 'file' | 'table'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  step?: number
}

interface FormData {
  title: string
  description: string
  fields: FormField[]
  mode: 'wizard' | 'single'
  steps?: { title: string; fieldIds: string[] }[]
}

// Sample form — in production fetched from API
const sampleForm: FormData = {
  title: 'فرم درخواست نرم‌افزار',
  description: 'لطفاً فرم زیر را با دقت تکمیل کنید.',
  mode: 'wizard',
  steps: [
    { title: 'اطلاعات شخصی', fieldIds: ['f1', 'f2', 'f3'] },
    { title: 'جزئیات درخواست', fieldIds: ['f4', 'f5', 'f6'] },
    { title: 'تأیید و ارسال', fieldIds: ['f7'] },
  ],
  fields: [
    {
      id: 'f1',
      type: 'text',
      label: 'نام و نام خانوادگی',
      placeholder: 'نام کامل',
      required: true,
    },
    { id: 'f2', type: 'text', label: 'کد پرسنلی', placeholder: 'مثال: ۱۲۳۴۵', required: true },
    {
      id: 'f3',
      type: 'select',
      label: 'واحد سازمانی',
      required: true,
      options: ['فناوری اطلاعات', 'تولید', 'اداری', 'پژوهش', 'روابط عمومی'],
    },
    {
      id: 'f4',
      type: 'select',
      label: 'نرم‌افزار مورد نیاز',
      required: true,
      options: ['آنتی‌ویروس', 'آفیس', 'اتوماسیون اداری', 'حسابداری', 'سایر'],
    },
    {
      id: 'f5',
      type: 'textarea',
      label: 'دلیل درخواست',
      placeholder: 'توضیح دهید چرا به این نرم‌افزار نیاز دارید...',
      required: true,
    },
    { id: 'f6', type: 'file', label: 'فایل پیوست', required: false },
    { id: 'f7', type: 'checkbox', label: 'تایید می‌کنم که اطلاعات فوق صحیح است', required: true },
  ],
}

export default function FormRendererPage({
  params: _params,
}: {
  params: Promise<{ slug: string }>
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [submitted, setSubmitted] = useState(false)

  const form = sampleForm
  const isWizard = form.mode === 'wizard' && form.steps
  const totalSteps = isWizard ? form.steps!.length : 1
  const currentStepFields = isWizard
    ? form.fields.filter((f) => form.steps![currentStep].fieldIds.includes(f.id))
    : form.fields

  const updateField = (id: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = () => {
    // In production: submit to API
    setSubmitted(true)
  }

  const canProceed = currentStepFields.filter((f) => f.required).every((f) => formData[f.id])

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <UtilityBar />
        <PortalHeader />
        <Section>
          <Container>
            <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="size-8 text-success" aria-hidden />
              </div>
              <h1 className="mt-4 text-heading-1 text-foreground">فرم با موفقیت ارسال شد</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                فرم شما ثبت شد و در انتظار بررسی است. نتیجه از طریق کارتابل ارتباطات اطلاع‌رسانی
                می‌شود.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false)
                  setFormData({})
                  setCurrentStep(0)
                }}
                className="mt-6 rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-brand-hover"
              >
                تکمیل فرم جدید
              </button>
            </div>
          </Container>
        </Section>
        <PortalFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <UtilityBar />
      <PortalHeader />
      <Section>
        <Container>
          <div className="mx-auto max-w-2xl">
            {/* Form Header */}
            <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h1 className="text-heading-1 text-foreground">{form.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{form.description}</p>
            </div>

            {/* Wizard Steps */}
            {isWizard && (
              <div className="mb-6 rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  {form.steps!.map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div
                        className={`flex size-8 items-center justify-center rounded-full text-sm font-bold ${
                          i < currentStep
                            ? 'bg-success text-white'
                            : i === currentStep
                              ? 'bg-brand text-white'
                              : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {i < currentStep ? <CheckCircle className="size-4" /> : i + 1}
                      </div>
                      <span
                        className={`text-sm ${
                          i === currentStep
                            ? 'font-semibold text-foreground'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {step.title}
                      </span>
                      {i < form.steps!.length - 1 && (
                        <div
                          className={`mx-2 h-px w-8 ${
                            i < currentStep ? 'bg-success' : 'bg-border'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="space-y-5">
                {currentStepFields.map((field) => (
                  <div key={field.id}>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      {field.label}
                      {field.required && <span className="mr-1 text-error">*</span>}
                    </label>
                    {field.type === 'text' && (
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        value={(formData[field.id] as string) || ''}
                        onChange={(e) => updateField(field.id, e.target.value)}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                      />
                    )}
                    {field.type === 'textarea' && (
                      <textarea
                        placeholder={field.placeholder}
                        rows={4}
                        value={(formData[field.id] as string) || ''}
                        onChange={(e) => updateField(field.id, e.target.value)}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                      />
                    )}
                    {field.type === 'number' && (
                      <input
                        type="number"
                        value={(formData[field.id] as number) || ''}
                        onChange={(e) => updateField(field.id, Number(e.target.value))}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                      />
                    )}
                    {field.type === 'date' && (
                      <input
                        type="date"
                        value={(formData[field.id] as string) || ''}
                        onChange={(e) => updateField(field.id, e.target.value)}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                      />
                    )}
                    {field.type === 'select' && (
                      <select
                        value={(formData[field.id] as string) || ''}
                        onChange={(e) => updateField(field.id, e.target.value)}
                        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                      >
                        <option value="">انتخاب کنید...</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}
                    {field.type === 'checkbox' && (
                      <label className="flex items-center gap-2 text-sm text-foreground">
                        <input
                          type="checkbox"
                          checked={(formData[field.id] as boolean) || false}
                          onChange={(e) => updateField(field.id, e.target.checked)}
                          className="size-4 rounded border-input text-brand focus:ring-brand/20"
                        />
                        {field.label}
                      </label>
                    )}
                    {field.type === 'toggle' && (
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={(formData[field.id] as boolean) || false}
                          onChange={(e) => updateField(field.id, e.target.checked)}
                          className="peer sr-only"
                        />
                        <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:start-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-brand peer-checked:after:translate-x-full peer-checked:after:border-white" />
                      </label>
                    )}
                    {field.type === 'file' && (
                      <div className="flex w-full items-center justify-center rounded-lg border-2 border-dashed border-border p-8">
                        <div className="text-center">
                          <Upload className="mx-auto size-8 text-muted-foreground/30" aria-hidden />
                          <p className="mt-2 text-sm text-muted-foreground">
                            فایل را اینجا رها کنید یا کلیک کنید
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground/60">حداکثر ۱۰ مگابایت</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
                <div>
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((s) => s - 1)}
                      className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                    >
                      <ArrowRight className="size-4" aria-hidden />
                      مرحله قبل
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    <Printer className="size-4" aria-hidden />
                    چاپ
                  </button>
                  {isWizard && currentStep < totalSteps - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((s) => s + 1)}
                      disabled={!canProceed}
                      className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-brand-hover disabled:opacity-50"
                    >
                      مرحله بعد
                      <ArrowLeft className="size-4" aria-hidden />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!canProceed}
                      className="flex items-center gap-2 rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-brand-hover disabled:opacity-50"
                    >
                      <CheckCircle className="size-4" aria-hidden />
                      ارسال فرم
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
      <PortalFooter />
    </div>
  )
}
