/**
 * IRIB Digital Workplace Platform - Analytics Dashboard
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

'use client'

import { useState } from 'react'
import { BarChart3, Users, FileText, Activity, Clock, Search, Filter, Eye } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function AnalyticsDashboardPage() {
  const t = useTranslations('analytics')
  const [activeTab, setActiveTab] = useState('overview')
  const [period, setPeriod] = useState('7d')

  const tabs = [
    { id: 'overview', label: t('tabs.overview') },
    { id: 'content', label: t('tabs.content') },
    { id: 'users', label: t('tabs.users') },
    { id: 'audit', label: t('tabs.audit') },
  ]

  const periods = [
    { id: '1d', label: t('periods.1d') },
    { id: '7d', label: t('periods.7d') },
    { id: '30d', label: t('periods.30d') },
    { id: '90d', label: t('periods.90d') },
  ]

  const kpiData = [
    {
      id: 'visitors',
      label: t('kpi.visitors'),
      value: '۲,۷۴۵',
      change: '+۲۹٪',
      trend: 'up',
      icon: Users,
      color: 'text-brand',
    },
    {
      id: 'pageViews',
      label: t('kpi.pageViews'),
      value: '۱۲,۴۵۶',
      change: '+۱۵٪',
      trend: 'up',
      icon: Eye,
      color: 'text-success',
    },
    {
      id: 'content',
      label: t('kpi.content'),
      value: '۱۴۵',
      change: '+۸٪',
      trend: 'up',
      icon: FileText,
      color: 'text-info',
    },
    {
      id: 'activeUsers',
      label: t('kpi.activeUsers'),
      value: '۲۰۳',
      change: '+۱۳٪',
      trend: 'up',
      icon: Activity,
      color: 'text-warning',
    },
  ]

  const auditLogs = [
    {
      id: 1,
      action: 'CREATE',
      entity: 'Content',
      entityTitle: 'خبر جدید: نشست هم‌اندیشی',
      actor: 'محمد احمدی',
      createdAt: '۱۰:۱۵',
    },
    {
      id: 2,
      action: 'UPDATE',
      entity: 'User',
      entityTitle: 'به‌روزرسانی کاربر: علی رضایی',
      actor: 'سیستم',
      createdAt: '۰۹:۴۵',
    },
    {
      id: 3,
      action: 'DELETE',
      entity: 'FormSubmission',
      entityTitle: 'حذف ارسال فرم: #۱۲۳۴',
      actor: 'سارا موسوی',
      createdAt: '۰۹:۲۰',
    },
    {
      id: 4,
      action: 'LOGIN',
      entity: 'Auth',
      entityTitle: 'ورود کاربر: رضا کریمی',
      actor: 'رضا کریمی',
      createdAt: '۰۸:۵۵',
    },
    {
      id: 5,
      action: 'CREATE',
      entity: 'Ticket',
      entityTitle: 'ایجاد تیکت: مشکل شبکه',
      actor: 'مریم حسنی',
      createdAt: '۰۸:۳۰',
    },
  ]

  const actionStyles: Record<string, string> = {
    CREATE: 'bg-success/10 text-success',
    UPDATE: 'bg-info/10 text-info',
    DELETE: 'bg-error/10 text-error',
    LOGIN: 'bg-brand/10 text-brand',
  }

  return (
    <main className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-heading-1 text-foreground">{t('title')}</h1>
              <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2">
                <Clock className="size-4 text-muted-foreground" />
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="bg-transparent text-sm text-foreground outline-none"
                >
                  {periods.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-brand text-brand'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* KPI Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {kpiData.map((kpi) => {
                  const Icon = kpi.icon
                  return (
                    <div key={kpi.id} className="rounded-lg border border-border bg-card p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{kpi.label}</p>
                          <p className="mt-1 text-2xl font-bold text-foreground">{kpi.value}</p>
                          <p
                            className={`mt-1 text-xs ${kpi.change.startsWith('+') ? 'text-success' : 'text-error'}`}
                          >
                            {kpi.change}
                          </p>
                        </div>
                        <div className={`rounded-lg bg-accent p-3 ${kpi.color}`}>
                          <Icon className="size-5" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Charts */}
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="mb-4 text-lg font-semibold text-foreground">
                    {t('charts.pageViewsTitle')}
                  </h3>
                  <div className="h-64 rounded-lg bg-accent flex items-center justify-center">
                    <div className="w-full h-full flex items-end justify-between gap-2 px-4 pb-4">
                      {[65, 45, 78, 52, 89, 67, 72].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-brand/60 rounded-t transition-all hover:bg-brand"
                          style={{ height: `${height}%` }}
                          title={String(height)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t('charts.saturday')}</span>
                    <span>{t('charts.sunday')}</span>
                    <span>{t('charts.monday')}</span>
                    <span>{t('charts.tuesday')}</span>
                    <span>{t('charts.wednesday')}</span>
                    <span>{t('charts.thursday')}</span>
                    <span>{t('charts.friday')}</span>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="mb-4 text-lg font-semibold text-foreground">
                    {t('charts.activeUsersTitle')}
                  </h3>
                  <div className="h-64 rounded-lg bg-accent flex items-center justify-center">
                    <div className="w-full h-full flex items-end justify-between gap-2 px-4 pb-4">
                      {[40, 55, 62, 48, 70, 58, 65].map((height, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-success/60 rounded-t transition-all hover:bg-success"
                          style={{ height: `${height}%` }}
                          title={String(height)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t('charts.saturday')}</span>
                    <span>{t('charts.sunday')}</span>
                    <span>{t('charts.monday')}</span>
                    <span>{t('charts.tuesday')}</span>
                    <span>{t('charts.wednesday')}</span>
                    <span>{t('charts.thursday')}</span>
                    <span>{t('charts.friday')}</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground">
                  {t('recentActivity')}
                </h3>
                <div className="space-y-3">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center gap-4 rounded-lg border border-border p-3"
                    >
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${actionStyles[log.action]}`}
                      >
                        {log.action}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{log.entityTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.actor} · {log.createdAt}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Audit Tab */}
          {activeTab === 'audit' && (
            <div className="rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border p-4">
                <h3 className="text-lg font-semibold text-foreground">{t('auditTitle')}</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder={t('searchPlaceholder')}
                      className="w-64 rounded-lg border border-border bg-background pr-10 pl-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
                    />
                  </div>
                  <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-muted">
                    <Filter className="size-4" />
                    {t('filter')}
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        {t('table.action')}
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        {t('table.type')}
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        {t('table.title')}
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        {t('table.user')}
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        {t('table.time')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="border-b border-border hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${actionStyles[log.action]}`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{log.entity}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{log.entityTitle}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{log.actor}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{log.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Other tabs placeholders */}
          {(activeTab === 'content' || activeTab === 'users') && (
            <div className="rounded-lg border border-border bg-card p-10 text-center">
              <BarChart3 className="mx-auto size-12 text-muted-foreground/40" />
              <h2 className="mt-4 text-lg font-semibold text-foreground">
                {t('placeholder.title', {
                  type:
                    activeTab === 'content'
                      ? t('placeholder.contentType')
                      : t('placeholder.usersType'),
                })}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{t('placeholder.inDevelopment')}</p>
            </div>
          )}
        </main>
  )
}
