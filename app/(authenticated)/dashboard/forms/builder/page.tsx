'use client'

import { useState } from 'react'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardTopbar } from '@/components/dashboard/dashboard-topbar'
import {
  Plus,
  Trash2,
  GripVertical,
  Settings,
  Eye,
  Save,
  Type,
  AlignLeft,
  Hash,
  Calendar,
  List,
  CheckSquare,
  ToggleLeft,
  Upload,
  Table,
} from 'lucide-react'

interface FormField {
  id: string
  type:
    'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'toggle' | 'file' | 'table'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

const fieldTypes = [
  { type: 'text' as const, label: 'متن', icon: Type },
  { type: 'textarea' as const, label: 'متن بلند', icon: AlignLeft },
  { type: 'number' as const, label: 'عدد', icon: Hash },
  { type: 'date' as const, label: 'تاریخ', icon: Calendar },
  { type: 'select' as const, label: 'لیست انتخاب', icon: List },
  { type: 'checkbox' as const, label: 'چک‌باکس', icon: CheckSquare },
  { type: 'toggle' as const, label: 'کلید', icon: ToggleLeft },
  { type: 'file' as const, label: 'آپلود فایل', icon: Upload },
  { type: 'table' as const, label: 'جدول', icon: Table },
]

export default function FormBuilderPage() {
  const [fields, setFields] = useState<FormField[]>([
    {
      id: 'f1',
      type: 'text',
      label: 'نام و نام خانوادگی',
      placeholder: 'نام کامل',
      required: true,
    },
    { id: 'f2', type: 'text', label: 'کد پرسنلی', placeholder: 'مثال: ۱۲۳۴۵', required: true },
    {
      id: 'f3',
      type: 'select',
      label: 'واحد سازمانی',
      required: true,
      options: ['فناوری اطلاعات', 'تولید', 'اداری', 'پژوهش'],
    },
    {
      id: 'f4',
      type: 'textarea',
      label: 'توضیحات',
      placeholder: 'توضیحات خود را بنویسید...',
      required: false,
    },
  ])
  const [selectedField, setSelectedField] = useState<string | null>(null)
  const [formTitle, setFormTitle] = useState('فرم درخواست جدید')
  const [previewMode, setPreviewMode] = useState(false)

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: `f${Date.now()}`,
      type,
      label: `فیلد جدید`,
      required: false,
      options: type === 'select' ? ['گزینه ۱', 'گزینه ۲'] : undefined,
    }
    setFields((prev) => [...prev, newField])
    setSelectedField(newField.id)
  }

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id))
    if (selectedField === id) setSelectedField(null)
  }

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)))
  }

  const selectedFieldData = fields.find((f) => f.id === selectedField)

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 p-6">
          {/* Toolbar */}
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="text-heading-1 bg-transparent text-foreground outline-none border-b-2 border-transparent focus:border-brand"
                aria-label="عنوان فرم"
              />
              <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand">
                {fields.length} فیلد
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                <Eye className="size-4" aria-hidden />
                {previewMode ? 'ویرایش' : 'پیش‌نمایش'}
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-brand-hover"
              >
                <Save className="size-4" aria-hidden />
                ذخیره فرم
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4">
            {/* Field Palette (Left) */}
            {!previewMode && (
              <div className="col-span-12 lg:col-span-3">
                <div className="sticky top-24 rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <h3 className="mb-3 text-heading-1 text-foreground">فیلدها</h3>
                  <ul className="space-y-1.5">
                    {fieldTypes.map((ft) => (
                      <li key={ft.type}>
                        <button
                          type="button"
                          onClick={() => addField(ft.type)}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                        >
                          <ft.icon className="size-4 text-brand" aria-hidden />
                          {ft.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Canvas (Center) */}
            <div
              className={`col-span-12 ${previewMode ? 'lg:col-span-8 lg:col-start-3' : 'lg:col-span-5'}`}
            >
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-6 text-heading-1 text-foreground">{formTitle}</h2>
                {previewMode ? (
                  /* Preview Mode */
                  <div className="space-y-5">
                    {fields.map((field) => (
                      <div key={field.id}>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                          {field.label}
                          {field.required && <span className="mr-1 text-error">*</span>}
                        </label>
                        {field.type === 'text' && (
                          <input
                            type="text"
                            placeholder={field.placeholder}
                            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                          />
                        )}
                        {field.type === 'textarea' && (
                          <textarea
                            placeholder={field.placeholder}
                            rows={3}
                            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                          />
                        )}
                        {field.type === 'number' && (
                          <input
                            type="number"
                            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                          />
                        )}
                        {field.type === 'date' && (
                          <input
                            type="date"
                            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                          />
                        )}
                        {field.type === 'select' && (
                          <select className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20">
                            <option value="">انتخاب کنید...</option>
                            {field.options?.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        )}
                        {field.type === 'checkbox' && (
                          <label className="flex items-center gap-2 text-sm text-foreground">
                            <input
                              type="checkbox"
                              className="size-4 rounded border-input text-brand focus:ring-brand/20"
                            />
                            {field.label}
                          </label>
                        )}
                        {field.type === 'toggle' && (
                          <label className="relative inline-flex cursor-pointer items-center">
                            <input type="checkbox" className="peer sr-only" />
                            <div className="peer h-6 w-11 rounded-full bg-muted after:absolute after:start-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-brand peer-checked:after:translate-x-full peer-checked:after:border-white" />
                          </label>
                        )}
                        {field.type === 'file' && (
                          <div className="flex w-full items-center justify-center rounded-lg border-2 border-dashed border-border p-6">
                            <div className="text-center">
                              <Upload
                                className="mx-auto size-8 text-muted-foreground/30"
                                aria-hidden
                              />
                              <p className="mt-2 text-sm text-muted-foreground">
                                فایل را اینجا رها کنید یا کلیک کنید
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Builder Mode */
                  <div className="space-y-2">
                    {fields.map((field) => (
                      <div
                        key={field.id}
                        onClick={() => setSelectedField(field.id)}
                        className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                          selectedField === field.id
                            ? 'border-brand bg-brand/5'
                            : 'border-border hover:border-brand/30'
                        }`}
                      >
                        <GripVertical
                          className="size-4 shrink-0 text-muted-foreground cursor-grab"
                          aria-hidden
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{field.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {fieldTypes.find((ft) => ft.type === field.type)?.label}
                          </p>
                        </div>
                        {field.required && <span className="text-[10px] text-error">اجباری</span>}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeField(field.id)
                          }}
                          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-error/10 hover:text-error"
                          aria-label="حذف فیلد"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))}
                    {fields.length === 0 && (
                      <div className="py-12 text-center">
                        <Plus className="mx-auto size-8 text-muted-foreground/30" aria-hidden />
                        <p className="mt-2 text-sm text-muted-foreground">
                          از پنل سمت راست فیلد اضافه کنید
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Config Panel (Right) */}
            {!previewMode && (
              <div className="col-span-12 lg:col-span-4">
                <div className="sticky top-24 rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <h3 className="mb-3 flex items-center gap-2 text-heading-1 text-foreground">
                    <Settings className="size-4" aria-hidden />
                    تنظیمات فیلد
                  </h3>
                  {selectedFieldData ? (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                          عنوان فیلد
                        </label>
                        <input
                          type="text"
                          value={selectedFieldData.label}
                          onChange={(e) =>
                            updateField(selectedFieldData.id, { label: e.target.value })
                          }
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                          متن راهنما
                        </label>
                        <input
                          type="text"
                          value={selectedFieldData.placeholder || ''}
                          onChange={(e) =>
                            updateField(selectedFieldData.id, { placeholder: e.target.value })
                          }
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm text-foreground">
                        <input
                          type="checkbox"
                          checked={selectedFieldData.required}
                          onChange={(e) =>
                            updateField(selectedFieldData.id, { required: e.target.checked })
                          }
                          className="size-4 rounded border-input text-brand focus:ring-brand/20"
                        />
                        فیلد اجباری
                      </label>
                      {selectedFieldData.type === 'select' && (
                        <div>
                          <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            گزینه‌ها (هر خط یک گزینه)
                          </label>
                          <textarea
                            value={selectedFieldData.options?.join('\n') || ''}
                            onChange={(e) =>
                              updateField(selectedFieldData.id, {
                                options: e.target.value.split('\n').filter(Boolean),
                              })
                            }
                            rows={4}
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">یک فیلد را انتخاب کنید</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
