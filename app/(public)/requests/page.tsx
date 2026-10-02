/**
 * IRIB Digital Workplace Platform - Online Request Submission Page
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

'use client'

import { useState } from 'react'
import {
  FileText,
  Send,
  Search,
  Filter,
  Calendar,
  User,
  Phone,
  Mail,
  FileUp,
  XCircle,
} from 'lucide-react'

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState('submit')
  const [requestType, setRequestType] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    description: '',
    priority: 'normal',
    attachments: [] as File[],
  })

  const [myRequests] = useState([
    {
      id: 1,
      type: 'تعمیرات',
      subject: 'درخواست تعمیر سیستم کامپیوتر',
      status: 'pending',
      submittedAt: '۱۴۰۳/۰۹/۱۵',
      priority: 'high',
    },
    {
      id: 2,
      type: 'دسترسی',
      subject: 'درخواست دسترسی به سیستم',
      status: 'approved',
      submittedAt: '۱۴۰۳/۰۹/۱۰',
      priority: 'normal',
    },
    {
      id: 3,
      type: 'مرخصی',
      subject: 'درخواست مرخصی استعلاجی',
      status: 'rejected',
      submittedAt: '۱۴۰۳/۰۹/۰۵',
      priority: 'normal',
    },
  ])

  const requestTypes = [
    { id: 'repair', name: 'تعمیرات', icon: '🔧', description: 'درخواست تعمیر تجهیزات' },
    { id: 'access', name: 'دسترسی', icon: '🔑', description: 'درخواست دسترسی به سیستم‌ها' },
    { id: 'leave', name: 'مرخصی', icon: '📅', description: 'درخواست مرخصی' },
    { id: 'purchase', name: 'خرید', icon: '🛒', description: 'درخواست خرید تجهیزات' },
    { id: 'support', name: 'پشتیبانی', icon: '💬', description: 'درخواست پشتیبانی فنی' },
    { id: 'other', name: 'سایر', icon: '📝', description: 'سایر درخواست‌ها' },
  ]

  const statusStyles: Record<string, string> = {
    pending: 'bg-warning/10 text-warning',
    approved: 'bg-success/10 text-success',
    rejected: 'bg-error/10 text-error',
    in_progress: 'bg-blue/10 text-blue',
  }

  const statusLabels: Record<string, string> = {
    pending: 'در انتظار',
    approved: 'تأیید شده',
    rejected: 'رد شده',
    in_progress: 'در حال بررسی',
  }

  const priorityStyles: Record<string, string> = {
    high: 'bg-error/10 text-error',
    normal: 'bg-muted text-muted-foreground',
    low: 'bg-success/10 text-success',
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData({ ...formData, attachments: [...formData.attachments, ...files] })
  }

  const removeAttachment = (index: number) => {
    setFormData({
      ...formData,
      attachments: formData.attachments.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.warn('Form submitted:', formData)
    alert('درخواست شما با موفقیت ثبت شد')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-foreground">ثبت درخواست آنلاین</h1>
          <p className="text-muted-foreground mt-1">ارسال درخواست‌های خود به صورت آنلاین</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="container mx-auto px-4 mt-6">
        <div className="flex gap-1 border-b border-border">
          <button
            onClick={() => setActiveTab('submit')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'submit'
                ? 'border-b-2 border-brand text-brand'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Send className="size-4" />
            ثبت درخواست جدید
          </button>
          <button
            onClick={() => setActiveTab('my-requests')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'my-requests'
                ? 'border-b-2 border-brand text-brand'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="size-4" />
            درخواست‌های من
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'submit' && (
          <div className="max-w-4xl mx-auto">
            {!requestType ? (
              /* Request Type Selection */
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  نوع درخواست را انتخاب کنید
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {requestTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setRequestType(type.id)}
                      className="p-6 rounded-xl border border-border bg-card hover:border-brand/50 hover:shadow-lg transition-all text-right"
                    >
                      <div className="text-4xl mb-3">{type.icon}</div>
                      <h3 className="font-semibold text-foreground mb-1">{type.name}</h3>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Request Form */
              <div>
                <button
                  onClick={() => setRequestType('')}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                  <XCircle className="size-4" />
                  بازگشت به انتخاب نوع
                </button>

                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-6">
                    ثبت درخواست {requestTypes.find((t) => t.id === requestType)?.name}
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          <User className="inline size-4 ml-1" />
                          نام و نام خانوادگی
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
                          placeholder="نام کامل خود را وارد کنید"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          <Mail className="inline size-4 ml-1" />
                          ایمیل
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
                          placeholder="example@irib.ir"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        <Phone className="inline size-4 ml-1" />
                        شماره تماس
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
                        placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        موضوع
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
                        placeholder="موضوع درخواست را وارد کنید"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        شرح درخواست
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
                        placeholder="توضیحات کامل درخواست خود را بنویسید..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        اولویت
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
                      >
                        <option value="low">کم‌اهمیت</option>
                        <option value="normal">عادی</option>
                        <option value="high">فوری</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        <FileUp className="inline size-4 ml-1" />
                        پیوست‌ها
                      </label>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-brand/50 transition-colors">
                        <input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer flex flex-col items-center"
                        >
                          <FileUp className="size-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            فایل‌ها را اینجا بکشید و رها کنید
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            یا کلیک کنید برای انتخاب
                          </p>
                        </label>
                      </div>
                      {formData.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {formData.attachments.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 rounded-lg bg-muted"
                            >
                              <span className="text-sm text-foreground">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => removeAttachment(index)}
                                className="text-muted-foreground hover:text-error"
                              >
                                <XCircle className="size-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-brand/90"
                      >
                        <Send className="size-4" />
                        ثبت درخواست
                      </button>
                      <button
                        type="button"
                        onClick={() => setRequestType('')}
                        className="flex-1 rounded-lg border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        انصراف
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'my-requests' && (
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">درخواست‌های من</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute right-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="جستجو..."
                    className="rounded-lg border border-border bg-background pr-8 pl-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
                  />
                </div>
                <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground">
                  <Filter className="size-4" />
                  فیلتر
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {myRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-xl border border-border bg-card p-6 hover:border-brand/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`rounded px-2 py-1 text-xs font-semibold ${statusStyles[request.status]}`}
                        >
                          {statusLabels[request.status]}
                        </span>
                        <span
                          className={`rounded px-2 py-1 text-xs font-semibold ${priorityStyles[request.priority]}`}
                        >
                          {request.priority === 'high' ? 'فوری' : 'عادی'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">{request.subject}</h3>
                      <p className="text-sm text-muted-foreground">نوع: {request.type}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          <span>{request.submittedAt}</span>
                        </div>
                      </div>
                    </div>
                    <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                      <FileText className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
