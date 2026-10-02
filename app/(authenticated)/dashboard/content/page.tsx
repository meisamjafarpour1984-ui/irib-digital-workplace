'use client'

import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic'
import {
  FileText,
  Image,
  Video,
  Megaphone,
  ClipboardList,
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit,
  Eye,
  Trash2,
  Archive,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  CheckSquare,
  Square,
  Clock,
  Send,
  XCircle,
  CheckCircle,
} from 'lucide-react'
import { contentApi } from '@/lib/services/content'
import { useRouter } from 'next/navigation'

type ContentStatus =
  'پیش‌نویس' | 'بازبینی' | 'تایید شده' | 'منتشر شده' | 'برنامه‌ریزی شده' | 'بایگانی شده'

interface ContentRow {
  id: string
  title: string
  type: string
  status: ContentStatus
  department: string
  author: string
  createdAt: string
  publishedAt: string | null
  scheduledAt?: string | null
}

const statusStyles: Record<ContentStatus, string> = {
  پیش‌نویس: 'bg-muted text-muted-foreground',
  بازبینی: 'bg-warning/10 text-warning',
  'تایید شده': 'bg-info/10 text-info',
  'منتشر شده': 'bg-success/10 text-success',
  'برنامه‌ریزی شده': 'bg-brand/10 text-brand',
  'بایگانی شده': 'bg-muted text-muted-foreground',
}

const typeIcons: Record<string, typeof FileText> = {
  خبر: FileText,
  اطلاعیه: Megaphone,
  گالری: Image,
  رویداد: Calendar,
  فراخوان: ClipboardList,
  ویدیو: Video,
}

const statusMapping: Record<string, ContentStatus> = {
  DRAFT: 'پیش‌نویس',
  REVIEW: 'بازبینی',
  APPROVED: 'تایید شده',
  PUBLISHED: 'منتشر شده',
  SCHEDULED: 'برنامه‌ریزی شده',
  ARCHIVED: 'بایگانی شده',
}

const typeMapping: Record<string, string> = {
  NEWS: 'خبر',
  ANNOUNCEMENT: 'اطلاعیه',
  EVENT: 'رویداد',
  GALLERY: 'گالری',
  BANNER: 'بنر',
  FILE: 'فایل',
  VIDEO: 'ویدیو',
}

const tabs = ['همه محتوا', 'منتشر شده', 'در حال بازبینی', 'برنامه‌ریزی شده', 'بایگانی', 'رسانه']

interface SavedContentItem {
  id: string
  title: string
  contentType: string
  status: string
  content?: string
  tags?: string[]
  published?: boolean
  featured?: boolean
  scheduledAt?: string
  expiresAt?: string
  createdAt: string
  updatedAt?: string
  publishedAt?: string
}

