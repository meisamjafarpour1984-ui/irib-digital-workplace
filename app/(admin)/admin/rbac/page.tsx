'use client'

import { useState } from 'react'
import { Container } from '@/components/layout/container'
import { Section } from '@/components/layout/section'
import { Check, X, Search, Shield, Loader2 } from 'lucide-react'
import { useRBAC } from '@/hooks/use-rbac'

// Force dynamic rendering to avoid SSR hydration issues
export const dynamic = 'force-dynamic'

export default function RBACPage() {
  const {
    roles,
    permissions,
    rolePermissions,
    loading,
    error,
    assignPermission,
    revokePermission,
  } = useRBAC()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  const togglePermission = async (roleId: string, permissionId: string) => {
    const hasPermission = rolePermissions.some(
      (rp) => rp.roleId === roleId && rp.permissionId === permissionId
    )

    try {
      if (hasPermission) {
        await revokePermission(roleId, permissionId)
      } else {
        await assignPermission(roleId, permissionId)
      }
    } catch {
      alert('خطا در تغییر مجوز')
    }
  }

  const filteredPermissions = permissions.filter(
    (p) =>
      (typeof p.name === 'string' ? p.name : p.name.fa)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const hasPermission = (roleId: string, permissionId: string) => {
    return rolePermissions.some((rp) => rp.roleId === roleId && rp.permissionId === permissionId)
  }

  if (loading) {
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

          {error && (
            <div className="mb-4 rounded-lg bg-error/10 border border-error/20 p-3 text-sm text-error">
              {error}
            </div>
          )}

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search
                className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                type="search"
                placeholder="جستجو در مجوزها..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-input bg-card py-2.5 pr-10 pl-3 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                aria-label="جستجو در مجوزها"
              />
            </div>
          </div>

          {/* Matrix */}
          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="sticky left-0 z-10 bg-card p-3 text-right text-xs font-medium text-muted-foreground">
                    مجوز / نقش
                  </th>
                  {roles.map((role) => (
                    <th
                      key={role.id}
                      className={`p-3 text-center text-xs font-medium ${
                        selectedRole === role.id ? 'bg-brand/5 text-brand' : 'text-muted-foreground'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedRole(selectedRole === role.id ? null : role.id)}
                        className="w-full"
                      >
                        {typeof role.name === 'string' ? role.name : role.name?.fa || role.code}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPermissions.map((permission) => (
                  <tr key={permission.id} className="border-b border-border last:border-0">
                    <td className="sticky left-0 z-10 bg-card p-3">
                      <span className="text-xs text-muted-foreground">
                        {typeof permission.name === 'string' ? permission.name : permission.name.fa}
                      </span>
                      <span className="mr-1 text-[10px] text-muted-foreground/60">
                        ({permission.code})
                      </span>
                    </td>
                    {roles.map((role) => {
                      const permitted = hasPermission(role.id, permission.id)
                      return (
                        <td key={role.id} className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => togglePermission(role.id, permission.id)}
                            className={`inline-flex size-7 items-center justify-center rounded-md transition-colors ${
                              permitted
                                ? 'bg-success/10 text-success hover:bg-success/20'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                            aria-label={`${permitted ? 'غیرفعال' : 'فعال'} کردن ${typeof permission.name === 'string' ? permission.name : permission.name.fa} برای ${role.code}`}
                          >
                            {permitted ? (
                              <Check className="size-3.5" />
                            ) : (
                              <X className="size-3.5" />
                            )}
                          </button>
                        </td>
                      )
                    })}
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
