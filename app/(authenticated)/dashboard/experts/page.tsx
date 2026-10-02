/**
 * IRIB Digital Workplace Platform - Experts Management Dashboard
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

'use client'

import { useState } from 'react'
import { Plus, Search, Filter, MoreVertical, Edit, Star, User, Video, Trophy } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useExperts } from '@/hooks/use-experts'

export default function ExpertsManagementPage() {
  const t = useTranslations('experts')
  const [activeTab, setActiveTab] = useState('experts')
  const [searchQuery, setSearchQuery] = useState('')

  const { experts, legends, skills, stats } = useExperts()

  const tabs = [
    { id: 'experts', label: t('tabs.experts'), count: stats?.totalExperts || 0 },
    { id: 'legends', label: t('tabs.legends'), count: stats?.totalLegends || 0 },
    { id: 'skills', label: t('tabs.skills'), count: stats?.totalSkills || 0 },
  ]

  return (
    <main className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-heading-1 text-foreground">{t('pageTitle')}</h1>
              <p className="text-sm text-muted-foreground">{t('pageSubtitle')}</p>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
              <Plus className="size-4" />
              {t('addExpert')}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-brand/10 p-2">
                  <User className="size-5 text-brand" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('stats.totalExperts')}</p>
                  <p className="text-lg font-bold text-foreground">۴۵</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-warning/10 p-2">
                  <Star className="size-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('stats.legends')}</p>
                  <p className="text-lg font-bold text-foreground">۸</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-info/10 p-2">
                  <Trophy className="size-5 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('stats.skills')}</p>
                  <p className="text-lg font-bold text-foreground">۳۰</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-success/10 p-2">
                  <Video className="size-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('stats.interviews')}</p>
                  <p className="text-lg font-bold text-foreground">۱۲</p>
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

          {/* Experts Tab */}
          {activeTab === 'experts' && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {experts.map((expert) => (
                <div
                  key={expert.id}
                  className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-brand/40"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand">
                      <span className="text-lg font-bold">{expert.name.charAt(0)}</span>
                    </div>
                    <button className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                      <MoreVertical className="size-4" />
                    </button>
                  </div>
                  <h3 className="mb-1 font-semibold text-foreground">{expert.name}</h3>
                  <p className="mb-2 text-sm text-muted-foreground">{expert.title}</p>
                  <p className="mb-3 text-xs text-muted-foreground">{expert.department}</p>
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {expert.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-accent px-2 py-0.5 text-xs text-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                    {expert.skills.length > 3 && (
                      <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-muted-foreground">
                        +{expert.skills.length - 3}
                      </span>
                    )}
                  </div>
                  <p className="mb-4 text-xs text-muted-foreground line-clamp-2">{expert.bio}</p>
                  <div className="flex items-center gap-2">
                    <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand/10 px-3 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand hover:text-white">
                      <Edit className="size-4" />
                      {t('edit')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Legends Tab */}
          {activeTab === 'legends' && (
            <div className="grid gap-6 md:grid-cols-2">
              {legends.map((legend) => (
                <div key={legend.id} className="rounded-2xl border-2 border-brand/20 bg-card p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex size-16 items-center justify-center rounded-full bg-brand/10">
                      <span className="text-2xl font-bold text-brand">{legend.name.charAt(0)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="size-5 text-warning" />
                      <span className="text-sm font-semibold text-warning">{t('legendBadge')}</span>
                    </div>
                  </div>
                  <h3 className="mb-1 text-lg font-bold text-foreground">{legend.name}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">{legend.title}</p>
                  <div className="mb-4 space-y-3">
                    <div>
                      <p className="mb-2 text-sm font-medium text-foreground">{t('honors')}</p>
                      <div className="flex flex-wrap gap-2">
                        {legend.awards.map((award) => (
                          <span
                            key={award}
                            className="rounded-full bg-brand/10 px-3 py-1 text-xs text-brand"
                          >
                            {award}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium text-foreground">{t('keyWorks')}</p>
                      <div className="flex flex-wrap gap-2">
                        {legend.keyWorks.map((work) => (
                          <span
                            key={work}
                            className="rounded-full bg-accent px-3 py-1 text-xs text-foreground"
                          >
                            {work}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium text-foreground">{t('festivals')}</p>
                      <div className="flex flex-wrap gap-2">
                        {legend.festivals.map((festival) => (
                          <span
                            key={festival}
                            className="rounded-full bg-accent px-3 py-1 text-xs text-foreground"
                          >
                            {festival}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand/10 px-4 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand hover:text-white">
                      <Video className="size-4" />
                      {t('viewInterview')}
                    </button>
                    <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                      <MoreVertical className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div className="rounded-lg border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        {t('table.skillName')}
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        {t('table.category')}
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        {t('table.expertCount')}
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        {t('table.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {skills.map((skill) => (
                      <tr key={skill.id} className="border-b border-border hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <span className="font-medium text-foreground">{skill.name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-accent px-2.5 py-1 text-xs text-foreground">
                            {skill.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">{skill.expertCount}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                              title={t('titleEdit')}
                            >
                              <Edit className="size-4" />
                            </button>
                            <button
                              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                              title={t('titleMore')}
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
        </main>
  )
}
