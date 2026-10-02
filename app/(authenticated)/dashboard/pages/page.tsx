/**
 * IRIB Digital Workplace Platform - Pages Management Dashboard
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
  FileStack,
  Plus,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Search,
  Filter,
  Loader2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePages } from '@/hooks/use-pages'

export default function PagesManagementPage() {
  const t = useTranslations('pages')
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { pages, stats, loading } = usePages()

  const tabs = [
    { id: 'all', label: t('tabs.all'), count: stats?.totalPages || 0 },
    { id: 'published', label: t('tabs.published'), count: stats?.published || 0 },
    { id: 'draft', label: t('tabs.draft'), count: stats?.draft || 0 },
    { id: 'archived', label: t('tabs.archived'), count: stats?.archived || 0 },
  ]

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center p-6">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </main>
    )
  }

  const statusStyles: Record<string, string> = {
    published: 'bg-success/10 text-success',
    draft: 'bg-warning/10 text-warning',
    archived: 'bg-muted text-muted-foreground',
  }

  const statusLabels: Record<string, string> = {
    published: t('status.published'),
    draft: t('status.draft'),
    archived: t('status.archived'),
  }

  return (
    <main className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-heading-1 text-foreground">{t('title')}</h1>
              <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
              <Plus className="size-4" />
              {t('newPage')}
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-background pr-10 pl-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
              />
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted">
              <Filter className="size-4" />
              {t('filter')}
            </button>
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
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs">{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Pages Table */}
          <div className="rounded-lg border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      {t('table.title')}
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      {t('table.slug')}
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      {t('table.status')}
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      {t('table.author')}
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      {t('table.views')}
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      {t('table.updatedAt')}
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      {t('table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((page) => (
                    <tr key={page.id} className="border-b border-border hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-brand">
                            <FileStack className="size-4" />
                          </div>
                          <span className="font-medium text-foreground">{page.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{page.slug}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[page.status]}`}
                        >
                          {statusLabels[page.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">{page.author}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {page.views.toLocaleString('fa-IR')}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{page.updatedAt}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                            title={t('actions.view')}
                          >
                            <Eye className="size-4" />
                          </button>
                          <button
                            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                            title={t('actions.edit')}
                          >
                            <Edit className="size-4" />
                          </button>
                          <button
                            className="rounded-lg p-2 text-muted-foreground hover:bg-error/10 hover:text-error"
                            title={t('actions.delete')}
                          >
                            <Trash2 className="size-4" />
                          </button>
                          <button
                            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                            title={t('actions.more')}
                          >
                            <MoreVertical className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{t('pagination.showing')}</p>
            <div className="flex items-center gap-2">
              <button className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted">
                {t('pagination.previous')}
              </button>
              <button className="rounded-lg bg-brand px-3 py-1.5 text-sm text-white transition-colors hover:bg-brand/90">
                ۱
              </button>
              <button className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted">
                ۲
              </button>
              <button className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted">
                {t('pagination.next')}
              </button>
            </div>
          </div>
        </main>
  )
}
