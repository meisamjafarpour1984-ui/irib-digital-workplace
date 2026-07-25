'use client'

import { useState } from 'react'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardTopbar } from '@/components/dashboard/dashboard-topbar'
import { Camera, Save, Mail, Phone, Building2, Briefcase, Calendar } from 'lucide-react'

const profileData = {
  name: 'علی رضایی',
  personnelCode: '۱۲۳۴۵',
  email: 'ali.rezaei@iribtabriz.ir',
  mobile: '۰۹۱۲۳۴۵۶۷۸۹',
  department: 'فناوری اطلاعات',
  unit: 'توسعه نرم‌افزار',
  role: 'کارشناس ارشد',
  joinDate: '۱۳۹۸/۰۳/۰۱',
}

export default function ProfilePage() {
  const [name, setName] = useState(profileData.name)
  const [email, setEmail] = useState(profileData.email)
  const [mobile, setMobile] = useState(profileData.mobile)
  const [bio, setBio] = useState('توسعه‌دهنده فرانت‌اند با تجربه در پروژه‌های سازمانی')

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-3xl space-y-6">
            {/* Header */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-start gap-6">
                <div className="relative">
                  <div className="flex size-24 items-center justify-center rounded-full bg-accent text-3xl font-bold text-brand">
                    {profileData.name.slice(0, 1)}
                  </div>
                  <button
                    type="button"
                    className="absolute -bottom-1 -left-1 flex size-8 items-center justify-center rounded-full bg-brand text-white shadow-lg"
                    aria-label="تغییر عکس"
                  >
                    <Camera className="size-4" />
                  </button>
                </div>
                <div className="flex-1">
                  <h1 className="text-heading-1 text-foreground">{profileData.name}</h1>
                  <p className="text-sm text-muted-foreground">{profileData.role} · {profileData.department}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Building2 className="size-3" aria-hidden />{profileData.department}</span>
                    <span className="flex items-center gap-1"><Briefcase className="size-3" aria-hidden />{profileData.unit}</span>
                    <span className="flex items-center gap-1"><Calendar className="size-3" aria-hidden />عضویت از {profileData.joinDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Form */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-heading-1 text-foreground">ویرایش اطلاعات</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">نام و نام خانوادگی</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">کد پرسنلی</label>
                    <input
                      type="text"
                      value={profileData.personnelCode}
                      disabled
                      className="w-full rounded-xl border border-input bg-muted px-3 py-2.5 text-sm text-muted-foreground"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">ایمیل</label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background pe-9 ps-3 py-2.5 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">موبایل</label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background pe-9 ps-3 py-2.5 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">درباره من</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-hover"
                  >
                    <Save className="size-4" aria-hidden />
                    ذخیره تغییرات
                  </button>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-heading-1 text-foreground">امنیت حساب</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">تغییر رمز عبور</p>
                    <p className="text-xs text-muted-foreground">آخرین تغییر: ۳۰ روز پیش</p>
                  </div>
                  <button type="button" className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
                    تغییر
                  </button>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">احراز هویت دو مرحله‌ای</p>
                    <p className="text-xs text-muted-foreground">از طریق SMS فعال است</p>
                  </div>
                  <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">فعال</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">دستگاه‌های متصل</p>
                    <p className="text-xs text-muted-foreground">۲ دستگاه فعال</p>
                  </div>
                  <button type="button" className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
                    مشاهده
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
