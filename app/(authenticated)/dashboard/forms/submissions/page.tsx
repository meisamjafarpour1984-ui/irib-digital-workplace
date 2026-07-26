'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, ClipboardList, Clock, Inbox, Loader2, Search } from 'lucide-react'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardTopbar } from '@/components/dashboard/dashboard-topbar'
import { formsApi, formText, type FormDefinition, type FormSubmission } from '@/lib/services/forms'

const statusOptions = [
  { value: 'all', label: 'همه' },
  { value: 'DRAFT', label: 'پیش‌نویس' },
  { value: 'SUBMITTED', label: 'ارسال‌شده' },
  { value: 'UNDER_REVIEW', label: 'در حال بررسی' },
  { value: 'APPROVED', label: 'تأییدشده' },
  { value: 'REJECTED', label: 'ردشده' },
  { value: 'ARCHIVED', label: 'بایگانی‌شده' },
] as const

const statusConfig: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'پیش‌نویس', color: 'bg-muted text-muted-foreground' },
  SUBMITTED: { label: 'ارسال‌شده', color: 'bg-info/10 text-info' },
  UNDER_REVIEW: { label: 'در حال بررسی', color: 'bg-warning/10 text-warning' },
  APPROVED: { label: 'تأییدشده', color: 'bg-success/10 text-success' },
  REJECTED: { label: 'ردشده', color: 'bg-error/10 text-error' },
  ARCHIVED: { label: 'بایگانی‌شده', color: 'bg-muted text-muted-foreground' },
}

