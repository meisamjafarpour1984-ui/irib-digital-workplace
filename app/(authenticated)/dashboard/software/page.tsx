/**
 * IRIB Digital Workplace Platform - Software Center Dashboard
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
  Package,
  Upload,
  Download,
  MoreVertical,
  Search,
  Filter,
  FileText,
  HardDrive,
  Shield,
  Globe,
  X as CloseIcon,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { useSoftware } from '@/hooks/use-software'

export default function SoftwareCenterPage() {
  const [activeTab, setActiveTab] = useState('software')
  const [searchQuery, setSearchQuery] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)

  const { software, stats, loading, error } = useSoftware()

  const tabs = [
    { id: 'software', label: 'نرم‌افزارها', count: stats?.totalSoftware || 0 },
    { id: 'downloads', label: 'دانلودها', count: stats?.totalDownloads || 0 },
    { id: 'categories', label: 'دسته‌بندی‌ها', count: stats?.categories || 0 },
  ]

  const categoryIcons: Record<string, typeof FileText> = {
    office: FileText,
    security: Shield,
    tools: HardDrive,
    network: Globe,
  }

  const categoryStyles: Record<string, string> = {
    office: 'bg-blue/10 text-blue',
    security: 'bg-red/10 text-red',
    tools: 'bg-green/10 text-green',
    network: 'bg-purple/10 text-purple',
  }

  return (
    <main className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-heading-1 text-foreground">مرکز نرم‌افزارها</h1>
              <p className="text-sm text-muted-foreground">مدیریت و توزیع نرم‌افزارهای سازمانی</p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90"
            >
              <Upload className="size-4" />
              آپلود نرم‌افزار
            </button>
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
                    <Package className="size-5 text-brand" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">کل نرم‌افزارها</p>
                    <p className="text-lg font-bold text-foreground">{stats?.totalSoftware || 0}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-success/10 p-2">
                    <Download className="size-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">کل دانلودها</p>
                    <p className="text-lg font-bold text-foreground">
                      {stats?.totalDownloads?.toLocaleString('fa-IR') || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-info/10 p-2">
                    <HardDrive className="size-5 text-info" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">حجم کل</p>
                    <p className="text-lg font-bold text-foreground">
                      {stats?.totalSize || '0 GB'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-warning/10 p-2">
                    <FileText className="size-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">دسته‌بندی‌ها</p>
                    <p className="text-lg font-bold text-foreground">{stats?.categories || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="جستجو در نرم‌افزارها..."
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

          {/* Upload Modal */}
          {showUploadModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-heading-1 text-foreground">آپلود نرم‌افزار جدید</h2>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <CloseIcon className="size-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      نام نرم‌افزار
                    </label>
                    <input
                      type="text"
                      placeholder="نام نرم‌افزار را وارد کنید"
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">نسخه</label>
                    <input
                      type="text"
                      placeholder="نسخه نرم‌افزار"
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      دسته‌بندی
                    </label>
                    <select className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none">
                      <option value="">انتخاب دسته‌بندی</option>
                      <option value="office">اداری</option>
                      <option value="security">امنیت</option>
                      <option value="tools">ابزارها</option>
                      <option value="development">توسعه</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      فایل نرم‌افزار
                    </label>
                    <div className="rounded-lg border-2 border-dashed border-border bg-accent p-8 text-center">
                      <Package className="mx-auto size-12 text-muted-foreground/40" />
                      <p className="mt-3 text-sm text-muted-foreground">
                        فایل را اینجا بکشید یا کلیک کنید
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">EXE, MSI, ZIP (حداک 2GB)</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowUploadModal(false)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      انصراف
                    </button>
                    <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand/90">
                      <Upload className="size-4" />
                      آپلود
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Software List */}
          <div className="rounded-lg border border-border bg-card">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <AlertCircle className="mx-auto size-12 text-error mb-4" />
                  <p className="text-sm text-error">{error}</p>
                </div>
              </div>
            ) : software.length === 0 ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <Package className="mx-auto size-12 text-muted-foreground/40 mb-4" />
                  <p className="text-sm text-muted-foreground">هیچ نرم‌افزاری یافت نشد</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        نام نرم‌افزار
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        نسخه
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        حجم
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        دسته
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        دانلودها
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        وضعیت
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        عملیات
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {software.map((item) => {
                      const Icon = categoryIcons[item.category] || FileText
                      return (
                        <tr key={item.id} className="border-b border-border hover:bg-muted/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex size-8 items-center justify-center rounded-lg ${categoryStyles[item.category]}`}
                              >
                                <Icon className="size-4" />
                              </div>
                              <span className="font-medium text-foreground">{item.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {item.version}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{item.size}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {item.category}
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">{item.downloads}</td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                              {item.status === 'active' ? 'فعال' : item.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                                title="دانلود"
                              >
                                <Download className="size-4" />
                              </button>
                              <button
                                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                                title="ویرایش"
                              >
                                <MoreVertical className="size-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
  )
}
