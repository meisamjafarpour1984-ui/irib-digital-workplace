/**
 * IRIB Digital Workplace Platform - PDF Generator Dashboard
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
  FileText,
  Download,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Trash2,
  File,
  XCircle,
  Type,
  Image,
  Table,
  Layout,
  MousePointer2,
  GripVertical,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardTopbar } from '@/components/dashboard/dashboard-topbar'

export default function PDFGeneratorPage() {
  const [activeTab, setActiveTab] = useState('templates')
  const [searchQuery, setSearchQuery] = useState('')
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)

  const tabs = [
    { id: 'templates', label: 'قالب‌ها', count: 8 },
    { id: 'generated', label: 'PDFهای تولید شده', count: 45 },
    { id: 'history', label: 'تاریخچه', count: 120 },
  ]

  const templates = [
    {
      id: 1,
      name: 'گزارش نامه اداری',
      description: 'قالب استاندارد برای گزارش‌های اداری',
      category: 'administrative',
      lastUsed: '۲ روز پیش',
      usageCount: 23,
    },
    {
      id: 2,
      name: 'قرارداد',
      description: 'قالب قراردادهای سازمانی',
      category: 'legal',
      lastUsed: '۵ روز پیش',
      usageCount: 15,
    },
    {
      id: 3,
      name: 'صورت‌جلسه',
      description: 'قالب صورت‌جلسه جلسات',
      category: 'administrative',
      lastUsed: '۱ هفته پیش',
      usageCount: 34,
    },
    {
      id: 4,
      name: 'گزارش مالی',
      description: 'قالب گزارش‌های مالی',
      category: 'financial',
      lastUsed: '۳ روز پیش',
      usageCount: 18,
    },
  ]

  const generatedPDFs = [
    {
      id: 1,
      name: 'گزارش نامه-۱۴۰۳-۰۹-۱۵.pdf',
      template: 'گزارش نامه اداری',
      generatedBy: 'محمد احمدی',
      generatedAt: '۱۴۰۳/۰۹/۱۵',
      size: '245 KB',
    },
    {
      id: 2,
      name: 'قرارداد-۱۴۰۳-۰۹-۱۰.pdf',
      template: 'قرارداد',
      generatedBy: 'علی رضایی',
      generatedAt: '۱۴۰۳/۰۹/۱۰',
      size: '180 KB',
    },
    {
      id: 3,
      name: 'صورت‌جلسه-۱۴۰۳-۰۹-۰۵.pdf',
      template: 'صورت‌جلسه',
      generatedBy: 'سارا موسوی',
      generatedAt: '۱۴۰۳/۰۹/۰۵',
      size: '320 KB',
    },
  ]

  const categoryStyles: Record<string, string> = {
    administrative: 'bg-blue/10 text-blue',
    legal: 'bg-purple/10 text-purple',
    financial: 'bg-green/10 text-green',
    technical: 'bg-brand/10 text-brand',
  }

  const categoryLabels: Record<string, string> = {
    administrative: 'اداری',
    legal: 'حقوقی',
    financial: 'مالی',
    technical: 'فنی',
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-heading-1 text-foreground">تولید PDF</h1>
              <p className="text-sm text-muted-foreground">مدیریت قالب‌ها و تولید اسناد PDF</p>
            </div>
            <button
              onClick={() => setShowTemplateEditor(true)}
              className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90"
            >
              <Plus className="size-4" />
              ایجاد قالب جدید
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-brand/10 p-2">
                  <FileText className="size-5 text-brand" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">کل قالب‌ها</p>
                  <p className="text-lg font-bold text-foreground">۸</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-success/10 p-2">
                  <File className="size-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">PDFهای تولید شده</p>
                  <p className="text-lg font-bold text-foreground">۴۵</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-info/10 p-2">
                  <Download className="size-5 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">دانلودها</p>
                  <p className="text-lg font-bold text-foreground">۱۲۳</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-warning/10 p-2">
                  <FileText className="size-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">استفاده امروز</p>
                  <p className="text-lg font-bold text-foreground">۵</p>
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
                placeholder="جستجو در قالب‌ها..."
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

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-brand/40"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex size-12 items-center justify-center rounded-lg bg-brand/10 text-brand">
                      <FileText className="size-6" />
                    </div>
                    <button className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                      <MoreVertical className="size-4" />
                    </button>
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">{template.name}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">{template.description}</p>
                  <div className="mb-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${categoryStyles[template.category]}`}
                    >
                      {categoryLabels[template.category]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>استفاده: {template.usageCount}</span>
                    <span>{template.lastUsed}</span>
                  </div>
                  <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-brand/10 px-4 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand hover:text-white">
                    <FileText className="size-4" />
                    استفاده از قالب
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Generated PDFs Tab */}
          {activeTab === 'generated' && (
            <div className="rounded-lg border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        نام فایل
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        قالب
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        تولید توسط
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        تاریخ
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        حجم
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        عملیات
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedPDFs.map((pdf) => (
                      <tr key={pdf.id} className="border-b border-border hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-brand">
                              <File className="size-4" />
                            </div>
                            <span className="font-medium text-foreground">{pdf.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{pdf.template}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{pdf.generatedBy}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {pdf.generatedAt}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{pdf.size}</td>
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
                              title="مشاهده"
                            >
                              <Eye className="size-4" />
                            </button>
                            <button
                              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-error"
                              title="حذف"
                            >
                              <Trash2 className="size-4" />
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

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="rounded-lg border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        نام فایل
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        قالب
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        تولید توسط
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        تاریخ
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        حجم
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        عملیات
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedPDFs.map((pdf) => (
                      <tr key={pdf.id} className="border-b border-border hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-brand">
                              <File className="size-4" />
                            </div>
                            <span className="font-medium text-foreground">{pdf.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{pdf.template}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{pdf.generatedBy}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {pdf.generatedAt}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{pdf.size}</td>
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
                              title="مشاهده"
                            >
                              <Eye className="size-4" />
                            </button>
                            <button
                              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-error"
                              title="حذف"
                            >
                              <Trash2 className="size-4" />
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

          {/* Template Editor Modal */}
          {showTemplateEditor && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="w-full max-w-6xl h-[90vh] rounded-lg border border-border bg-card flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">ویرایشگر قالب PDF</h2>
                    <p className="text-sm text-muted-foreground">عناصر را بکشید و رها کنید</p>
                  </div>
                  <button
                    onClick={() => setShowTemplateEditor(false)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <XCircle className="size-5" />
                  </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                  {/* Elements Panel */}
                  <div className="w-64 border-r border-border p-4 overflow-y-auto">
                    <h3 className="mb-4 text-sm font-semibold text-foreground">عناصر</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card cursor-move hover:border-brand/50">
                        <Type className="size-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">متن</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card cursor-move hover:border-brand/50">
                        <Image className="size-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">تصویر</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card cursor-move hover:border-brand/50">
                        <Table className="size-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">جدول</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card cursor-move hover:border-brand/50">
                        <Layout className="size-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">جداساز</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card cursor-move hover:border-brand/50">
                        <MousePointer2 className="size-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">مربع</span>
                      </div>
                    </div>

                    <h3 className="mt-6 mb-4 text-sm font-semibold text-foreground">تنظیمات</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">عرض صفحه</label>
                        <input
                          type="number"
                          defaultValue="210"
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">
                          ارتفاع صفحه
                        </label>
                        <input
                          type="number"
                          defaultValue="297"
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">
                          حاشیه (mm)
                        </label>
                        <input
                          type="number"
                          defaultValue="10"
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Canvas Area */}
                  <div className="flex-1 bg-muted/30 p-8 overflow-auto">
                    <div
                      className="bg-white shadow-lg mx-auto"
                      style={{ width: '210mm', height: '297mm', minHeight: '297mm' }}
                    >
                      <div className="p-4 border-2 border-dashed border-border/50 h-full">
                        <div className="text-center text-muted-foreground/50 text-sm mt-20">
                          <GripVertical className="mx-auto size-8 mb-2" />
                          <p>عناصر را اینجا بکشید و رها کنید</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Properties Panel */}
                  <div className="w-64 border-l border-border p-4 overflow-y-auto">
                    <h3 className="mb-4 text-sm font-semibold text-foreground">ویژگی‌ها</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">عنوان</label>
                        <input
                          type="text"
                          placeholder="عنوان قالب"
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">
                          دسته‌بندی
                        </label>
                        <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
                          <option>اداری</option>
                          <option>حقوقی</option>
                          <option>مالی</option>
                          <option>فنی</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">توضیحات</label>
                        <textarea
                          placeholder="توضیحات قالب"
                          rows={3}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                        />
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-border">
                      <button className="w-full rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
                        ذخیره قالب
                      </button>
                      <button className="w-full mt-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted">
                        پیش‌نمایش
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
