'use client'

import { use, useCallback, useEffect, useState, type FormEvent } from 'react'
import { AlertCircle, CheckCircle, LoaderCircle, RotateCcw } from 'lucide-react'
import { Container } from '@/components/layout/container'
import { Section } from '@/components/layout/section'
import { PortalFooter } from '@/components/portal/portal-footer'
import { PortalHeader } from '@/components/portal/portal-header'
import { UtilityBar } from '@/components/portal/utility-bar'
import { formsApi, formText, type FormDefinition, type FormField } from '@/lib/services/forms'

const inputClassName =
  'w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-60'

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback

const hasRequiredValue = (field: FormField, value: unknown) => {
  if (field.type === 'checkbox' || field.type === 'toggle') return value === true
  if (field.type === 'number') return typeof value === 'number' && Number.isFinite(value)
  return typeof value === 'string' && value.trim().length > 0
}

export default function FormRendererPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [form, setForm] = useState<FormDefinition | null>(null)
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const loadForm = useCallback(async () => {
    setIsLoading(true)
    setLoadError('')

    try {
      const activeForm = await formsApi.getActive(slug)
      setForm(activeForm)
    } catch (error) {
      setForm(null)
      setLoadError(getErrorMessage(error, 'دریافت فرم با خطا روبه‌رو شد.'))
    } finally {
      setIsLoading(false)
    }
  }, [slug])

  useEffect(() => {
    void loadForm()
  }, [loadForm])

  const fields = form?.jsonSchema.fields ?? []

  const updateField = (id: string, value: unknown) => {
    setFormData((previous) => ({ ...previous, [id]: value }))
    setFieldErrors((previous) => {
      if (!previous[id]) return previous
      const next = { ...previous }
      delete next[id]
      return next
    })
    setSubmitError('')
  }

  const resetForm = () => {
    setFormData({})
    setFieldErrors({})
    setSubmitError('')
    setSubmitted(false)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validationErrors = fields.reduce<Record<string, string>>((errors, field) => {
      if (field.required && !hasRequiredValue(field, formData[field.id])) {
        errors[field.id] = 'تکمیل این فیلد الزامی است.'
      }
      return errors
    }, {})

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors)
      setSubmitError('لطفاً فیلدهای الزامی مشخص‌شده را تکمیل کنید.')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      await formsApi.submit(slug, formData)
      setSubmitted(true)
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'ارسال فرم با خطا روبه‌رو شد. دوباره تلاش کنید.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    const value = formData[field.id]
    const error = fieldErrors[field.id]
    const errorId = `${field.id}-error`

    if (field.type === 'checkbox') {
      return (
        <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted/50">
          <input
            id={field.id}
            type="checkbox"
            checked={value === true}
            onChange={(event) => updateField(field.id, event.target.checked)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className="mt-0.5 size-4 shrink-0 rounded border-input text-brand focus:ring-brand/20"
          />
          <span>
            {field.label}
            {field.required && <span className="mr-1 text-error">*</span>}
          </span>
        </label>
      )
    }

    if (field.type === 'toggle') {
      return (
        <div className="flex min-h-11 items-center justify-between gap-4 rounded-lg border border-border bg-background px-3 py-2.5">
          <label htmlFor={field.id} className="cursor-pointer text-sm font-medium text-foreground">
            {field.label}
            {field.required && <span className="mr-1 text-error">*</span>}
          </label>
          <button
            id={field.id}
            type="button"
            role="switch"
            aria-checked={value === true}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            onClick={() => updateField(field.id, value !== true)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${
              value === true ? 'bg-brand' : 'bg-muted-foreground/30'
            }`}
          >
            <span
              className={`absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform ${
                value === true ? 'start-0.5 -translate-x-5' : 'start-0.5'
              }`}
            />
          </button>
        </div>
      )
    }

    const commonProps = {
      id: field.id,
      'aria-invalid': Boolean(error),
      'aria-describedby': error ? errorId : undefined,
      className: `${inputClassName} ${error ? 'border-error focus:border-error focus:ring-error/20' : ''}`,
    }

    return (
      <>
        <label htmlFor={field.id} className="mb-1.5 block text-sm font-medium text-foreground">
          {field.label}
          {field.required && <span className="mr-1 text-error">*</span>}
        </label>
        {field.type === 'textarea' ? (
          <textarea
            {...commonProps}
            placeholder={field.placeholder}
            rows={4}
            value={typeof value === 'string' ? value : ''}
            onChange={(event) => updateField(field.id, event.target.value)}
          />
        ) : field.type === 'select' ? (
          <select
            {...commonProps}
            value={typeof value === 'string' ? value : ''}
            onChange={(event) => updateField(field.id, event.target.value)}
          >
            <option value="">انتخاب کنید...</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            {...commonProps}
            type={field.type}
            placeholder={field.placeholder}
            value={
              field.type === 'number'
                ? typeof value === 'number'
                  ? value
                  : ''
                : typeof value === 'string'
                  ? value
                  : ''
            }
            onChange={(event) =>
              updateField(
                field.id,
                field.type === 'number'
                  ? event.target.value === ''
                    ? undefined
                    : event.target.valueAsNumber
                  : event.target.value
              )
            }
          />
        )}
      </>
    )
  }

  const pageChrome = (content: React.ReactNode) => (
    <div className="min-h-screen bg-background">
      <UtilityBar />
      <PortalHeader />
      <Section>
        <Container>{content}</Container>
      </Section>
      <PortalFooter />
    </div>
  )

  if (isLoading) {
    return pageChrome(
      <div
        className="mx-auto flex max-w-2xl items-center justify-center rounded-2xl border border-border bg-card p-12 text-center shadow-sm"
        role="status"
      >
        <div>
          <LoaderCircle className="mx-auto size-8 animate-spin text-brand" aria-hidden />
          <p className="mt-3 text-sm text-muted-foreground">در حال دریافت فرم...</p>
        </div>
      </div>
    )
  }

  if (loadError || !form) {
    return pageChrome(
      <div
        className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm"
        role="alert"
      >
        <AlertCircle className="mx-auto size-10 text-error" aria-hidden />
        <h1 className="mt-4 text-heading-2 text-foreground">فرم در دسترس نیست</h1>
        <p className="mt-2 text-sm text-muted-foreground">{loadError || 'فرم موردنظر پیدا نشد.'}</p>
        <button
          type="button"
          onClick={() => void loadForm()}
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          <RotateCcw className="size-4" aria-hidden />
          تلاش دوباره
        </button>
      </div>
    )
  }

  if (fields.length === 0) {
    return pageChrome(
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <h1 className="text-heading-2 text-foreground">
          {formText(form.title) || 'فرم بدون عنوان'}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          هنوز فیلدی برای این فرم تعریف نشده است.
        </p>
      </div>
    )
  }

  if (submitted) {
    return pageChrome(
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/10">
          <CheckCircle className="size-8 text-success" aria-hidden />
        </div>
        <h1 className="mt-4 text-heading-1 text-foreground">فرم با موفقیت ارسال شد</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          پاسخ شما ثبت شد و برای بررسی در دسترس کارشناسان قرار گرفت.
        </p>
        <button
          type="button"
          onClick={resetForm}
          className="mt-6 min-h-11 rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          تکمیل دوباره فرم
        </button>
      </div>
    )
  }

  return pageChrome(
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-heading-1 text-foreground">
          {formText(form.title) || 'فرم بدون عنوان'}
        </h1>
        {formText(form.description) && (
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {formText(form.description)}
          </p>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        <div className="space-y-5">
          {fields.map((field) => {
            const error = fieldErrors[field.id]
            return (
              <div key={field.id}>
                {renderField(field)}
                {error && (
                  <p id={`${field.id}-error`} className="mt-1.5 text-xs font-medium text-error">
                    {error}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {submitError && (
          <div
            className="mt-6 flex items-start gap-2 rounded-lg border border-error/30 bg-error/5 p-3 text-sm text-error"
            role="alert"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>{submitError}</p>
          </div>
        )}

        <div className="mt-8 flex justify-end border-t border-border pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="size-4 animate-spin" aria-hidden />
                در حال ارسال...
              </>
            ) : (
              <>
                <CheckCircle className="size-4" aria-hidden />
                ارسال فرم
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
