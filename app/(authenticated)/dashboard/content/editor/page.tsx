'use client'

import { useState } from 'react'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardTopbar } from '@/components/dashboard/dashboard-topbar'
import { Save, Eye, ArrowRight, Tag, Trash2 } from 'lucide-react'
import { RichTextEditor } from '@/components/molecules/rich-text-editor'
import { FileUploader } from '@/components/molecules/file-uploader'

const contentTypes = [
  { id: 'news', label: 'خبر' },
  { id: 'announcement', label: 'اطلاعیه' },
  { id: 'event', label: 'رویداد' },
  { id: 'gallery', label: 'گالری' },
  { id: 'banner', label: 'بنر' },
]

const departments = ['فناوری اطلاعات', 'روابط عمومی', 'تولید', 'اداری و مالی', 'پژوهش', 'آموزش']

export default function ContentEditorPage() {
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [body, setBody] = useState('')
  const [contentType, setContentType] = useState('news')
  const [department, setDepartment] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <a href="/dashboard/content" className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                  <ArrowRight className="size-5" />
                </a>
                <div>
                  <h1 className="text-heading-1 text-foreground">ایجاد محتوای جدید</h1>
                  <p className="text-xs text-muted-foreground">محتوای خود را ایجاد و ویرایش کنید</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                >
                  <Eye className="size-4" aria-hidden />
                  پیش‌نمایش
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover"
                >
                  <Save className="size-4" aria-hidden />
                  ذخیره پیش‌نویس
                </button>
              </div>
            </div>

            {/* Editor */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-4">
                {/* Title */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="عنوان محتوا..."
                    className="w-full bg-transparent text-heading-1 text-foreground outline-none placeholder:text-muted-foreground/50"
                  />
                </div>

                {/* Body */}
                <div className="rounded-2xl border border-border bg-card shadow-sm">
                  <RichTextEditor
                    content={body}
                    onChange={setBody}
                    placeholder="متن اصلی محتوا را بنویسید..."
                  />
                </div>

                {/* Excerpt */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <label className="mb-2 block text-sm font-medium text-foreground">خلاصه</label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="خلاصه‌ای کوتاه از محتوا..."
                    rows={3}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </div>

                {/* Media */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <label className="mb-3 block text-sm font-medium text-foreground">فایل‌های پیوست</label>
                  <FileUploader maxFiles={5} maxSize={10 * 1024 * 1024} />
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Status */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <h3 className="mb-3 text-sm font-bold text-foreground">انتشار</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">وضعیت</label>
                      <select className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20">
                        <option>پیش‌نویس</option>
                        <option>در انتظار بازبینی</option>
                        <option>منتشر شده</option>
                        <option>برنامه‌ریزی شده</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">تاریخ انتشار</label>
                      <input
                        type="datetime-local"
                        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Type */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <h3 className="mb-3 text-sm font-bold text-foreground">نوع محتوا</h3>
                  <div className="flex flex-wrap gap-2">
                    {contentTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setContentType(type.id)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                          contentType === type.id
                            ? 'bg-brand text-white'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Department */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <h3 className="mb-3 text-sm font-bold text-foreground">واحد سازمانی</h3>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  >
                    <option value="">انتخاب واحد...</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <h3 className="mb-3 text-sm font-bold text-foreground">برچسب‌ها</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="برچسب جدید..."
                      className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground hover:bg-muted/80"
                    >
                      <Tag className="size-4" />
                    </button>
                  </div>
                  {tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <span key={tag} className="flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1 text-xs text-brand">
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)} className="hover:text-error">
                            <Trash2 className="size-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
