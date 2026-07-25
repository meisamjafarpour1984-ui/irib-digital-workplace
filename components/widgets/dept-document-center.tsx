'use client'

import { Download, Eye, FileText, FileSpreadsheet, Image, File } from 'lucide-react'
import type { WidgetProps } from './types'

const documents = [
  { id: 'd1', title: 'دستورالعمل امنیت اطلاعات', type: 'PDF', size: '۲.۴ MB', date: '۱۴۰۴/۰۳/۱۰' },
  { id: 'd2', title: 'راهنمای استفاده از سامانه تیکتینگ', type: 'PDF', size: '۱.۸ MB', date: '۱۴۰۴/۰۳/۰۸' },
  { id: 'd3', title: 'فهرست نرم‌افزارهای مجاز', type: 'Excel', size: '۵۶۰ KB', date: '۱۴۰۴/۰۳/۰۵' },
  { id: 'd4', title: 'گزارش عملکرد فصل اول', type: 'Word', size: '۳.۲ MB', date: '۱۴۰۴/۰۲/۲۸' },
  { id: 'd5', title: 'تصاویر نشست مدیران', type: 'ZIP', size: '۱۵ MB', date: '۱۴۰۴/۰۲/۲۰' },
]

const typeIcons: Record<string, typeof FileText> = {
  PDF: FileText,
  Excel: FileSpreadsheet,
  Word: FileText,
  ZIP: File,
  Image: Image,
}

const typeColors: Record<string, string> = {
  PDF: 'bg-error/10 text-error',
  Excel: 'bg-success/10 text-success',
  Word: 'bg-info/10 text-info',
  ZIP: 'bg-warning/10 text-warning',
  Image: 'bg-brand/10 text-brand',
}

export function DeptDocumentCenterWidget({ config }: WidgetProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-brand" aria-hidden />
          <h2 className="text-sm font-bold text-foreground">مرکز اسناد</h2>
        </div>
        <span className="text-xs text-muted-foreground">{documents.length} سند</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-2.5 text-right text-xs font-medium text-muted-foreground">عنوان</th>
              <th className="p-2.5 text-right text-xs font-medium text-muted-foreground">نوع</th>
              <th className="p-2.5 text-right text-xs font-medium text-muted-foreground">حجم</th>
              <th className="p-2.5 text-right text-xs font-medium text-muted-foreground">تاریخ</th>
              <th className="p-2.5 text-center text-xs font-medium text-muted-foreground">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => {
              const Icon = typeIcons[doc.type] || FileText
              return (
                <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="p-2.5">
                    <div className="flex items-center gap-2">
                      <div className={`flex size-7 shrink-0 items-center justify-center rounded-md ${typeColors[doc.type] || 'bg-muted'}`}>
                        <Icon className="size-3.5" aria-hidden />
                      </div>
                      <span className="text-sm text-foreground">{doc.title}</span>
                    </div>
                  </td>
                  <td className="p-2.5 text-xs text-muted-foreground">{doc.type}</td>
                  <td className="p-2.5 text-xs text-muted-foreground">{doc.size}</td>
                  <td className="p-2.5 text-xs text-muted-foreground tabular-nums">{doc.date}</td>
                  <td className="p-2.5">
                    <div className="flex items-center justify-center gap-1">
                      <button type="button" className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="مشاهده">
                        <Eye className="size-3.5" />
                      </button>
                      <button type="button" className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="دانلود">
                        <Download className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
