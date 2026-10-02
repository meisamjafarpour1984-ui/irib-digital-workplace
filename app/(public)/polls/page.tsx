/**
 * IRIB Digital Workplace Platform - Poll and Survey System Page
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
  BarChart3,
  Plus,
  Search,
  Filter,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  MessageSquare,
  Calendar,
} from 'lucide-react'

export default function PollsPage() {
  const [activeTab, setActiveTab] = useState('active')
  const [searchQuery, setSearchQuery] = useState('')
  const [showPollModal, setShowPollModal] = useState(false)

  const tabs = [
    { id: 'active', label: 'فعال', count: 5 },
    { id: 'completed', label: 'تکمیل شده', count: 12 },
    { id: 'draft', label: 'پیش‌نویس', count: 3 },
  ]

  const polls = [
    {
      id: 1,
      title: 'رضایت‌سنجی از سیستم جدید',
      description: 'نظر شما درباره سیستم کار جدید چیست؟',
      type: 'poll',
      status: 'active',
      createdAt: '۱۴۰۳/۰۹/۱۵',
      expiresAt: '۱۴۰۳/۰۹/۳۰',
      totalVotes: 45,
      options: [
        { id: 1, text: 'بسیار خوب', votes: 25, percentage: 56 },
        { id: 2, text: 'خوب', votes: 15, percentage: 33 },
        { id: 3, text: 'متوسط', votes: 4, percentage: 9 },
        { id: 4, text: 'ضعیف', votes: 1, percentage: 2 },
      ],
      category: 'satisfaction',
    },
    {
      id: 2,
      title: 'انتخاب زمان جلسه هفتگی',
      description: 'کدام زمان برای جلسه هفتگی مناسب‌تر است؟',
      type: 'poll',
      status: 'active',
      createdAt: '۱۴۰۳/۰۹/۱۸',
      expiresAt: '۱۴۰۳/۰۹/۲۵',
      totalVotes: 32,
      options: [
        { id: 1, text: 'شنبه صبح', votes: 12, percentage: 38 },
        { id: 2, text: 'شنبه عصر', votes: 8, percentage: 25 },
        { id: 3, text: 'یک‌شنبه صبح', votes: 10, percentage: 31 },
        { id: 4, text: 'یک‌شنبه عصر', votes: 2, percentage: 6 },
      ],
      category: 'scheduling',
    },
    {
      id: 3,
      title: 'نظرسنجی آموزشی',
      description: 'ارزیابی دوره آموزشی امنیت اطلاعات',
      type: 'survey',
      status: 'completed',
      createdAt: '۱۴۰۳/۰۸/۲۰',
      expiresAt: '۱۴۰۳/۰۹/۰۱',
      totalVotes: 89,
      options: [
        { id: 1, text: 'بسیار مفید', votes: 45, percentage: 51 },
        { id: 2, text: 'مفید', votes: 30, percentage: 34 },
        { id: 3, text: 'کم‌ارزش', votes: 12, percentage: 13 },
        { id: 4, text: 'بی‌فایده', votes: 2, percentage: 2 },
      ],
      category: 'training',
    },
    {
      id: 4,
      title: 'پیشنهاد برای بهبود محیط کار',
      description: 'چه پیشنهادی برای بهبود محیط کار دارید؟',
      type: 'survey',
      status: 'active',
      createdAt: '۱۴۰۳/۰۹/۱۰',
      expiresAt: '۱۴۰۳/۱۰/۱۰',
      totalVotes: 67,
      options: [
        { id: 1, text: 'بهبود سیستم تهویه', votes: 28, percentage: 42 },
        { id: 2, text: 'افزایش فضای استراحت', votes: 22, percentage: 33 },
        { id: 3, text: 'بهبود نورپردازی', votes: 12, percentage: 18 },
        { id: 4, text: 'سایر', votes: 5, percentage: 7 },
      ],
      category: 'feedback',
    },
  ]

  const categoryStyles: Record<string, string> = {
    satisfaction: 'bg-blue/10 text-blue',
    scheduling: 'bg-purple/10 text-purple',
    training: 'bg-green/10 text-green',
    feedback: 'bg-orange/10 text-orange',
  }

  const categoryLabels: Record<string, string> = {
    satisfaction: 'رضایت‌سنجی',
    scheduling: 'زمان‌بندی',
    training: 'آموزشی',
    feedback: 'بازخورد',
  }

  const typeStyles: Record<string, string> = {
    poll: 'bg-brand/10 text-brand',
    survey: 'bg-info/10 text-info',
  }

  const typeLabels: Record<string, string> = {
    poll: 'رأی‌گیری',
    survey: 'نظرسنجی',
  }

  const statusStyles: Record<string, string> = {
    active: 'bg-success/10 text-success',
    completed: 'bg-muted text-muted-foreground',
    draft: 'bg-warning/10 text-warning',
  }

  const statusLabels: Record<string, string> = {
    active: 'فعال',
    completed: 'تکمیل شده',
    draft: 'پیش‌نویس',
  }

  const filteredPolls = polls.filter((poll) => {
    const matchesTab = activeTab === 'all' || poll.status === activeTab
    const matchesSearch =
      poll.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poll.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const votePoll = (pollId: number, optionId: number) => {
    console.warn('Voted for poll:', pollId, 'option:', optionId)
    // Handle voting logic
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">رأی‌گیری و نظرسنجی</h1>
              <p className="text-muted-foreground mt-1">مشارکت در رأی‌گیری‌ها و نظرسنجی‌ها</p>
            </div>
            <button
              onClick={() => setShowPollModal(true)}
              className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90"
            >
              <Plus className="size-4" />
              ایجاد جدید
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-brand/10 p-2">
                <BarChart3 className="size-5 text-brand" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">کل رأی‌گیری‌ها</p>
                <p className="text-lg font-bold text-foreground">۲۰</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2">
                <CheckCircle className="size-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">فعال</p>
                <p className="text-lg font-bold text-foreground">۵</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-info/10 p-2">
                <Users className="size-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">کل آراء</p>
                <p className="text-lg font-bold text-foreground">۲۳۳</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-warning/10 p-2">
                <TrendingUp className="size-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">نرخ مشارکت</p>
                <p className="text-lg font-bold text-foreground">۷۸٪</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="جستجو در رأی‌گیری‌ها..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-background pr-10 pl-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
            />
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted">
            <Filter className="size-4" />
            فیلتر
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-brand text-brand'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              <span className="rounded-full bg-accent px-2 py-0.5 text-xs">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Polls Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {filteredPolls.map((poll) => (
            <div
              key={poll.id}
              className="rounded-xl border border-border bg-card p-6 hover:border-brand/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-1 text-xs font-semibold ${typeStyles[poll.type]}`}
                  >
                    {typeLabels[poll.type]}
                  </span>
                  <span
                    className={`rounded px-2 py-1 text-xs font-semibold ${categoryStyles[poll.category]}`}
                  >
                    {categoryLabels[poll.category]}
                  </span>
                  <span
                    className={`rounded px-2 py-1 text-xs font-semibold ${statusStyles[poll.status]}`}
                  >
                    {statusLabels[poll.status]}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="size-3" />
                  <span>{poll.totalVotes} رأی</span>
                </div>
              </div>

              <h3 className="font-semibold text-foreground mb-2">{poll.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{poll.description}</p>

              {/* Options */}
              <div className="space-y-3 mb-4">
                {poll.options.map((option) => (
                  <div key={option.id} className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground">{option.text}</span>
                      <span className="text-sm text-muted-foreground">{option.percentage}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand transition-all"
                        style={{ width: `${option.percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                      <span>{option.votes} رأی</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Metadata */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    <span>ایجاد: {poll.createdAt}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="size-3" />
                    <span>پایان: {poll.expiresAt}</span>
                  </div>
                </div>
                {poll.status === 'active' && (
                  <button
                    onClick={() => votePoll(poll.id, poll.options[0].id)}
                    className="flex items-center gap-1 text-brand hover:underline"
                  >
                    <MessageSquare className="size-3" />
                    مشارکت
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredPolls.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="mx-auto size-12 text-muted-foreground/40" />
            <p className="mt-4 text-sm text-muted-foreground">رأی‌گیری‌ای یافت نشد</p>
          </div>
        )}
      </main>

      {/* Create Poll Modal */}
      {showPollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">ایجاد رأی‌گیری/نظرسنجی جدید</h2>
              <button
                onClick={() => setShowPollModal(false)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <XCircle className="size-5" />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">نوع</label>
                <select className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none">
                  <option value="poll">رأی‌گیری</option>
                  <option value="survey">نظرسنجی</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">عنوان</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
                  placeholder="عنوان رأی‌گیری"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">توضیحات</label>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
                  placeholder="توضیحات رأی‌گیری"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">گزینه‌ها</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
                    placeholder="گزینه ۱"
                  />
                  <input
                    type="text"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
                    placeholder="گزینه ۲"
                  />
                  <input
                    type="text"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
                    placeholder="گزینه ۳"
                  />
                  <button
                    type="button"
                    className="flex items-center gap-2 text-sm text-brand hover:underline"
                  >
                    <Plus className="size-4" />
                    افزودن گزینه
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    تاریخ شروع
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    تاریخ پایان
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">دسته‌بندی</label>
                <select className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none">
                  <option value="satisfaction">رضایت‌سنجی</option>
                  <option value="scheduling">زمان‌بندی</option>
                  <option value="training">آموزشی</option>
                  <option value="feedback">بازخورد</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90"
                >
                  ذخیره
                </button>
                <button
                  type="button"
                  onClick={() => setShowPollModal(false)}
                  className="flex-1 rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
