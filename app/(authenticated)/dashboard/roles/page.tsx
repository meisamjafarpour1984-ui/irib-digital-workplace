/**
 * IRIB Digital Workplace Platform - Roles & Permissions Dashboard
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
  ShieldCheck,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Lock,
  Edit,
  Users,
  Key,
  Loader2,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardTopbar } from '@/components/dashboard/dashboard-topbar'
import { useRbac } from '@/hooks/use-rbac'
import { useTranslations } from 'next-intl'

export default function RolesPage() {
  const t = useTranslations('roles')
  const [activeTab, setActiveTab] = useState('roles')
  const [searchQuery, setSearchQuery] = useState('')

  const { roles, permissions, loading } = useRbac()

  const tabs = [
    { id: 'roles', label: t('tabs.roles'), count: roles?.length || 0 },
    { id: 'permissions', label: t('tabs.permissions'), count: permissions?.length || 0 },
    { id: 'assignments', label: t('tabs.assignments'), count: 0 },
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardTopbar />
          <main className="flex-1 flex items-center justify-center p-6">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </main>
        </div>
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
              {t('addRole')}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-brand/10 p-2">
                  <ShieldCheck className="size-5 text-brand" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('stats.totalRoles')}</p>
                  <p className="text-lg font-bold text-foreground">{roles?.length || 0}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-success/10 p-2">
                  <Key className="size-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('stats.totalPermissions')}</p>
                  <p className="text-lg font-bold text-foreground">{permissions?.length || 0}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-info/10 p-2">
                  <Users className="size-5 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('stats.assignments')}</p>
                  <p className="text-lg font-bold text-foreground">۲۰۳</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-warning/10 p-2">
                  <Lock className="size-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('stats.systemRoles')}</p>
                  <p className="text-lg font-bold text-foreground">۲</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
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

          {/* Roles Tab */}
          {activeTab === 'roles' && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-brand/40"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-brand/10 text-brand">
                      <ShieldCheck className="size-6" />
                    </div>
                    {role.isSystem && (
                      <span className="rounded-full bg-warning/10 px-2 py-1 text-xs font-semibold text-warning">
                        {t('systemBadge')}
                      </span>
                    )}
                  </div>
                  <h3 className="mb-1 font-semibold text-foreground">
                    {typeof role.name === 'string' ? role.name : role.name.fa}
                  </h3>
                  <code className="mb-3 block text-xs text-muted-foreground">{role.code}</code>
                  <p className="mb-4 text-sm text-muted-foreground">{role.description}</p>
                  <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Users className="size-3" />
                      {role.userCount ?? 0} {t('userCount')}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Key className="size-3" />
                      {role.permissions.length} {t('permissionCount')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand/10 px-3 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand hover:text-white">
                      <Edit className="size-4" />
                      {t('edit')}
                    </button>
                    <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                      <MoreVertical className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Permissions Tab */}
          {activeTab === 'permissions' && (
            <div className="rounded-lg border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        {t('permissionsTable.entity')}
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        {t('permissionsTable.action')}
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        {t('permissionsTable.description')}
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        {t('permissionsTable.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((permission) => (
                      <tr key={permission.id} className="border-b border-border hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <code className="rounded bg-accent px-2 py-1 text-sm text-foreground">
                            {permission.entity ?? permission.module}
                          </code>
                        </td>
                        <td className="px-4 py-3">
                          <code className="rounded bg-accent px-2 py-1 text-sm text-foreground">
                            {permission.action ?? permission.code}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {permission.description}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                              title={t('edit')}
                            >
                              <Edit className="size-4" />
                            </button>
                            <button
                              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                              title={t('more')}
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
          )}

          {/* Assignments Tab Placeholder */}
          {activeTab === 'assignments' && (
            <div className="rounded-lg border border-border bg-card p-10 text-center">
              <Users className="mx-auto size-12 text-muted-foreground/40" />
              <h2 className="mt-4 text-lg font-semibold text-foreground">
                {t('assignmentsTitle')}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{t('assignmentsPlaceholder')}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
