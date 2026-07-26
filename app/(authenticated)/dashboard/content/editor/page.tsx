'use client'

import { useEffect, useState } from 'react'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardTopbar } from '@/components/dashboard/dashboard-topbar'
import { Save, Eye, ArrowRight, Tag, Trash2 } from 'lucide-react'
import { RichTextEditor } from '@/components/molecules/rich-text-editor'
import { FileUploader } from '@/components/molecules/file-uploader'
import {
  contentApi,
  localizedText,
  type ContentType,
  type DepartmentOption,
} from '@/lib/services/content'

const contentTypes = [
  { id: 'NEWS', label: 'خبر' },
  { id: 'ANNOUNCEMENT', label: 'اطلاعیه' },
  { id: 'EVENT', label: 'رویداد' },
  { id: 'GALLERY', label: 'گالری' },
  { id: 'BANNER', label: 'بنر' },
] satisfies Array<{ id: ContentType; label: string }>

export default function ContentEditorPage() {
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [body, setBody] = useState('')
  const [contentType, setContentType] = useState<ContentType>('NEWS')
  const [department, setDepartment] = useState('')
  const [departments, setDepartments] = useState<DepartmentOption[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [contentId, setContentId] = useState('')
  const [savedSlug, setSavedSlug] = useState('')
  const [savedVersion, setSavedVersion] = useState(0)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    let active = true
    contentApi
      .listDepartments()
      .then((items) => {
        if (active) setDepartments(items)
      })
      .catch(() => {
        if (active) setDepartments([])
      })
    return () => {
      active = false
    }
  }, [])

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const saveDraft = async () => {
    setSaving(true)
    setSaveError('')
    setSaveMessage('')
    try {
      const input = {
        contentType,
        title: title.trim(),
        excerpt: excerpt.trim() || undefined,
        body: body || undefined,
        tagNames: tags,
        scopeIds: department ? [department] : [],
      }
      const saved = contentId
        ? await contentApi.update(contentId, { ...input, expectedVersion: savedVersion })
        : await contentApi.create(input)
      setContentId(saved.id)
      setSavedSlug(saved.slug)
      setSavedVersion(saved.version)
      setPublished(false)
      setSaveMessage(`پیش‌نویس نسخه ${saved.version.toLocaleString('fa-IR')} ذخیره شد.`)
    } catch (caught) {
      setSaveError(caught instanceof Error ? caught.message : 'ذخیره پیش‌نویس انجام نشد')
    } finally {
      setSaving(false)
    }
  }

  const publishContent = async () => {
    if (!contentId) return
    setPublishing(true)
    setSaveError('')
    setSaveMessage('')
    try {
      const record = await contentApi.publish(contentId)
      setPublished(true)
      setSavedSlug(record.slug)
      setSaveMessage('محتوا منتشر شد و اکنون در صفحه عمومی در دسترس است.')
    } catch (caught) {
      setSaveError(caught instanceof Error ? caught.message : 'انتشار محتوا انجام نشد')
    } finally {
      setPublishing(false)
    }
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
                <a
                  href="/dashboard/content"
                  className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                >
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
                  onClick={() => {
                    if (published && savedSlug) {
                      window.open(`/news/${savedSlug}`, '_blank', 'noopener')
                    }
                  }}
                  disabled={!published || !savedSlug}
                  className="flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Eye className="size-4" aria-hidden />
                  پیش‌نمایش
                </button>
                <button
                  type="button"
                  onClick={() => void saveDraft()}
                  disabled={saving || title.trim().length < 3}
                  className="flex min-h-11 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save className={`size-4 ${saving ? 'animate-pulse' : ''}`} aria-hidden />
                  {saving ? 'در حال ذخیره...' : 'ذخیره پیش‌نویس'}
                </button>
                <button
                  type="button"
                  onClick={() => void publishContent()}
                  disabled={!contentId || saving || publishing || published}
                  className="flex min-h-11 items-center gap-2 rounded-lg border border-brand px-4 text-sm font-semibold text-brand transition-colors hover:bg-brand/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {publishing ? 'در حال انتشار...' : published ? 'منتشر شده' : 'انتشار'}
                </button>
              </div>
            </div>

            {(saveError || saveMessage) && (
              <div
                role={saveError ? 'alert' : 'status'}
                className={`rounded-xl border px-4 py-3 text-sm ${
                  saveError
                    ? 'border-error/20 bg-error/5 text-error'
                    : 'border-success/20 bg-success/5 text-success'
                }`}
              >
                {saveError || saveMessage}
                {savedSlug && !saveError && (
                  <span className="ms-2 text-muted-foreground">
                    شناسه: {contentId.slice(0, 8)} · نسخه {savedVersion.toLocaleString('fa-IR')}
                  </span>
                )}
              </div>
            )}

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
                  <label className="mb-3 block text-sm font-medium text-foreground">
                    فایل‌های پیوست
                  </label>
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
                      <div className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground">
                        {published
                          ? 'منتشر شده'
                          : contentId
                            ? 'پیش‌نویس ذخیره‌شده'
                            : 'پیش‌نویس جدید'}
                      </div>
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
                      <option key={dept.id} value={dept.id}>
                        {localizedText(dept.name)}
                      </option>
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
                        <span
                          key={tag}
                          className="flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-1 text-xs text-brand"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-error"
                          >
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
