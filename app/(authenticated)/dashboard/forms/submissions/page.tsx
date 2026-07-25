'use client'

import { useState } from 'react'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardTopbar } from '@/components/dashboard/dashboard-topbar'
import { Search, Eye, Check, X, Clock, Download } from 'lucide-react'

const submissions = [
  { id: 1, form: 'فرم درخواست نرم‌افزار', submitter: 'علی رضایی', department: 'فناوری اطلاعات', status: 'در حال بررسی', date: '۱۴۰۴/۰۳/۱۲', priority: 'متوسط' },
  { id: 2, form: 'نظرسنجی رضایت کارکنان', submitter: 'سارا موسوی', department: 'اداری و مالی', status: 'تأیید شده', date: '۱۴۰۴/۰۳/۱۱', priority: 'کم' },
  { id: 3, form: 'فرم درخواست مرخصی', submitter: 'رضا کریمی', department: 'فناوری اطلاعات', status: 'جدید', date: '۱۴۰۴/۰۳/۱۰', priority: 'بالا' },
  { id: 4, form: 'فرم گزارش خرابی', submitter: 'مریم حسنی', department: 'تولید', status: 'رد شده', date: '۱۴۰۴/۰۳/۰۹', priority: 'فوری' },
  { id: 5, form: 'فرم درخواست آموزش', submitter: 'محمد احمدی', department: 'روابط عمومی', status: 'بایگانی شده', date: '۱۴۰۴/۰۳/۰۸', priority: 'کم' },
]

const statusConfig: Record<string, { color: string; icon: typeof Clock }> = {
  'جدید': { color: 'bg-info/10 text-info', icon: Clock },
  'در حال بررسی': { color: 'bg-warning/10 text-warning', icon: Clock },
  'تأیید شده': { color: 'bg-success/10 text-success', icon: Check },
  'رد شده': { color: 'bg-error/10 text-error', icon: X },
  'بایگانی شده': { color: 'bg-muted text-muted-foreground', icon: Check },
}

const priorityConfig: Record<string, string> = {
  'کم': 'bg-muted text-muted-foreground',
  'متوسط': 'bg-info/10 text-info',
  'بالا': 'bg-warning/10 text-warning',
  'فوری': 'bg-error/10 text-error',
}

export default function FormSubmissionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = submissions.filter((s) => {
    const matchesSearch = s.form.includes(searchTerm) || s.submitter.includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-heading-1 text-foreground">ارسال‌های فرم</h1>
                <p className="text-sm text-muted-foreground">{submissions.length} ارسال ثبت شده</p>
              </div>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
              >
                <Download className="size-4" aria-hidden />
                خروجی CSV
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 md:min-w-72">
                <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <input
                  type="search"
                  placeholder="جستجو..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-input bg-card py-2.5 pr-10 pl-3 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  aria-label="جستجو"
                />
              </div>
              <div className="flex gap-1 rounded-xl border border-border bg-card p-1">
                {['all', 'جدید', 'در حال بررسی', 'تأیید شده', 'رد شده'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      statusFilter === status ? 'bg-brand text-white' : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {status === 'all' ? 'همه' : status}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-3 text-right text-xs font-medium text-muted-foreground">فرم</th>
                    <th className="p-3 text-right text-xs font-medium text-muted-foreground">ارسال‌کننده</th>
                    <th className="p-3 text-right text-xs font-medium text-muted-foreground">واحد</th>
                    <th className="p-3 text-right text-xs font-medium text-muted-foreground">وضعیت</th>
                    <th className="p-3 text-right text-xs font-medium text-muted-foreground">اولویت</th>
                    <th className="p-3 text-right text-xs font-medium text-muted-foreground">تاریخ</th>
                    <th className="p-3 text-center text-xs font-medium text-muted-foreground">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((sub) => {
                    const st = statusConfig[sub.status] || statusConfig['جدید']
                    return (
                      <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="p-3 font-medium text-foreground">{sub.form}</td>
                        <td className="p-3 text-xs text-muted-foreground">{sub.submitter}</td>
                        <td className="p-3 text-xs text-muted-foreground">{sub.department}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${st.color}`}>
                            <st.icon className="size-3" aria-hidden />
                            {sub.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${priorityConfig[sub.priority]}`}>
                            {sub.priority}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground tabular-nums">{sub.date}</td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1">
                            <button type="button" className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="مشاهده">
                              <Eye className="size-3.5" />
                            </button>
                            <button type="button" className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-success/10 hover:text-success" aria-label="تأیید">
                              <Check className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
