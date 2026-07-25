'use client'

import { useState } from 'react'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardTopbar } from '@/components/dashboard/dashboard-topbar'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import {
  FileText, Image, Video, Megaphone, ClipboardList, Calendar,
  ChevronDown, ChevronUp, MoreHorizontal, Edit, Eye
} from 'lucide-react'

type ContentStatus = 'پیش‌نویس' | 'بازبینی' | 'تایید شده' | 'منتشر شده' | 'برنامه‌ریزی شده' | 'بایگانی شده'

interface ContentRow {
  id: string
  title: string
  type: 'خبر' | 'اطلاعیه' | 'گالری' | 'رویداد' | 'فراخوان' | 'ویدیو'
  status: ContentStatus
  department: string
  author: string
  createdAt: string
  publishedAt: string | null
}

const statusStyles: Record<ContentStatus, string> = {
  'پیش‌نویس': 'bg-muted text-muted-foreground',
  'بازبینی': 'bg-warning/10 text-warning',
  'تایید شده': 'bg-info/10 text-info',
  'منتشر شده': 'bg-success/10 text-success',
  'برنامه‌ریزی شده': 'bg-brand/10 text-brand',
  'بایگانی شده': 'bg-muted text-muted-foreground',
}

const typeIcons: Record<string, typeof FileText> = {
  'خبر': FileText,
  'اطلاعیه': Megaphone,
  'گالری': Image,
  'رویداد': Calendar,
  'فراخوان': ClipboardList,
  'ویدیو': Video,
}

const contentData: ContentRow[] = [
  { id: '1', title: 'برگزاری نشست هم‌اندیشی مدیران صدا و سیمای استان', type: 'خبر', status: 'منتشر شده', department: 'روابط عمومی', author: 'محمد احمدی', createdAt: '۱۴۰۴/۰۳/۱۲', publishedAt: '۱۴۰۴/۰۳/۱۲' },
  { id: '2', title: 'انعقاد تفاهم‌نامه همکاری با دانشگاه تبریز', type: 'خبر', status: 'منتشر شده', department: 'روابط عمومی', author: 'علی رضایی', createdAt: '۱۴۰۴/۰۳/۱۱', publishedAt: '۱۴۰۴/۰۳/۱۱' },
  { id: '3', title: 'اطلاعیه شماره ۱۴۰۲ در خصوص بیمه تکمیلی', type: 'اطلاعیه', status: 'بازبینی', department: 'اداری و مالی', author: 'سارا موسوی', createdAt: '۱۴۰۴/۰۳/۱۰', publishedAt: null },
  { id: '4', title: 'جشنواره موسیقی نواحی', type: 'گالری', status: 'تایید شده', department: 'فرهنگ و هنر', author: 'رضا کریمی', createdAt: '۱۴۰۴/۰۳/۰۹', publishedAt: null },
  { id: '5', title: 'فراخوان ایده‌های نو در تولید محتوا', type: 'فراخوان', status: 'پیش‌نویس', department: 'تولید', author: 'مریم حسنی', createdAt: '۱۴۰۴/۰۳/۰۸', publishedAt: null },
  { id: '6', title: 'گزارش تصویری بازدید رئیس سازمان', type: 'ویدیو', status: 'برنامه‌ریزی شده', department: 'روابط عمومی', author: 'محمد احمدی', createdAt: '۱۴۰۴/۰۳/۰۷', publishedAt: '۱۴۰۴/۰۳/۱۵' },
  { id: '7', title: 'نمایشگاه هنر و رسانه (ایران‌کت)', type: 'رویداد', status: 'منتشر شده', department: 'فرهنگ و هنر', author: 'علی رضایی', createdAt: '۱۴۰۴/۰۳/۰۶', publishedAt: '۱۴۰۴/۰۳/۰۶' },
  { id: '8', title: 'آموزش کار با سامانه جدید تیکتینگ', type: 'اطلاعیه', status: 'بایگانی شده', department: 'فناوری اطلاعات', author: 'رضا کریمی', createdAt: '۱۴۰۴/۰۲/۲۸', publishedAt: '۱۴۰۴/۰۲/۲۸' },
]

const columns: ColumnDef<ContentRow>[] = [
  {
    accessorKey: 'title',
    header: 'عنوان',
    cell: ({ row }) => {
      const Icon = typeIcons[row.original.type] || FileText
      return (
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-brand">
            <Icon className="size-4" aria-hidden />
          </div>
          <span className="text-sm font-medium text-foreground">{row.original.title}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'type',
    header: 'نوع',
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{row.original.type}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'وضعیت',
    cell: ({ row }) => (
      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[row.original.status]}`}>
        {row.original.status}
      </span>
    ),
  },
  {
    accessorKey: 'department',
    header: 'واحد',
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{row.original.department}</span>
    ),
  },
  {
    accessorKey: 'author',
    header: 'نویسنده',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="flex size-6 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-brand">
          {row.original.author.slice(0, 1)}
        </div>
        <span className="text-xs text-foreground">{row.original.author}</span>
      </div>
    ),
  },
  {
    accessorKey: 'publishedAt',
    header: 'تاریخ انتشار',
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground tabular-nums">
        {row.original.publishedAt || '—'}
      </span>
    ),
  },
  {
    id: 'actions',
    header: '',
    cell: () => (
      <div className="flex items-center gap-1">
        <button type="button" className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="مشاهده">
          <Eye className="size-3.5" />
        </button>
        <button type="button" className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="ویرایش">
          <Edit className="size-3.5" />
        </button>
        <button type="button" className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="گزینه‌ها">
          <MoreHorizontal className="size-3.5" />
        </button>
      </div>
    ),
  },
]

const tabs = ['همه محتوا', 'در حال بازبینی', 'برنامه‌ریزی شده', 'بایگانی', 'رسانه']

export default function ContentManagerPage() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [activeTab, setActiveTab] = useState('همه محتوا')

  const table = useReactTable({
    data: contentData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-heading-1 text-foreground">مدیریت محتوا</h1>
              <p className="text-sm text-muted-foreground">ایجاد، ویرایش و انتشار محتوا</p>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover"
            >
              <FileText className="size-4" aria-hidden />
              محتوای جدید
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab ? 'bg-brand text-white' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <input
              type="search"
              placeholder="جستجو در محتوا..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full rounded-xl border border-input bg-card py-2.5 pr-3 pl-3 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              aria-label="جستجو در محتوا"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-border">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="p-3 text-right text-xs font-medium text-muted-foreground"
                      >
                        {header.isPlaceholder ? null : (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className="flex items-center gap-1"
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{ asc: <ChevronUp className="size-3" />, desc: <ChevronDown className="size-3" /> }[header.column.getIsSorted() as string] ?? null}
                          </button>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  )
}
