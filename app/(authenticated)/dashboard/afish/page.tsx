/**
 * IRIB Digital Workplace Platform - Afish System Dashboard
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
  Table2,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Download,
  Lock,
  CheckCircle,
  Clock,
  FileText,
  XCircle,
  Save,
  Undo,
  Redo,
  Maximize2,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Loader2,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardTopbar } from '@/components/dashboard/dashboard-topbar'
import { useAfish } from '@/hooks/use-afish'

export default function AfishPage() {
  const [activeTab, setActiveTab] = useState('records')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSpreadsheetEditor, setShowSpreadsheetEditor] = useState(false)
  const [selectedCell, setSelectedCell] = useState({ row: 0, col: 0 })

  // Sample spreadsheet data
  const [spreadsheetData, setSpreadsheetData] = useState<any[][]>(
    Array.from({ length: 20 }, () => Array.from({ length: 10 }, () => ''))
  )

  const { records, templates, stats, loading, error } = useAfish()

  const tabs = [
    { id: 'records', label: 'Afichها', count: stats?.totalRecords || 0 },
    { id: 'templates', label: 'قالب‌ها', count: stats?.totalTemplates || 0 },
    { id: 'pending', label: 'در انتظار تأیید', count: stats?.pendingApproval || 0 },
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

  const statusStyles: Record<string, string> = {
    draft: 'bg-gray/10 text-gray-700',
    locked: 'bg-warning/10 text-warning',
    printed: 'bg-success/10 text-success',
    archived: 'bg-muted text-muted-foreground',
  }

  const statusLabels: Record<string, string> = {
    draft: 'پیش‌نویس',
    locked: 'قفل شده',
    printed: 'چاپ شده',
    archived: 'بایگانی شده',
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-heading-1 text-foreground">سیستم Afish</h1>
              <p className="text-sm text-muted-foreground">مدیریت فرم‌های Spreadsheet سازمانی</p>
            </div>
            <button
              onClick={() => setShowSpreadsheetEditor(true)}
              className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90"
            >
              <Plus className="size-4" />
              ایجاد Afish جدید
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-brand/10 p-2">
                  <Table2 className="size-5 text-brand" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">کل Afichها</p>
                  <p className="text-lg font-bold text-foreground">۲۳</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-success/10 p-2">
                  <CheckCircle className="size-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">چاپ شده</p>
                  <p className="text-lg font-bold text-foreground">۱۸</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-warning/10 p-2">
                  <Lock className="size-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">قفل شده</p>
                  <p className="text-lg font-bold text-foreground">۳</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-info/10 p-2">
                  <Clock className="size-5 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">در انتظار تأیید</p>
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
                placeholder="جستجو در Afichها..."
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

          {/* Records Tab */}
          {activeTab === 'records' && (
            <div className="rounded-lg border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        شماره
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        عنوان
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        وضعیت
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        تاریخ ایجاد
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        سطرها
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        تأیید توسط
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        عملیات
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record.id} className="border-b border-border hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm text-foreground">
                            {record.recordNumber}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-brand">
                              <Table2 className="size-4" />
                            </div>
                            <span className="font-medium text-foreground">{record.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[record.status]}`}
                          >
                            {statusLabels[record.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {record.createdAt}
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">{record.rows}</td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {record.approvedBy || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                              title="مشاهده"
                            >
                              <FileText className="size-4" />
                            </button>
                            <button
                              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                              title="دانلود PDF"
                            >
                              <Download className="size-4" />
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
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

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
                      <Table2 className="size-6" />
                    </div>
                    <button className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                      <MoreVertical className="size-4" />
                    </button>
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">{template.name}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">{template.description}</p>
                  <div className="mb-4">
                    <span className="rounded-full bg-accent px-2.5 py-1 text-xs text-foreground">
                      {template.columnCount} ستون
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>آخرین استفاده: {template.lastUsed}</span>
                  </div>
                  <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-brand/10 px-4 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand hover:text-white">
                    <Plus className="size-4" />
                    ایجاد Afish جدید
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Pending Tab */}
          {activeTab === 'pending' && (
            <div className="rounded-lg border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        شماره
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        عنوان
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        وضعیت
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        تاریخ ایجاد
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        سطرها
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        عملیات
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {records
                      .filter((r) => r.status === 'draft')
                      .map((record) => (
                        <tr key={record.id} className="border-b border-border hover:bg-muted/50">
                          <td className="px-4 py-3">
                            <span className="font-mono text-sm text-foreground">
                              {record.recordNumber}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-brand">
                                <Table2 className="size-4" />
                              </div>
                              <span className="font-medium text-foreground">{record.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[record.status]}`}
                            >
                              {statusLabels[record.status]}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {record.createdAt}
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">{record.rows}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                                title="تأیید"
                              >
                                <CheckCircle className="size-4" />
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
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Spreadsheet Editor Modal */}
          {showSpreadsheetEditor && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="w-full h-full rounded-lg border border-border bg-card flex flex-col">
                {/* Toolbar */}
                <div className="flex items-center justify-between p-3 border-b border-border bg-muted/50">
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 rounded hover:bg-muted text-muted-foreground"
                      title="ذخیره"
                    >
                      <Save className="size-4" />
                    </button>
                    <button
                      className="p-2 rounded hover:bg-muted text-muted-foreground"
                      title="بازگشت"
                    >
                      <Undo className="size-4" />
                    </button>
                    <button
                      className="p-2 rounded hover:bg-muted text-muted-foreground"
                      title="جلو"
                    >
                      <Redo className="size-4" />
                    </button>
                    <div className="w-px h-6 bg-border mx-2" />
                    <button
                      className="p-2 rounded hover:bg-muted text-muted-foreground"
                      title="بولد"
                    >
                      <Bold className="size-4" />
                    </button>
                    <button
                      className="p-2 rounded hover:bg-muted text-muted-foreground"
                      title="ایتالیک"
                    >
                      <Italic className="size-4" />
                    </button>
                    <div className="w-px h-6 bg-border mx-2" />
                    <button
                      className="p-2 rounded hover:bg-muted text-muted-foreground"
                      title="چپ‌چین"
                    >
                      <AlignLeft className="size-4" />
                    </button>
                    <button
                      className="p-2 rounded hover:bg-muted text-muted-foreground"
                      title="وسط‌چین"
                    >
                      <AlignCenter className="size-4" />
                    </button>
                    <button
                      className="p-2 rounded hover:bg-muted text-muted-foreground"
                      title="راست‌چین"
                    >
                      <AlignRight className="size-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 rounded hover:bg-muted text-muted-foreground"
                      title="تمام صفحه"
                    >
                      <Maximize2 className="size-4" />
                    </button>
                    <button
                      onClick={() => setShowSpreadsheetEditor(false)}
                      className="p-2 rounded hover:bg-muted text-muted-foreground"
                    >
                      <XCircle className="size-4" />
                    </button>
                  </div>
                </div>

                {/* Formula Bar */}
                <div className="flex items-center gap-2 p-2 border-b border-border bg-muted/30">
                  <span className="text-sm text-muted-foreground w-16">FX:</span>
                  <input
                    type="text"
                    placeholder="فرمول..."
                    className="flex-1 rounded border border-border bg-background px-3 py-1 text-sm text-foreground"
                  />
                </div>

                {/* Spreadsheet Grid */}
                <div className="flex-1 overflow-auto">
                  <table className="border-collapse">
                    <thead>
                      <tr>
                        <th className="sticky top-0 left-0 z-10 w-10 bg-muted border border-border p-0">
                          <div className="h-6 w-full flex items-center justify-center text-xs text-muted-foreground">
                            #
                          </div>
                        </th>
                        {Array.from({ length: 10 }, (_, i) => (
                          <th
                            key={i}
                            className="sticky top-0 z-10 min-w-[100px] bg-muted border border-border p-0"
                          >
                            <div className="h-6 w-full flex items-center justify-center text-xs text-muted-foreground font-semibold">
                              {String.fromCharCode(65 + i)}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {spreadsheetData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          <td className="sticky left-0 z-10 w-10 bg-muted border border-border p-0">
                            <div className="h-8 w-full flex items-center justify-center text-xs text-muted-foreground font-semibold">
                              {rowIndex + 1}
                            </div>
                          </td>
                          {row.map((cell, colIndex) => (
                            <td
                              key={colIndex}
                              className={`min-w-[100px] border border-border p-0 ${
                                selectedCell.row === rowIndex && selectedCell.col === colIndex
                                  ? 'bg-brand/10'
                                  : 'bg-background'
                              }`}
                              onClick={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                            >
                              <input
                                type="text"
                                value={cell}
                                onChange={(e) => {
                                  const newData = [...spreadsheetData]
                                  newData[rowIndex][colIndex] = e.target.value
                                  setSpreadsheetData(newData)
                                }}
                                className="w-full h-8 px-2 text-sm text-foreground bg-transparent focus:outline-none"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between p-2 border-t border-border bg-muted/50 text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>
                      سلول: {String.fromCharCode(65 + selectedCell.col)}
                      {selectedCell.row + 1}
                    </span>
                    <span>سطرها: {spreadsheetData.length}</span>
                    <span>ستون‌ها: {spreadsheetData[0]?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1 rounded hover:bg-muted">+ سطر</button>
                    <button className="p-1 rounded hover:bg-muted">+ ستون</button>
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
