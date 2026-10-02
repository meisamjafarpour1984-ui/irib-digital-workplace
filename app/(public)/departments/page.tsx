/**
 * IRIB Digital Workplace Platform - Departments List Page
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

'use client'

import { UtilityBar } from '@/components/portal/utility-bar'
import { PortalHeader } from '@/components/portal/portal-header'
import { PortalFooter } from '@/components/portal/portal-footer'
import { Building2, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useOrganization } from '@/hooks/use-organization'

export default function DepartmentsPage() {
  const { departments, loading, error } = useOrganization()

  return (
    <div className="min-h-screen bg-background">
      <UtilityBar />
      <PortalHeader />

      <main className="mx-auto max-w-[1440px] px-4 py-6 md:px-6">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            بازگشت به صفحه اصلی
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-heading-1 text-foreground">معاونت‌ها و واحدها</h1>
          <p className="mt-2 text-body-lg text-muted-foreground">
            دسترسی به اطلاعات و خدمات هر معاونت
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-body-lg text-muted-foreground">خطا در دریافت اطلاعات</p>
          </div>
        ) : departments.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Building2 className="mx-auto size-12 text-muted-foreground/30" />
            <p className="mt-4 text-body-lg text-muted-foreground">واحدی ثبت نشده است</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept) => (
              <Link
                key={dept.id}
                href={`/departments/${dept.slug}`}
                className="block rounded-2xl border border-border bg-card p-6 transition-colors hover:border-brand/40"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <Building2 className="size-6" aria-hidden />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {typeof dept.name === 'string'
                        ? dept.name
                        : dept.name?.fa || dept.name?.en || ''}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {dept.type === 'DEPARTMENT' ? 'معاونت' : 'واحد'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <PortalFooter />
    </div>
  )
}
