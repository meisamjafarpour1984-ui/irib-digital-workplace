'use client'

import { useState } from 'react'
import { Container } from '@/components/layout/container'
import { Section } from '@/components/layout/section'
import { Search, Plus, Edit, Trash2 } from 'lucide-react'

const users = [
  { id: 1, name: 'علی رضایی', code: '۱۲۳۴۵', department: 'فناوری اطلاعات', role: 'کارشناس', status: 'فعال', lastLogin: '۱۰:۱۵' },
  { id: 2, name: 'محمد احمدی', code: '۱۲۳۴۶', department: 'روابط عمومی', role: 'کارشناس', status: 'فعال', lastLogin: '۰۹:۴۲' },
  { id: 3, name: 'سارا موسوی', code: '۱۲۳۴۷', department: 'اداری و مالی', role: 'کارشناس', status: 'فعال', lastLogin: '۰۹:۲۰' },
  { id: 4, name: 'رضا کریمی', code: '۱۲۳۴۸', department: 'فناوری اطلاعات', role: 'مدیر IT', status: 'فعال', lastLogin: '۰۸:۵۵' },
  { id: 5, name: 'مریم حسنی', code: '۱۲۳۴۹', department: 'تولید', role: 'برنامه‌ساز', status: 'غیرفعال', lastLogin: '۳ روز پیش' },
]

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const filtered = users.filter((u) => {
    const matchesSearch = u.name.includes(searchTerm) || u.code.includes(searchTerm)
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="min-h-screen bg-background">
      <Section>
        <Container>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-display-lg text-foreground">مدیریت کاربران</h1>
              <p className="mt-1 text-body-md text-muted-foreground">{users.length} کاربر ثبت‌نام شده</p>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover"
            >
              <Plus className="size-4" aria-hidden />
              کاربر جدید
            </button>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 md:min-w-72">
              <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                type="search"
                placeholder="جستجو در کاربران..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-input bg-card py-2.5 pr-10 pl-3 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                aria-label="جستجو در کاربران"
              />
            </div>
            <div className="flex gap-1 rounded-xl border border-border bg-card p-1">
              {['all', 'کارشناس', 'مدیر IT', 'برنامه‌ساز'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setRoleFilter(role)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    roleFilter === role ? 'bg-brand text-white' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {role === 'all' ? 'همه' : role}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3 text-right text-xs font-medium text-muted-foreground">نام</th>
                  <th className="p-3 text-right text-xs font-medium text-muted-foreground">کد پرسنلی</th>
                  <th className="p-3 text-right text-xs font-medium text-muted-foreground">واحد</th>
                  <th className="p-3 text-right text-xs font-medium text-muted-foreground">نقش</th>
                  <th className="p-3 text-right text-xs font-medium text-muted-foreground">وضعیت</th>
                  <th className="p-3 text-right text-xs font-medium text-muted-foreground">آخرین ورود</th>
                  <th className="p-3 text-center text-xs font-medium text-muted-foreground">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-brand">
                          {user.name.slice(0, 1)}
                        </div>
                        <span className="font-medium text-foreground">{user.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{user.code}</td>
                    <td className="p-3 text-xs text-muted-foreground">{user.department}</td>
                    <td className="p-3">
                      <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">{user.role}</span>
                    </td>
                    <td className="p-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        user.status === 'فعال' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{user.lastLogin}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1">
                        <button type="button" className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="ویرایش">
                          <Edit className="size-3.5" />
                        </button>
                        <button type="button" className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-error/10 hover:text-error" aria-label="حذف">
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </Section>
    </div>
  )
}
