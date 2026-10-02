/**
 * IRIB Digital Workplace Platform - Approval Workflow Dashboard Widget
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, User, Calendar, MoreVertical, Search } from 'lucide-react'

export default function ApprovalWorkflowWidget() {
  const [approvals, setApprovals] = useState([
    {
      id: 1,
      type: 'content',
      title: 'انتشار مطلب: گزارش ماهانه',
      requester: 'علی محمدی',
      department: 'دایره فناوری اطلاعات',
      submittedAt: '۱۴۰۳/۰۹/۱۵',
      priority: 'high',
      status: 'pending',
      currentStep: 'مدیر دایره',
      steps: [
        { name: 'کارشناس', status: 'completed', approver: 'سارا موسوی', approvedAt: '۱۴۰۳/۰۹/۱۵' },
        { name: 'مدیر دایره', status: 'in_progress', approver: null, approvedAt: null },
        { name: 'معاون فنی', status: 'pending', approver: null, approvedAt: null },
      ],
    },
    {
      id: 2,
      type: 'leave',
      title: 'درخواست مرخصی: سارا موسوی',
      requester: 'سارا موسوی',
      department: 'دایره شبکه',
      submittedAt: '۱۴۰۳/۰۹/۱۶',
      priority: 'medium',
      status: 'pending',
      currentStep: 'مدیر دایره',
      steps: [
        {
          name: 'ثبت درخواست',
          status: 'completed',
          approver: 'سارا موسوی',
          approvedAt: '۱۴۰۳/۰۹/۱۶',
        },
        { name: 'مدیر دایره', status: 'in_progress', approver: null, approvedAt: null },
        { name: 'مدیریت منابع انسانی', status: 'pending', approver: null, approvedAt: null },
      ],
    },
    {
      id: 3,
      type: 'purchase',
      title: 'درخواست خرید: تجهیزات شبکه',
      requester: 'رضا کریمی',
      department: 'دایره فناوری اطلاعات',
      submittedAt: '۱۴۰۳/۰۹/۱۴',
      priority: 'high',
      status: 'approved',
      currentStep: 'تکمیل شده',
      steps: [
        { name: 'کارشناس', status: 'completed', approver: 'علی رضایی', approvedAt: '۱۴۰۳/۰۹/۱۴' },
        {
          name: 'مدیر دایره',
          status: 'completed',
          approver: 'محمد احمدی',
          approvedAt: '۱۴۰۳/۰۹/۱۵',
        },
        { name: 'معاون فنی', status: 'completed', approver: 'مریم حسنی', approvedAt: '۱۴۰۳/۰۹/۱۶' },
      ],
    },
    {
      id: 4,
      type: 'expense',
      title: 'درخواست هزینه: سفر آموزشی',
      requester: 'زهرا محمدی',
      department: 'دایره تحلیل',
      submittedAt: '۱۴۰۳/۰۹/۱۳',
      priority: 'low',
      status: 'rejected',
      currentStep: 'رد شده',
      steps: [
        { name: 'کارشناس', status: 'completed', approver: 'زهرا محمدی', approvedAt: '۱۴۰۳/۰۹/۱۳' },
        { name: 'مدیر دایره', status: 'rejected', approver: 'حسین نوری', approvedAt: '۱۴۰۳/۰۹/۱۴' },
      ],
    },
  ])

  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const typeStyles: Record<string, string> = {
    content: 'bg-blue/10 text-blue',
    leave: 'bg-purple/10 text-purple',
    purchase: 'bg-green/10 text-green',
    expense: 'bg-orange/10 text-orange',
  }

  const typeLabels: Record<string, string> = {
    content: 'محتوا',
    leave: 'مرخصی',
    purchase: 'خرید',
    expense: 'هزینه',
  }

  const statusStyles: Record<string, string> = {
    pending: 'bg-warning/10 text-warning',
    approved: 'bg-success/10 text-success',
    rejected: 'bg-error/10 text-error',
  }

  const statusLabels: Record<string, string> = {
    pending: 'در انتظار',
    approved: 'تأیید شده',
    rejected: 'رد شده',
  }

  const priorityStyles: Record<string, string> = {
    high: 'bg-error/10 text-error',
    medium: 'bg-warning/10 text-warning',
    low: 'bg-success/10 text-success',
  }

  const filteredApprovals = approvals.filter((approval) => {
    const matchesFilter = filter === 'all' || approval.status === filter
    const matchesSearch =
      approval.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.requester.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const approveRequest = (id: number) => {
    setApprovals(
      approvals.map((approval) =>
        approval.id === id ? { ...approval, status: 'approved' as const } : approval
      )
    )
  }

  const rejectRequest = (id: number) => {
    setApprovals(
      approvals.map((approval) =>
        approval.id === id ? { ...approval, status: 'rejected' as const } : approval
      )
    )
  }

  const stats = {
    total: approvals.length,
    pending: approvals.filter((a) => a.status === 'pending').length,
    approved: approvals.filter((a) => a.status === 'approved').length,
    rejected: approvals.filter((a) => a.status === 'rejected').length,
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <CheckCircle className="size-5 text-brand" />
          <h3 className="font-semibold text-foreground">گردش کار تأیید</h3>
        </div>
        <button className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
          <MoreVertical className="size-4" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 p-3 border-b border-border">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">{stats.total}</p>
          <p className="text-xs text-muted-foreground">کل</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-warning">{stats.pending}</p>
          <p className="text-xs text-muted-foreground">در انتظار</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-success">{stats.approved}</p>
          <p className="text-xs text-muted-foreground">تأیید شده</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-error">{stats.rejected}</p>
          <p className="text-xs text-muted-foreground">رد شده</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="p-3 border-b border-border flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="جستجو در درخواست‌ها..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded border border-border bg-background pr-8 pl-3 py-1.5 text-sm text-foreground focus:border-brand focus:outline-none"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
          className="rounded border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:border-brand focus:outline-none"
        >
          <option value="all">همه</option>
          <option value="pending">در انتظار</option>
          <option value="approved">تأیید شده</option>
          <option value="rejected">رد شده</option>
        </select>
      </div>

      {/* Approval List */}
      <div className="max-h-80 overflow-y-auto">
        {filteredApprovals.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="mx-auto size-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">درخواستی یافت نشد</p>
          </div>
        ) : (
          filteredApprovals.map((approval) => (
            <div
              key={approval.id}
              className="p-4 border-b border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-semibold ${typeStyles[approval.type]}`}
                    >
                      {typeLabels[approval.type]}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-semibold ${priorityStyles[approval.priority]}`}
                    >
                      {approval.priority === 'high'
                        ? 'فوری'
                        : approval.priority === 'medium'
                          ? 'عادی'
                          : 'کم‌اهمیت'}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-semibold ${statusStyles[approval.status]}`}
                    >
                      {statusLabels[approval.status]}
                    </span>
                  </div>
                  <h4 className="font-medium text-foreground text-sm mb-1">{approval.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="size-3" />
                      <span>{approval.requester}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      <span>{approval.submittedAt}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-1">مراحل تأیید:</p>
                    <div className="flex items-center gap-1">
                      {approval.steps.map((step, index) => (
                        <div key={index} className="flex items-center">
                          <div
                            className={`size-6 rounded-full flex items-center justify-center text-xs ${
                              step.status === 'completed'
                                ? 'bg-success text-white'
                                : step.status === 'in_progress'
                                  ? 'bg-brand text-white'
                                  : step.status === 'rejected'
                                    ? 'bg-error text-white'
                                    : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {step.status === 'completed'
                              ? '✓'
                              : step.status === 'rejected'
                                ? '✗'
                                : index + 1}
                          </div>
                          {index < approval.steps.length - 1 && (
                            <div
                              className={`w-4 h-0.5 ${
                                step.status === 'completed' ? 'bg-success' : 'bg-muted'
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      مرحله فعلی: {approval.currentStep}
                    </p>
                  </div>
                </div>
                {approval.status === 'pending' && (
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => approveRequest(approval.id)}
                      className="flex items-center gap-1 rounded bg-success/10 px-2 py-1 text-xs font-medium text-success hover:bg-success/20"
                    >
                      <CheckCircle className="size-3" />
                      تأیید
                    </button>
                    <button
                      onClick={() => rejectRequest(approval.id)}
                      className="flex items-center gap-1 rounded bg-error/10 px-2 py-1 text-xs font-medium text-error hover:bg-error/20"
                    >
                      <XCircle className="size-3" />
                      رد
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t border-border flex justify-center">
        <button className="text-sm text-brand hover:underline">مشاهده همه درخواست‌ها</button>
      </div>
    </div>
  )
}
