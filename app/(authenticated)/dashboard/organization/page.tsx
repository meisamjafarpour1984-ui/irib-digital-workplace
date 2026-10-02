/**
 * IRIB Digital Workplace Platform - Organization Manager Dashboard
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
  Building2,
  Users,
  ChevronRight,
  ChevronDown,
  Plus,
  Edit,
  Search,
  Filter,
  MoreVertical,
  Settings,
  Loader2,
} from 'lucide-react'

interface OrgUnit {
  id: string
  name: string
  manager?: string
  memberCount?: number
  children?: OrgUnit[]
}
import { useOrganization } from '@/hooks/use-organization'

export default function OrganizationManagerPage() {
  const [activeTab, setActiveTab] = useState('structure')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedUnits, setExpandedUnits] = useState<string[]>(['it', 'research', 'production'])

  const { organization, loading } = useOrganization()

  const tabs = [
    { id: 'structure', label: 'ساختار سازمانی' },
    { id: 'departments', label: 'معاونت‌ها' },
    { id: 'units', label: 'واحدها' },
    { id: 'microsites', label: 'Microsites' },
  ]

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center p-6">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </main>
    )
  }

  const toggleExpand = (unitId: string) => {
    setExpandedUnits((prev) =>
      prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId]
    )
  }

  const renderUnit = (unit: OrgUnit, level: number = 0) => {
    const isExpanded = expandedUnits.includes(unit.id)
    const hasChildren = unit.children && unit.children.length > 0

    return (
      <div key={unit.id} className={level > 0 ? 'mr-6' : ''}>
        <div
          className={`flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-brand/40 ${
            level === 0 ? 'mb-4' : 'mb-2'
          }`}
          style={{ marginRight: `${level * 16}px` }}
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <Building2 className="size-4" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">{unit.name}</p>
            {unit.manager && <p className="text-xs text-muted-foreground">مدیر: {unit.manager}</p>}
          </div>
          {unit.memberCount && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="size-3" />
              {unit.memberCount}
            </div>
          )}
          {hasChildren && (
            <button
              onClick={() => toggleExpand(unit.id)}
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {isExpanded ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </button>
          )}
          <button className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
            <MoreVertical className="size-4" />
          </button>
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-2">
            {unit.children?.map((child: OrgUnit) => renderUnit(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <main className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-heading-1 text-foreground">مدیریت سازمان</h1>
              <p className="text-sm text-muted-foreground">مدیریت ساختار سازمانی و واحدها</p>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
              <Plus className="size-4" />
              افزودن واحد
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-brand/10 p-2">
                  <Building2 className="size-5 text-brand" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">کل معاونت‌ها</p>
                  <p className="text-lg font-bold text-foreground">۳</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-success/10 p-2">
                  <Users className="size-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">کل واحدها</p>
                  <p className="text-lg font-bold text-foreground">۹</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-info/10 p-2">
                  <Settings className="size-5 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Microsites</p>
                  <p className="text-lg font-bold text-foreground">۳</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-warning/10 p-2">
                  <Users className="size-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">کل کارکنان</p>
                  <p className="text-lg font-bold text-foreground">۱۰۳</p>
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
                placeholder="جستجو در واحدها..."
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

          {/* Structure Tab */}
          {activeTab === 'structure' && (
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">نمودار درختی سازمان</h3>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted">
                    <Edit className="size-4" />
                    ویرایش
                  </button>
                  <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted">
                    <Settings className="size-4" />
                    تنظیمات
                  </button>
                </div>
              </div>

              {/* Visual Org Chart */}
              <div className="overflow-x-auto">
                <div className="min-w-[800px] p-4">
                  {organization.map((org) => (
                    <div key={org.id} className="org-chart">
                      {/* Root Node */}
                      <div className="flex justify-center mb-8">
                        <div className="flex flex-col items-center">
                          <div className="w-48 rounded-lg border-2 border-brand bg-brand/5 p-4 text-center cursor-pointer hover:bg-brand/10 transition-colors">
                            <Building2 className="mx-auto size-8 text-brand mb-2" />
                            <p className="font-semibold text-foreground text-sm">{org.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">سازمان اصلی</p>
                          </div>
                          <div className="w-px h-8 bg-border mt-2"></div>
                        </div>
                      </div>

                      {/* First Level - Deputies */}
                      <div className="flex justify-center gap-8 mb-4">
                        {org.children?.map((deputy) => (
                          <div key={deputy.id} className="flex flex-col items-center">
                            <div className="w-px h-4 bg-border mb-2"></div>
                            <div className="w-40 rounded-lg border border-border bg-card p-3 text-center cursor-pointer hover:border-brand/50 transition-colors">
                              <Building2 className="mx-auto size-6 text-brand mb-2" />
                              <p className="font-medium text-foreground text-sm">{deputy.name}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                مدیر: {deputy.manager}
                              </p>
                            </div>
                            <div className="w-px h-4 bg-border mt-2"></div>
                          </div>
                        ))}
                      </div>

                      {/* Horizontal Line */}
                      <div className="flex justify-center mb-4">
                        <div className="w-[90%] h-px bg-border"></div>
                      </div>

                      {/* Second Level - Units */}
                      <div className="flex justify-center gap-4">
                        {org.children?.map((deputy) => (
                          <div key={deputy.id} className="flex flex-col gap-4">
                            {deputy.children?.map((unit) => (
                              <div key={unit.id} className="flex flex-col items-center">
                                <div className="w-px h-4 bg-border mb-2"></div>
                                <div className="w-36 rounded-lg border border-border bg-card p-3 text-center cursor-pointer hover:border-brand/50 transition-colors">
                                  <Building2 className="mx-auto size-5 text-muted-foreground mb-1" />
                                  <p className="font-medium text-foreground text-xs">{unit.name}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {unit.manager}
                                  </p>
                                  <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
                                    <Users className="size-3" />
                                    {unit.memberCount}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tree View Alternative */}
              <div className="mt-8 pt-8 border-t border-border">
                <h4 className="text-sm font-semibold text-foreground mb-4">
                  نمای درختی (تقسیم‌بندی)
                </h4>
                <div className="space-y-2">{organization.map((org) => renderUnit(org))}</div>
              </div>
            </div>
          )}

          {/* Other tabs placeholders */}
          {activeTab !== 'structure' && (
            <div className="rounded-lg border border-border bg-card p-10 text-center">
              <Building2 className="mx-auto size-12 text-muted-foreground/40" />
              <h2 className="mt-4 text-lg font-semibold text-foreground">
                مدیریت {tabs.find((t) => t.id === activeTab)?.label}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">این بخش در حال توسعه است.</p>
            </div>
          )}
        </main>
  )
}
