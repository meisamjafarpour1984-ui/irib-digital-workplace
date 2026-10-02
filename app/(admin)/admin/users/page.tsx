'use client'

import { useState } from 'react'
import { Container } from '@/components/layout/container'
import { Section } from '@/components/layout/section'
import { Search, Plus, Edit, Trash2, Loader2 } from 'lucide-react'
import { useUsers } from '@/hooks/use-users'

// Force dynamic rendering to avoid SSR hydration issues
export const dynamic = 'force-dynamic'

export default function UsersPage() {
  const { users, stats, loading, error, deleteUser, toggleUserStatus } = useUsers()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.includes(searchTerm) ||
      u.personnelCode.includes(searchTerm) ||
      (u.email && u.email.includes(searchTerm))
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleDelete = async (id: string) => {
    if (confirm('آیا از حذف این کاربر اطمینان دارید؟')) {
      try {
        await deleteUser(id)
      } catch {
        alert('خطا در حذف کاربر')
      }
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'
    try {
      await toggleUserStatus(id, newStatus)
    } catch {
      alert('خطا در تغییر وضعیت کاربر')
    }
  }

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-brand" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Section>
        <Container>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-display-lg text-foreground">مدیریت کاربران</h1>
              <p className="mt-1 text-body-md text-muted-foreground">
                {stats?.total || 0} کاربر ثبت‌نام شده ({stats?.active || 0} فعال)
              </p>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover"
            >
              <Plus className="size-4" aria-hidden />
              کاربر جدید
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-error/10 border border-error/20 p-3 text-sm text-error">
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 md:min-w-72">
              <Search
                className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
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
              {['all', 'ACTIVE', 'DISABLED'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-brand text-white'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {status === 'all' ? 'همه' : status === 'ACTIVE' ? 'فعال' : 'غیرفعال'}
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
                  <th className="p-3 text-right text-xs font-medium text-muted-foreground">
                    کد پرسنلی
                  </th>
                  <th className="p-3 text-right text-xs font-medium text-muted-foreground">واحد</th>
                  <th className="p-3 text-right text-xs font-medium text-muted-foreground">نقش</th>
                  <th className="p-3 text-right text-xs font-medium text-muted-foreground">
                    وضعیت
                  </th>
                  <th className="p-3 text-right text-xs font-medium text-muted-foreground">
                    ایمیل
                  </th>
                  <th className="p-3 text-center text-xs font-medium text-muted-foreground">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <Loader2 className="mx-auto size-6 animate-spin text-brand" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      هیچ کاربری یافت نشد
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex size-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-brand">
                            {user.name.slice(0, 1)}
                          </div>
                          <span className="font-medium text-foreground">{user.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{user.personnelCode}</td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {user.departments?.[0]?.department.name || '-'}
                      </td>
                      <td className="p-3">
                        {user.roles?.map((r) => (
                          <span
                            key={r.role.id}
                            className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand ml-1"
                          >
                            {r.role.code}
                          </span>
                        ))}
                      </td>
                      <td className="p-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold cursor-pointer ${
                            user.status === 'ACTIVE'
                              ? 'bg-success/10 text-success'
                              : 'bg-muted text-muted-foreground'
                          }`}
                          onClick={() => handleToggleStatus(user.id, user.status)}
                        >
                          {user.status === 'ACTIVE' ? 'فعال' : 'غیرفعال'}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{user.email || '-'}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                            aria-label="ویرایش"
                          >
                            <Edit className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(user.id)}
                            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-error/10 hover:text-error"
                            aria-label="حذف"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Container>
      </Section>
    </div>
  )
}