export default function ContentManagerPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [activeTab, setActiveTab] = useState('همه محتوا')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Listen for localStorage changes to auto-refresh
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'savedContent') {
        queryClient.invalidateQueries({ queryKey: ['content-list'] })
      }
    }

    // Also listen for custom event from same tab
    const handleContentUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['content-list'] })
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('contentUpdated', handleContentUpdate)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('contentUpdated', handleContentUpdate)
    }
  }, [queryClient])

  const {
    data: contentList,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['content-list', activeTab, page, pageSize],
    queryFn: async () => {
      // Try localStorage first
      const savedContent = JSON.parse(localStorage.getItem('savedContent') || '[]')

      const now = new Date()
      const processedContent = savedContent.map((item: SavedContentItem) => {
        // Auto-publish scheduled content whose time has passed
        if (item.status === 'SCHEDULED' && item.scheduledAt && new Date(item.scheduledAt) <= now) {
          return { ...item, status: 'PUBLISHED', publishedAt: now.toISOString() }
        }
        // Auto-archive expired content
        if (item.expiresAt && new Date(item.expiresAt) < now && item.status !== 'ARCHIVED') {
          return { ...item, status: 'ARCHIVED' }
        }
        return item
      })

      // Save updated content if any was auto-published or auto-archived
      if (JSON.stringify(processedContent) !== JSON.stringify(savedContent)) {
        localStorage.setItem('savedContent', JSON.stringify(processedContent))
      }

      // Filter by status based on active tab
      const statusMap: Record<string, string> = {
        'همه محتوا': '',
        'منتشر شده': 'PUBLISHED',
        'در حال بازبینی': 'REVIEW',
        'برنامه‌ریزی شده': 'SCHEDULED',
        بایگانی: 'ARCHIVED',
        رسانه: '',
      }

      let filteredContent = processedContent
      if (statusMap[activeTab]) {
        filteredContent = processedContent.filter(
          (item: SavedContentItem) => item.status === statusMap[activeTab]
        )
      }

      const mappedContent = filteredContent.map((item: SavedContentItem) => ({
        id: item.id,
        title: item.title,
        type: typeMapping[item.contentType] || item.contentType,
        status: statusMapping[item.status] || item.status,
        department: '—',
        author: 'کاربر',
        createdAt: new Date(item.createdAt).toLocaleDateString('fa-IR'),
        publishedAt: item.publishedAt
          ? new Date(item.publishedAt).toLocaleDateString('fa-IR')
          : null,
        scheduledAt: item.scheduledAt
          ? new Date(item.scheduledAt).toLocaleDateString('fa-IR')
          : null,
      }))

      return {
        items: mappedContent,
        pagination: {
          page: 1,
          pageSize: 20,
          total: mappedContent.length,
          totalPages: Math.ceil(mappedContent.length / 20),
        },
      }
    },
    staleTime: 60_000,
  })

  const handleCreate = () => {
    router.push('/dashboard/content/editor')
  }

  const handlePreview = (id: string) => {
    // Load content from localStorage
    const savedContent = JSON.parse(localStorage.getItem('savedContent') || '[]')
    const content = savedContent.find((item: SavedContentItem) => item.id === id)

    if (content) {
      const previewData = {
        title: content.title,
        contentType: content.contentType.toLowerCase(),
        content: content.content,
        tags: content.tags || [],
        published: content.published || false,
        featured: content.featured || false,
      }
      const previewUrl = `/dashboard/content/preview?data=${encodeURIComponent(JSON.stringify(previewData))}`
      window.open(previewUrl, '_blank')
    } else {
      alert('محتوا یافت نشد')
    }
  }

  const handleEdit = (id: string) => {
    router.push(`/dashboard/content/editor?id=${id}`)
  }

  const handleDelete = async (id: string) => {
    if (confirm('آیا از حذف این محتوا اطمینان دارید؟')) {
      try {
        await contentApi.remove(id)
        window.location.reload()
      } catch (error) {
        console.error('خطا در حذف محتوا:', error)
      }
    }
  }

  const handleArchive = async (id: string) => {
    try {
      await contentApi.archive(id)
      window.location.reload()
    } catch (error) {
      console.error('خطا در بایگانی محتوا:', error)
    }
  }

  // Review workflow handlers
  const handleSubmitForReview = async (id: string) => {
    try {
      const result = await contentApi.submitForReview(id)
      if (result === undefined) {
        // Endpoint not available yet
        alert('قابلیت بازبینی هنوز در backend فعال نشده است. لطفاً از دکمه انتشار استفاده کنید.')
      } else {
        window.location.reload()
      }
    } catch (error: unknown) {
      console.error('خطا در ارسال برای بازبینی:', error)
      alert('خطا در ارسال برای بازبینی')
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const result = await contentApi.approve(id)
      if (result === undefined) {
        alert('قابلیت تایید هنوز در backend فعال نشده است.')
      } else {
        window.location.reload()
      }
    } catch (error: unknown) {
      console.error('خطا در تایید محتوا:', error)
      alert('خطا در تایید محتوا')
    }
  }

  const handleReject = async (id: string) => {
    if (confirm('آیا از رد این محتوا اطمینان دارید؟')) {
      try {
        const result = await contentApi.reject(id)
        if (result === undefined) {
          alert('قابلیت رد هنوز در backend فعال نشده است.')
        } else {
          window.location.reload()
        }
      } catch (error: unknown) {
        console.error('خطا در رد محتوا:', error)
        alert('خطا در رد محتوا')
      }
    }
  }

  // Scheduling handlers
  const handleSchedule = async (id: string) => {
    const scheduledDate = prompt('تاریخ و زمان انتشار را وارد کنید (ISO 8601 format):')
    if (scheduledDate) {
      try {
        const date = new Date(scheduledDate)
        if (isNaN(date.getTime())) {
          alert('فرمت تاریخ نامعتبر است')
          return
        }
        const result = await contentApi.schedule(id, date)
        if (result === undefined) {
          alert('قابلیت برنامه‌ریزی هنوز در backend فعال نشده است.')
        } else {
          window.location.reload()
        }
      } catch (error: unknown) {
        console.error('خطا در برنامه‌ریزی محتوا:', error)
        alert('خطا در برنامه‌ریزی محتوا')
      }
    }
  }

  const handleUnschedule = async (id: string) => {
    if (confirm('آیا از حذف برنامه‌ریزی اطمینان دارید؟')) {
      try {
        const result = await contentApi.unschedule(id)
        if (result === undefined) {
          alert('قابلیت حذف برنامه‌ریزی هنوز در backend فعال نشده است.')
        } else {
          window.location.reload()
        }
      } catch (error: unknown) {
        console.error('خطا در حذف برنامه‌ریزی:', error)
        alert('خطا در حذف برنامه‌ریزی')
      }
    }
  }

  const handleBulkPublish = async () => {
    if (selectedIds.size === 0) return
    try {
      await Promise.all(Array.from(selectedIds).map((id) => contentApi.publish(id)))
      setSelectedIds(new Set())
      window.location.reload()
    } catch (error) {
      console.error('خطا در انتشار گروهی:', error)
    }
  }

  const handleBulkArchive = async () => {
    if (selectedIds.size === 0) return
    try {
      await Promise.all(Array.from(selectedIds).map((id) => contentApi.archive(id)))
      setSelectedIds(new Set())
      window.location.reload()
    } catch (error: unknown) {
      console.error('خطا در بایگانی گروهی:', error)
      alert('خطا در بایگانی گروهی: ' + (error instanceof Error ? error.message : 'خطای ناشناخته'))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`آیا از حذف ${selectedIds.size} مورد اطمینان دارید؟`)) return
    try {
      await Promise.all(Array.from(selectedIds).map((id) => contentApi.remove(id)))
      setSelectedIds(new Set())
      window.location.reload()
    } catch (error) {
      console.error('خطا در حذف گروهی:', error)
    }
  }

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === contentList?.items.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(contentList?.items.map((item: ContentRow) => item.id) || []))
    }
  }

  const columns: ColumnDef<ContentRow>[] = [
    {
      id: 'select',
      enableSorting: false,
      header: () => (
        <div
          onClick={toggleSelectAll}
          className="flex size-5 cursor-pointer items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted"
          aria-label="انتخاب همه"
          role="button"
          tabIndex={0}
        >
          {selectedIds.size === contentList?.items.length ? (
            <CheckSquare className="size-4" />
          ) : (
            <Square className="size-4" />
          )}
        </div>
      ),
      cell: ({ row }) => (
        <div
          onClick={() => toggleSelection(row.original.id)}
          className="flex size-5 cursor-pointer items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted"
          aria-label={`انتخاب ${row.original.title}`}
          role="button"
          tabIndex={0}
        >
          {selectedIds.has(row.original.id) ? (
            <CheckSquare className="size-4" />
          ) : (
            <Square className="size-4" />
          )}
        </div>
      ),
    },
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
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.type}</span>,
    },
    {
      accessorKey: 'status',
      header: 'وضعیت',
      cell: ({ row }) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[row.original.status]}`}
        >
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
      cell: ({ row }) => {
        const isScheduled = row.original.status === 'برنامه‌ریزی شده'
        return (
          <span className="text-xs text-muted-foreground tabular-nums">
            {isScheduled && row.original.scheduledAt ? (
              <span className="text-brand">{row.original.scheduledAt}</span>
            ) : (
              row.original.publishedAt || '—'
            )}
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const isReviewStatus = row.original.status === 'بازبینی'
        const isScheduledStatus = row.original.status === 'برنامه‌ریزی شده'
        const isDraftStatus = row.original.status === 'پیش‌نویس'
        const isApprovedStatus = row.original.status === 'تایید شده'

        return (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handlePreview(row.original.id)
              }}
              className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="پیش‌نمایش"
            >
              <Eye className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleEdit(row.original.id)
              }}
              className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="ویرایش"
            >
              <Edit className="size-3.5" />
            </button>

            {/* Review workflow actions */}
            {isDraftStatus && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSubmitForReview(row.original.id)
                }}
                className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-warning/10 hover:text-warning"
                aria-label="ارسال برای بازبینی"
                title="ارسال برای بازبینی"
              >
                <Send className="size-3.5" />
              </button>
            )}

            {isReviewStatus && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleApprove(row.original.id)
                  }}
                  className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-success/10 hover:text-success"
                  aria-label="تایید"
                  title="تایید"
                >
                  <CheckCircle className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleReject(row.original.id)
                  }}
                  className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-error/10 hover:text-error"
                  aria-label="رد"
                  title="رد"
                >
                  <XCircle className="size-3.5" />
                </button>
              </>
            )}

            {/* Scheduling actions */}
            {(isDraftStatus || isApprovedStatus) && !isScheduledStatus && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSchedule(row.original.id)
                }}
                className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-brand/10 hover:text-brand"
                aria-label="برنامه‌ریزی"
                title="برنامه‌ریزی"
              >
                <Clock className="size-3.5" />
              </button>
            )}

            {isScheduledStatus && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleUnschedule(row.original.id)
                }}
                className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-warning/10 hover:text-warning"
                aria-label="حذف برنامه‌ریزی"
                title="حذف برنامه‌ریزی"
              >
                <XCircle className="size-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleArchive(row.original.id)
              }}
              className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="بایگانی"
            >
              <Archive className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleDelete(row.original.id)
              }}
              className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-error/10 hover:text-error"
              aria-label="حذف"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: contentList?.items || [],
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <main className="flex-1 space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-heading-1 text-foreground">مدیریت محتوا</h1>
              <p className="text-sm text-muted-foreground">ایجاد، ویرایش و انتشار محتوا</p>
            </div>
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <>
                  <span className="text-sm text-muted-foreground">
                    {selectedIds.size.toLocaleString('fa-IR')} مورد انتخاب شده
                  </span>
                  <button
                    type="button"
                    onClick={handleBulkPublish}
                    className="flex items-center gap-2 rounded-lg border border-brand px-3 py-2 text-sm font-medium text-brand transition-colors hover:bg-brand/5"
                  >
                    <Check className="size-4" />
                    انتشار
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkArchive}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <Archive className="size-4" />
                    بایگانی
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2 rounded-lg bg-error/10 px-3 py-2 text-sm font-medium text-error transition-colors hover:bg-error/20"
                  >
                    <Trash2 className="size-4" />
                    حذف
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIds(new Set())}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <X className="size-4" />
                    لغو
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={handleCreate}
                className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover"
              >
                <FileText className="size-4" aria-hidden />
                محتوای جدید
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-brand text-brand'
                    : 'text-muted-foreground hover:text-foreground'
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
          {isLoading ? (
            <div className="flex items-center justify-center rounded-2xl border border-border bg-card p-12">
              <p className="text-sm text-muted-foreground">در حال بارگذاری...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center rounded-2xl border border-border bg-card p-12">
              <p className="text-sm text-error">خطا در بارگذاری محتوا</p>
            </div>
          ) : (
            <>
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
                            {header.isPlaceholder ? null : header.column.getCanSort() ? (
                              <button
                                type="button"
                                onClick={header.column.getToggleSortingHandler()}
                                className="flex items-center gap-1"
                              >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                {{
                                  asc: <ChevronUp className="size-3" />,
                                  desc: <ChevronDown className="size-3" />,
                                }[header.column.getIsSorted() as string] ?? null}
                              </button>
                            ) : (
                              flexRender(header.column.columnDef.header, header.getContext())
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={columns.length}
                          className="p-12 text-center text-muted-foreground"
                        >
                          محتوایی یافت نشد
                        </td>
                      </tr>
                    ) : (
                      table.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer"
                          onClick={() => handleEdit(row.original.id)}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="p-3">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {contentList?.pagination && contentList.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
                  <p className="text-sm text-muted-foreground">
                    صفحه {contentList.pagination.page.toLocaleString('fa-IR')} از{' '}
                    {contentList.pagination.totalPages.toLocaleString('fa-IR')}
                    {' · '}
                    {contentList.pagination.total.toLocaleString('fa-IR')} مورد
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="صفحه قبل"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                    {Array.from(
                      { length: Math.min(5, contentList.pagination.totalPages) },
                      (_, i) => {
                        const pageNum = i + 1
                        const isCurrentPage = pageNum === page
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => setPage(pageNum)}
                            className={`flex size-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                              isCurrentPage
                                ? 'bg-brand text-white'
                                : 'text-muted-foreground hover:bg-muted'
                            }`}
                          >
                            {pageNum.toLocaleString('fa-IR')}
                          </button>
                        )
                      }
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setPage((p) => Math.min(contentList.pagination.totalPages, p + 1))
                      }
                      disabled={page === contentList.pagination.totalPages}
                      className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="صفحه بعد"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
  )
}
