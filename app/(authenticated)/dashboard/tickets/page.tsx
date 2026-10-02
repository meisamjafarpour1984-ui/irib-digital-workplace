/**
 * IRIB Digital Workplace Platform - Tickets Dashboard
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Ticket,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  User,
  Search,
  Filter,
  MoreVertical,
  Loader2,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardTopbar } from '@/components/dashboard/dashboard-topbar'
import { useTickets } from '@/hooks/use-tickets'

export default function TicketsDashboardPage() {
  const t = useTranslations('tickets')
  const { tickets, loading, error, fetchTickets, updateTicket } = useTickets()
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const statusMapping: Record<string, string> = {
    all: '',
    new: 'NEW',
    in_progress: 'IN_PROGRESS',
    resolved: 'RESOLVED',
    closed: 'CLOSED',
  }

  const tabs = [
    { id: 'all', label: t('allTickets'), count: tickets.length },
    { id: 'new', label: t('new'), count: tickets.filter((t) => t.status === 'NEW').length },
    {
      id: 'in_progress',
      label: t('inProgress'),
      count: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
    },
    {
      id: 'resolved',
      label: t('resolved'),
      count: tickets.filter((t) => t.status === 'RESOLVED').length,
    },
    {
      id: 'closed',
      label: t('closed'),
      count: tickets.filter((t) => t.status === 'CLOSED').length,
    },
  ]

  const filteredTickets = tickets.filter((ticket) => {
    const matchesTab = activeTab === 'all' || ticket.status === statusMapping[activeTab]
    const matchesSearch =
      ticket.title.includes(searchQuery) || ticket.description.includes(searchQuery)
    return matchesTab && matchesSearch
  })

  const statusStyles: Record<string, string> = {
    NEW: 'bg-info/10 text-info',
    IN_PROGRESS: 'bg-warning/10 text-warning',
    RESOLVED: 'bg-success/10 text-success',
    CLOSED: 'bg-muted text-muted-foreground',
  }

  const statusLabels: Record<string, string> = {
    NEW: t('new'),
    IN_PROGRESS: t('inProgress'),
    RESOLVED: t('resolved'),
    CLOSED: t('closed'),
  }

  const priorityStyles: Record<string, string> = {
    HIGH: 'text-error',
    NORMAL: 'text-warning',
    LOW: 'text-success',
  }

  const priorityLabels: Record<string, string> = {
    HIGH: t('priorityHigh'),
    NORMAL: t('priorityNormal'),
    LOW: t('priorityLow'),
  }

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    fetchTickets({ status: statusMapping[tabId] })
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateTicket(id, { status: newStatus })
    } catch {
      alert(t('statusChangeError'))
    }
  }

  if (loading && tickets.length === 0) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center">
        <Loader2 className="size-8 animate-spin text-brand" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-heading-1 text-foreground">{t('title')}</h1>
              <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
              <Plus className="size-4" />
              {t('newTicket')}
            </button>
          </div>

          {error && (
            <div className="rounded-lg bg-error/10 border border-error/20 p-3 text-sm text-error">
              {error}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-info/10 p-2">
                  <Ticket className="size-5 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('totalTickets')}</p>
                  <p className="text-lg font-bold text-foreground">{tickets.length}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-info/10 p-2">
                  <AlertCircle className="size-5 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('new')}</p>
                  <p className="text-lg font-bold text-foreground">
                    {tickets.filter((t) => t.status === 'NEW').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-warning/10 p-2">
                  <Clock className="size-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('inProgress')}</p>
                  <p className="text-lg font-bold text-foreground">
                    {tickets.filter((t) => t.status === 'IN_PROGRESS').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-success/10 p-2">
                  <CheckCircle className="size-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('resolved')}</p>
                  <p className="text-lg font-bold text-foreground">
                    {tickets.filter((t) => t.status === 'RESOLVED').length}
                  </p>
                </div>
              </div>
            </div>
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
                onClick={() => handleTabChange(tab.id)}
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

          {/* Tickets Table */}
          <div className="rounded-lg border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      {t('columnTitle')}
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      {t('columnStatus')}
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      {t('columnPriority')}
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      {t('columnCategory')}
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      {t('columnAssignee')}
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      {t('columnCreated')}
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                      {t('columnActions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center">
                        <Loader2 className="mx-auto size-6 animate-spin text-brand" />
                      </td>
                    </tr>
                  ) : filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                        {t('noTickets')}
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="border-b border-border hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Ticket className="size-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">{ticket.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold cursor-pointer ${statusStyles[ticket.status] || 'bg-muted'}`}
                            onClick={() =>
                              handleStatusChange(
                                ticket.id,
                                ticket.status === 'NEW'
                                  ? 'IN_PROGRESS'
                                  : ticket.status === 'IN_PROGRESS'
                                    ? 'RESOLVED'
                                    : 'CLOSED'
                              )
                            }
                          >
                            {statusLabels[ticket.status] || ticket.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-sm font-medium ${priorityStyles[ticket.priority] || 'text-muted-foreground'}`}
                          >
                            {priorityLabels[ticket.priority] || ticket.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {ticket.category}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {ticket.assignedTo || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(ticket.createdAt).toLocaleDateString('fa-IR')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                              title="مشاهده"
                            >
                              <MessageSquare className="size-4" />
                            </button>
                            <button
                              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                              title="تخصیص"
                            >
                              <User className="size-4" />
                            </button>
                            <button
                              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                              title="بیشتر"
                            >
                              <MoreVertical className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
