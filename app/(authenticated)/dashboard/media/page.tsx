/**
 * IRIB Digital Workplace Platform - Media Management Dashboard
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
  Radio,
  Image,
  Video,
  Music,
  FileText,
  Search,
  Filter,
  Upload,
  FolderOpen,
  AlertCircle,
} from 'lucide-react'
import { useStorage } from '@/hooks/use-storage'

// Force dynamic rendering to avoid SSR hydration issues
export const dynamic = 'force-dynamic'

export default function MediaManagementPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { stats, loading, error } = useStorage()

  const tabs = [
    { id: 'all', label: 'همه رسانه‌ها', count: stats?.totalAssets || 0 },
    {
      id: 'images',
      label: 'تصاویر',
      count: stats?.assetsByType?.find((t) => t.mimeType.includes('image'))?.count || 0,
    },
    {
      id: 'videos',
      label: 'ویدیوها',
      count: stats?.assetsByType?.find((t) => t.mimeType.includes('video'))?.count || 0,
    },
    {
      id: 'audio',
      label: 'صوت‌ها',
      count: stats?.assetsByType?.find((t) => t.mimeType.includes('audio'))?.count || 0,
    },
  ]

  const mediaItems =
    stats?.recentUploads?.map((item, _index) => ({
      id: item.id,
      name: item.originalName,
      type: item.mimeType.includes('image')
        ? 'image'
        : item.mimeType.includes('video')
          ? 'video'
          : item.mimeType.includes('audio')
            ? 'audio'
            : 'document',
      size: `${(item.size / 1024 / 1024).toFixed(1)} MB`,
      uploadedAt: new Date(item.createdAt).toLocaleDateString('fa-IR'),
      uploader: item.uploadedBy?.name || 'ناشناس',
    })) || []

  const typeIcons: Record<string, typeof Image> = {
    image: Image,
    video: Video,
    audio: Music,
    document: FileText,
  }

  const typeStyles: Record<string, string> = {
    image: 'bg-purple/10 text-purple',
    video: 'bg-blue/10 text-blue',
    audio: 'bg-green/10 text-green',
    document: 'bg-orange/10 text-orange',
  }

  return (
    <main className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-heading-1 text-foreground">مدیریت رسانه</h1>
              <p className="text-sm text-muted-foreground">
                مدیریت تصاویر، ویدیوها و فایل‌های صوتی
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                <FolderOpen className="size-4" />
                مدیریت پوشه‌ها
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
                <Upload className="size-4" />
                آپلود فایل
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          {loading ? (
            <div className="grid gap-4 md:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-muted h-10 w-10" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-muted rounded w-20" />
                      <div className="h-5 bg-muted rounded w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-lg border border-error/20 bg-error/5 p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="size-5 text-error" />
                <p className="text-sm text-error">{error}</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-brand/10 p-2">
                    <Radio className="size-5 text-brand" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">کل رسانه‌ها</p>
                    <p className="text-lg font-bold text-foreground">{stats?.totalAssets || 0}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple/10 p-2">
                    <Image className="size-5 text-purple" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">تصاویر</p>
                    <p className="text-lg font-bold text-foreground">
                      {stats?.assetsByType?.find((t) => t.mimeType.includes('image'))?.count || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue/10 p-2">
                    <Video className="size-5 text-blue" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ویدیوها</p>
                    <p className="text-lg font-bold text-foreground">
                      {stats?.assetsByType?.find((t) => t.mimeType.includes('video'))?.count || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green/10 p-2">
                    <Music className="size-5 text-green" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">صوت‌ها</p>
                    <p className="text-lg font-bold text-foreground">
                      {stats?.assetsByType?.find((t) => t.mimeType.includes('audio'))?.count || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="جستجو در رسانه‌ها..."
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
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs">{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Media Grid */}
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-4 animate-pulse">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg bg-muted" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-3 bg-muted rounded w-20" />
                    <div className="h-3 bg-muted rounded w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <AlertCircle className="mx-auto size-12 text-error mb-4" />
              <p className="text-sm text-error">{error}</p>
            </div>
          ) : mediaItems.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <Radio className="mx-auto size-12 text-muted-foreground/40 mb-4" />
              <p className="text-sm text-muted-foreground">هیچ رسانه‌ای یافت نشد</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mediaItems.map((item) => {
                const Icon = typeIcons[item.type] || FileText
                return (
                  <div key={item.id} className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex size-10 items-center justify-center rounded-lg ${typeStyles[item.type]}`}
                        >
                          <Icon className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-foreground truncate">{item.name}</h3>
                          <p className="text-xs text-muted-foreground">{item.size}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.uploader}</span>
                      <span className="text-muted-foreground">{item.uploadedAt}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
  )
}
