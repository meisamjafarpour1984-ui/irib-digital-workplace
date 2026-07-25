'use client'

import { useState } from 'react'
import { Container } from '@/components/layout/container'
import { Section } from '@/components/layout/section'
import { Check, X, Search, Shield } from 'lucide-react'

const roles = ['کارمند (P2)', 'کارشناس (P3)', 'مدیر معاونت (P4)', 'مدیر ارشد (P5)', 'مدیر IT (P6)']

const entities = ['اخبار', 'اطلاعیه‌ها', 'گالری', 'فرم‌ها', 'نرم‌افزارها', 'تیکت‌ها', 'نظرسنجی', 'کارشناسان']

const actions = ['ایجاد', 'خواندن', 'ویرایش', 'حذف', 'انتشار', 'بایگانی']

type PermissionMatrix = Record<string, Record<string, boolean>>

const defaultMatrix: PermissionMatrix = {
  'کارمند (P2)': {
    'اخبار-خواندن': true,
    'اطلاعیه‌ها-خواندن': true,
    'گالری-خواندن': true,
    'فرم‌ها-خواندن': true,
    'فرم‌ها-ایجاد': true,
    'نرم‌افزارها-خواندن': true,
    'تیکت‌ها-ایجاد': true,
    'تیکت‌ها-خواندن': true,
    'نظرسنجی-خواندن': true,
    'نظرسنجی-ایجاد': true,
    'کارشناسان-خواندن': true,
  },
  'کارشناس (P3)': {
    'اخبار-خواندن': true,
    'اخبار-ایجاد': true,
    'اخبار-ویرایش': true,
    'اخبار-انتشار': true,
    'اطلاعیه‌ها-خواندن': true,
    'اطلاعیه‌ها-ایجاد': true,
    'گالری-خواندن': true,
    'گالری-ایجاد': true,
    'فرم‌ها-خواندن': true,
    'فرم‌ها-ایجاد': true,
    'نرم‌افزارها-خواندن': true,
    'تیکت‌ها-خواندن': true,
    'تیکت‌ها-ایجاد': true,
    'نظرسنجی-خواندن': true,
    'کارشناسان-خواندن': true,
  },
  'مدیر معاونت (P4)': {
    'اخبار-خواندن': true,
    'اخبار-ایجاد': true,
    'اخبار-ویرایش': true,
    'اخبار-حذف': true,
    'اخبار-انتشار': true,
    'اخبار-بایگانی': true,
    'اطلاعیه‌ها-خواندن': true,
    'اطلاعیه‌ها-ایجاد': true,
    'اطلاعیه‌ها-ویرایش': true,
    'گالری-خواندن': true,
    'گالری-ایجاد': true,
    'گالری-حذف': true,
    'فرم‌ها-خواندن': true,
    'فرم‌ها-ایجاد': true,
    'فرم‌ها-ویرایش': true,
    'نرم‌افزارها-خواندن': true,
    'تیکت‌ها-خواندن': true,
    'تیکت‌ها-ایجاد': true,
    'نظرسنجی-خواندن': true,
    'نظرسنجی-ایجاد': true,
    'کارشناسان-خواندن': true,
  },
  'مدیر ارشد (P5)': {
    'اخبار-خواندن': true,
    'اخبار-ایجاد': true,
    'اخبار-ویرایش': true,
    'اخبار-حذف': true,
    'اخبار-انتشار': true,
    'اخبار-بایگانی': true,
    'اطلاعیه‌ها-خواندن': true,
    'اطلاعیه‌ها-ایجاد': true,
    'اطلاعیه‌ها-ویرایش': true,
    'اطلاعیه‌ها-حذف': true,
    'گالری-خواندن': true,
    'گالری-ایجاد': true,
    'گالری-ویرایش': true,
    'گالری-حذف': true,
    'فرم‌ها-خواندن': true,
    'فرم‌ها-ایجاد': true,
    'فرم‌ها-ویرایش': true,
    'فرم‌ها-حذف': true,
    'نرم‌افزارها-خواندن': true,
    'نرم‌افزارها-ایجاد': true,
    'نرم‌افزارها-ویرایش': true,
    'نرم‌افزارها-حذف': true,
    'تیکت‌ها-خواندن': true,
    'تیکت‌ها-ایجاد': true,
    'تیکت‌ها-ویرایش': true,
    'نظرسنجی-خواندن': true,
    'نظرسنجی-ایجاد': true,
    'نظرسنجی-ویرایش': true,
    'کارشناسان-خواندن': true,
    'کارشناسان-ایجاد': true,
    'کارشناسان-ویرایش': true,
    'کارشناسان-حذف': true,
  },
  'مدیر IT (P6)': {
    'اخبار-خواندن': true,
    'اطلاعیه‌ها-خواندن': true,
    'گالری-خواندن': true,
    'فرم‌ها-خواندن': true,
    'نرم‌افزارها-خواندن': true,
    'نرم‌افزارها-ایجاد': true,
    'نرم‌افزارها-ویرایش': true,
    'نرم‌افزارها-حذف': true,
    'تیکت‌ها-خواندن': true,
    'تیکت‌ها-ایجاد': true,
    'تیکت‌ها-ویرایش': true,
    'نظرسنجی-خواندن': true,
    'کارشناسان-خواندن': true,
  },
}

export default function RBACPage() {
  const [matrix, setMatrix] = useState<PermissionMatrix>(defaultMatrix)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  const togglePermission = (role: string, key: string) => {
    setMatrix((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [key]: !prev[role]?.[key],
      },
    }))
  }

  const filteredEntities = entities.filter((e) =>
    e.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <Section>
        <Container>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-display-lg text-foreground">مدیریت دسترسی‌ها</h1>
              <p className="mt-1 text-body-md text-muted-foreground">ماتریس نقش‌ها و مجوزها</p>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover"
            >
              <Shield className="size-4" aria-hidden />
              ذخیره ماتریس
            </button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                type="search"
                placeholder="جستجو در موجودیت‌ها..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-input bg-card py-2.5 pr-10 pl-3 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                aria-label="جستجو در موجودیت‌ها"
              />
            </div>
          </div>

          {/* Matrix */}
          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="sticky left-0 z-10 bg-card p-3 text-right text-xs font-medium text-muted-foreground">
                    موجودیت / عملیات
                  </th>
                  {roles.map((role) => (
                    <th
                      key={role}
                      className={`p-3 text-center text-xs font-medium ${
                        selectedRole === role ? 'bg-brand/5 text-brand' : 'text-muted-foreground'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedRole(selectedRole === role ? null : role)}
                        className="w-full"
                      >
                        {role}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredEntities.map((entity) =>
                  actions.map((action) => {
                    const key = `${entity}-${action}`
                    return (
                      <tr key={key} className="border-b border-border last:border-0">
                        <td className="sticky left-0 z-10 bg-card p-3">
                          <span className="text-xs text-muted-foreground">{entity}</span>
                          <span className="mr-1 text-[10px] text-muted-foreground/60">/ {action}</span>
                        </td>
                        {roles.map((role) => {
                          const hasPermission = matrix[role]?.[key] ?? false
                          return (
                            <td key={role} className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => togglePermission(role, key)}
                                className={`inline-flex size-7 items-center justify-center rounded-md transition-colors ${
                                  hasPermission
                                    ? 'bg-success/10 text-success hover:bg-success/20'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                                aria-label={`${hasPermission ? 'غیرفعال' : 'فعال'} کردن ${action} ${entity} برای ${role}`}
                              >
                                {hasPermission ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                              </button>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </Container>
      </Section>
    </div>
  )
}