const dateFormatter = new Intl.DateTimeFormat('fa-IR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

const getErrorMessage = (caught: unknown, fallback: string) =>
  caught instanceof Error ? caught.message : fallback

const searchableData = (data: Record<string, unknown>) =>
  Object.values(data)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter((value) => ['string', 'number', 'boolean'].includes(typeof value))
    .join(' ')

const summarizeData = (data: Record<string, unknown>) => {
  const values = Object.values(data)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter((value): value is string | number | boolean =>
      ['string', 'number', 'boolean'].includes(typeof value)
    )
    .map(String)
    .filter(Boolean)

  return values.slice(0, 3).join('، ') || 'بدون دادهٔ نمایشی'
}

export default function FormSubmissionsPage() {
  const [forms, setForms] = useState<FormDefinition[]>([])
  const [selectedFormId, setSelectedFormId] = useState('')
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formsLoading, setFormsLoading] = useState(true)
  const [submissionsLoading, setSubmissionsLoading] = useState(false)
  const [formsError, setFormsError] = useState('')
  const [submissionsError, setSubmissionsError] = useState('')
  const [formsReloadKey, setFormsReloadKey] = useState(0)
  const [submissionsReloadKey, setSubmissionsReloadKey] = useState(0)

  useEffect(() => {
    let active = true

    const loadForms = async () => {
      setFormsLoading(true)
      setFormsError('')
      try {
        const result = await formsApi.list()
        if (!active) return
        setForms(result)
        setSelectedFormId((current) =>
          result.some((form) => form.id === current) ? current : (result[0]?.id ?? '')
        )
      } catch (caught) {
        if (!active) return
        setForms([])
        setSelectedFormId('')
        setFormsError(getErrorMessage(caught, 'دریافت فهرست فرم‌ها انجام نشد.'))
      } finally {
        if (active) setFormsLoading(false)
      }
    }

    void loadForms()
    return () => {
      active = false
    }
  }, [formsReloadKey])

  useEffect(() => {
    if (!selectedFormId) {
      setSubmissions([])
      setSubmissionsError('')
      setSubmissionsLoading(false)
      return
    }

    let active = true

    const loadSubmissions = async () => {
      setSubmissionsLoading(true)
      setSubmissionsError('')
      setSubmissions([])
      try {
        const result = await formsApi.listSubmissions(selectedFormId)
        if (active) setSubmissions(result)
      } catch (caught) {
        if (!active) return
        setSubmissionsError(getErrorMessage(caught, 'دریافت ارسال‌های فرم انجام نشد.'))
      } finally {
        if (active) setSubmissionsLoading(false)
      }
    }

    void loadSubmissions()
    return () => {
      active = false
    }
  }, [selectedFormId, submissionsReloadKey])

  const selectedForm = forms.find((form) => form.id === selectedFormId)

  const filteredSubmissions = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('fa')

    return submissions.filter((submission) => {
      const status = statusConfig[submission.status]?.label ?? submission.status
      const matchesStatus = statusFilter === 'all' || submission.status === statusFilter
      const matchesSearch =
        !query ||
        [
          formText(submission.submitter.name),
          formText(submission.formDefinition.title),
          status,
          searchableData(submission.data),
        ].some((value) => value.toLocaleLowerCase('fa').includes(query))

      return matchesStatus && matchesSearch
    })
  }, [searchTerm, statusFilter, submissions])

  const handleFormChange = useCallback((formId: string) => {
    setSelectedFormId(formId)
    setSearchTerm('')
    setStatusFilter('all')
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-6xl space-y-6">
            <div>
              <h1 className="text-heading-1 text-foreground">ارسال‌های فرم</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                فرم موردنظر را انتخاب کنید و ارسال‌های ثبت‌شده را بررسی کنید.
              </p>
            </div>

            {formsError ? (
              <div
                className="rounded-2xl border border-error/20 bg-error/5 p-6 text-center"
                role="alert"
              >
                <AlertCircle className="mx-auto size-8 text-error" aria-hidden />
                <p className="mt-3 text-sm font-medium text-error">{formsError}</p>
                <button
                  type="button"
                  onClick={() => setFormsReloadKey((key) => key + 1)}
                  className="mt-4 rounded-lg border border-error/30 px-4 py-2 text-sm font-medium text-error hover:bg-error/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error/30"
                >
                  تلاش دوباره
                </button>
              </div>
            ) : formsLoading ? (
              <div
                className="flex min-h-40 items-center justify-center rounded-2xl border border-border bg-card"
                role="status"
              >
                <Loader2 className="size-6 animate-spin text-brand" aria-hidden />
                <span className="mr-2 text-sm text-muted-foreground">در حال دریافت فرم‌ها...</span>
              </div>
            ) : forms.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-10 text-center">
                <ClipboardList className="mx-auto size-10 text-muted-foreground/40" aria-hidden />
                <h2 className="mt-3 text-sm font-semibold text-foreground">
                  هنوز فرمی ایجاد نشده است
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  پس از ایجاد فرم، ارسال‌های آن در این صفحه نمایش داده می‌شوند.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <label
                    htmlFor="form-select"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    انتخاب فرم
                  </label>
                  <select
                    id="form-select"
                    value={selectedFormId}
                    onChange={(event) => handleFormChange(event.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  >
                    {forms.map((form) => (
                      <option key={form.id} value={form.id}>
                        {formText(form.title) || 'فرم بدون عنوان'}
                        {form._count ? ` (${form._count.submissions} ارسال)` : ''}
                      </option>
                    ))}
                  </select>
                  {selectedForm?.description && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formText(selectedForm.description)}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative min-w-60 flex-1">
                    <Search
                      className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden
                    />
                    <input
                      type="search"
                      placeholder="جستجو در نام ارسال‌کننده و داده‌های فرم..."
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      className="w-full rounded-xl border border-input bg-card py-2.5 pr-10 pl-3 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                      aria-label="جستجو در ارسال‌ها"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="rounded-xl border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    aria-label="فیلتر وضعیت"
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                {submissionsError ? (
                  <div
                    className="rounded-2xl border border-error/20 bg-error/5 p-6 text-center"
                    role="alert"
                  >
                    <AlertCircle className="mx-auto size-8 text-error" aria-hidden />
                    <p className="mt-3 text-sm font-medium text-error">{submissionsError}</p>
                    <button
                      type="button"
                      onClick={() => setSubmissionsReloadKey((key) => key + 1)}
                      className="mt-4 rounded-lg border border-error/30 px-4 py-2 text-sm font-medium text-error hover:bg-error/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error/30"
                    >
                      تلاش دوباره
                    </button>
                  </div>
                ) : submissionsLoading ? (
                  <div
                    className="flex min-h-56 items-center justify-center rounded-2xl border border-border bg-card"
                    role="status"
                  >
                    <Loader2 className="size-6 animate-spin text-brand" aria-hidden />
                    <span className="mr-2 text-sm text-muted-foreground">
                      در حال دریافت ارسال‌ها...
                    </span>
                  </div>
                ) : filteredSubmissions.length === 0 ? (
                  <div className="rounded-2xl border border-border bg-card p-10 text-center">
                    <Inbox className="mx-auto size-10 text-muted-foreground/40" aria-hidden />
                    <h2 className="mt-3 text-sm font-semibold text-foreground">
                      {submissions.length === 0
                        ? 'هنوز ارسالی ثبت نشده است'
                        : 'ارسالی با این فیلتر پیدا نشد'}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {submissions.length === 0
                        ? 'ارسال‌های جدید این فرم پس از ثبت در اینجا نمایش داده می‌شوند.'
                        : 'عبارت جستجو یا وضعیت انتخاب‌شده را تغییر دهید.'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                      <p className="text-sm font-medium text-foreground">
                        {filteredSubmissions.length.toLocaleString('fa-IR')} ارسال
                      </p>
                      {filteredSubmissions.length !== submissions.length && (
                        <p className="text-xs text-muted-foreground">
                          از {submissions.length.toLocaleString('fa-IR')} مورد
                        </p>
                      )}
                    </div>
                    <table className="w-full min-w-2xl text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="p-3 text-right text-xs font-medium text-muted-foreground">
                            ارسال‌کننده
                          </th>
                          <th className="p-3 text-right text-xs font-medium text-muted-foreground">
                            خلاصه پاسخ
                          </th>
                          <th className="p-3 text-right text-xs font-medium text-muted-foreground">
                            وضعیت
                          </th>
                          <th className="p-3 text-right text-xs font-medium text-muted-foreground">
                            زمان ثبت
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSubmissions.map((submission) => {
                          const status = statusConfig[submission.status] ?? {
                            label: submission.status,
                            color: 'bg-muted text-muted-foreground',
                          }
                          const timestamp = submission.submittedAt ?? submission.createdAt

                          return (
                            <tr
                              key={submission.id}
                              className="border-b border-border last:border-0 hover:bg-muted/30"
                            >
                              <td className="p-3 font-medium text-foreground">
                                {formText(submission.submitter.name) || 'کاربر بدون نام'}
                              </td>
                              <td
                                className="max-w-sm truncate p-3 text-xs text-muted-foreground"
                                title={summarizeData(submission.data)}
                              >
                                {summarizeData(submission.data)}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${status.color}`}
                                >
                                  <Clock className="size-3" aria-hidden />
                                  {status.label}
                                </span>
                              </td>
                              <td className="p-3 text-xs text-muted-foreground tabular-nums">
                                {dateFormatter.format(new Date(timestamp))}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
