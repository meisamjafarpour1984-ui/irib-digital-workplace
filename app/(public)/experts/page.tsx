'use client'

/**
 * IRIB Digital Workplace Platform - Knowledge & Experts Page
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { UtilityBar } from '@/components/portal/utility-bar'
import { PortalHeader } from '@/components/portal/portal-header'
import { PortalFooter } from '@/components/portal/portal-footer'
import { Award, Star, Search, Filter, Loader2 } from 'lucide-react'
import { useExperts } from '@/hooks/use-experts'

export default function ExpertsPage() {
  const { experts, loading, error } = useExperts()

  return (
    <div className="min-h-screen bg-background">
      <UtilityBar />
      <PortalHeader />

      <main className="mx-auto max-w-[1440px] px-4 py-6 md:px-6">
        {/* Hero Section */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-brand/10">
            <Award className="size-10 text-brand" aria-hidden />
          </div>
          <h1 className="mt-6 text-heading-1 text-foreground">متخصصین و اسطوره‌ها</h1>
          <p className="mt-3 text-body-lg text-muted-foreground max-w-2xl mx-auto">
            معرفی متخصصین و پیشکسوتان و تجربیات ارزشمند آن‌ها در حوزه‌های مختلف رسانه‌ای
          </p>
        </div>

        {/* Legends Section - Placeholder for now */}
        <div className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="size-6 text-brand" />
              <h2 className="text-heading-1 text-foreground">اسطوره‌های رسانه</h2>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Star className="mx-auto size-12 text-muted-foreground/30" />
            <p className="mt-4 text-body-lg text-muted-foreground">
              به زودی اسطوره‌های رسانه اضافه می‌شوند
            </p>
          </div>
        </div>

        {/* Experts Section */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-heading-1 text-foreground">متخصصین</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="جستجو در متخصصین..."
                  className="w-64 rounded-lg border border-border bg-background pr-10 pl-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
                />
              </div>
              <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted">
                <Filter className="size-4" />
                فیلتر
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <p className="text-body-lg text-muted-foreground">خطا در دریافت اطلاعات</p>
            </div>
          ) : experts.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <Award className="mx-auto size-12 text-muted-foreground/30" />
              <p className="mt-4 text-body-lg text-muted-foreground">متخصصی ثبت نشده است</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {experts.map((expert) => (
                <div
                  key={expert.id}
                  className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-brand/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-full bg-accent text-brand">
                      <span className="text-lg font-bold">{expert.name?.charAt(0) || '?'}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{expert.name}</h3>
                      <p className="text-xs text-muted-foreground">{expert.title || 'متخصص'}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 text-xs text-muted-foreground">
                      واحد: {expert.department || 'نامشخص'}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {expert.skills && expert.skills.length > 0 ? (
                        expert.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-accent px-2 py-0.5 text-xs text-foreground"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">مهارتی ثبت نشده</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <PortalFooter />
    </div>
  )
}
