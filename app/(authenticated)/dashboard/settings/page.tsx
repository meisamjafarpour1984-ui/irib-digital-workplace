/**
 * IRIB Digital Workplace Platform - System Settings Dashboard
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

'use client'

import { useState } from 'react'
import {
  Settings,
  Database,
  Server,
  Shield,
  Bell,
  Mail,
  MessageSquare,
  Users,
  HardDrive,
  Palette,
} from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')

  const tabs = [
    { id: 'GENERAL', label: 'عمومی', icon: Settings },
    { id: 'DATABASE', label: 'دیتابیس', icon: Database },
    { id: 'SERVER', label: 'سرور', icon: Server },
    { id: 'SECURITY', label: 'امنیت', icon: Shield },
    { id: 'NOTIFICATIONS', label: 'نوتیفیکیشن', icon: Bell },
    { id: 'COMMUNICATION', label: 'ارتباطات', icon: Mail },
    { id: 'USERS', label: 'کاربران', icon: Users },
    { id: 'APPEARANCE', label: 'ظاهر', icon: Palette },
  ]

  return (
    <main className="flex-1 space-y-6 p-6">
          <div>
            <h1 className="text-heading-1 text-foreground">تنظیمات سیستم</h1>
            <p className="text-sm text-muted-foreground">مدیریت تنظیمات و پیکربندی سیستم</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-border">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-brand text-brand'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="size-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          {activeTab === 'general' && <GeneralSettingsTab />}
          {activeTab === 'database' && <DatabaseSettingsTab />}
          {activeTab === 'server' && <ServerSettingsTab />}
          {activeTab === 'security' && <SecuritySettingsTab />}
          {activeTab === 'notifications' && <NotificationSettingsTab />}
          {activeTab === 'communication' && <CommunicationSettingsTab />}
          {activeTab === 'users' && <UserSettingsTab />}
          {activeTab === 'appearance' && <AppearanceSettingsTab />}
        </main>
  )
}

function GeneralSettingsTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">تنظیمات عمومی</h3>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">نام سیستم</label>
              <input
                type="text"
                defaultValue="درگاه دیجیتال کارکنان"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">زبان پیش‌فرض</label>
              <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none">
                <option>فارسی</option>
                <option>English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">منطقه زمانی</label>
              <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none">
                <option>تهران (Iran)</option>
                <option>UTC</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">فرمت تاریخ</label>
              <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none">
                <option>شمسی (۱۴۰۳/۰۵/۲۵)</option>
                <option>میلادی (2024-08-11)</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-accent p-4">
            <div>
              <p className="font-medium text-foreground">حالت تعمیر و نگهداری</p>
              <p className="text-sm text-muted-foreground">
                سامانه را در حالت تعمیر و نگهداری قرار می‌دهد
              </p>
            </div>
            <button className="rounded-lg bg-brand px-4 py-2 text-sm text-white transition-colors hover:bg-brand/90">
              ذخیره
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DatabaseSettingsTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">تنظیمات دیتابیس</h3>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">نوع دیتابیس</label>
              <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none">
                <option>PostgreSQL</option>
                <option>MySQL</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">نام دیتابیس</label>
              <input
                type="text"
                defaultValue="irib_dwp"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Host</label>
              <input
                type="text"
                defaultValue="localhost"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Port</label>
              <input
                type="text"
                defaultValue="5432"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-accent p-4">
            <div>
              <p className="font-medium text-foreground">اتصال</p>
              <p className="text-sm text-success">متصل و سالم</p>
            </div>
            <div className="flex gap-2">
              <button className="rounded-lg bg-brand px-4 py-2 text-sm text-white transition-colors hover:bg-brand/90">
                تست اتصال
              </button>
              <button className="rounded-lg bg-success px-4 py-2 text-sm text-white transition-colors hover:bg-success/90">
                ذخیره
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">تهیه نسخه پشتیبان</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-accent p-4">
            <div>
              <p className="font-medium text-foreground">آخرین نسخه پشتیبان</p>
              <p className="text-sm text-muted-foreground">۱۴۰۳/۰۵/۲۵ - ۱۰:۳۰</p>
            </div>
            <button className="rounded-lg bg-brand px-4 py-2 text-sm text-white transition-colors hover:bg-brand/90">
              تهیه نسخه جدید
            </button>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-accent p-4">
            <div>
              <p className="font-medium text-foreground">برنامه‌ریزی خودکار</p>
              <p className="text-sm text-muted-foreground">هر روز ساعت ۲:۰۰ بامداد</p>
            </div>
            <button className="rounded-lg bg-brand px-4 py-2 text-sm text-white transition-colors hover:bg-brand/90">
              تنظیم
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ServerSettingsTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">تنظیمات سرور</h3>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-accent p-4">
              <div className="flex items-center gap-2 mb-2">
                <Server className="size-4 text-brand" />
                <p className="text-sm font-medium text-foreground">CPU</p>
              </div>
              <p className="text-2xl font-bold text-foreground">۴۵٪</p>
              <p className="text-xs text-muted-foreground">۸ هسته</p>
            </div>
            <div className="rounded-lg bg-accent p-4">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="size-4 text-brand" />
                <p className="text-sm font-medium text-foreground">RAM</p>
              </div>
              <p className="text-2xl font-bold text-foreground">۶.۲ GB</p>
              <p className="text-xs text-muted-foreground">از ۱۶ GB</p>
            </div>
            <div className="rounded-lg bg-accent p-4">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="size-4 text-brand" />
                <p className="text-sm font-medium text-foreground">Disk</p>
              </div>
              <p className="text-2xl font-bold text-foreground">۴۵٪</p>
              <p className="text-xs text-muted-foreground">۲۵۰ GB از ۵۰۰ GB</p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-accent p-4">
            <div>
              <p className="font-medium text-foreground">وضعیت سرور</p>
              <p className="text-sm text-success">نرمال و سالم</p>
            </div>
            <button className="rounded-lg bg-brand px-4 py-2 text-sm text-white transition-colors hover:bg-brand/90">
              ریستارت
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SecuritySettingsTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">تنظیمات امنیتی</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-accent p-4">
            <div>
              <p className="font-medium text-foreground">احراز هویت دو مرحله‌ای</p>
              <p className="text-sm text-muted-foreground">فعال‌سازی 2FA برای تمام کاربران</p>
            </div>
            <button className="rounded-lg bg-brand px-4 py-2 text-sm text-white transition-colors hover:bg-brand/90">
              فعال‌سازی
            </button>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-accent p-4">
            <div>
              <p className="font-medium text-foreground">سیستم ant-bot</p>
              <p className="text-sm text-muted-foreground">فعال: reCAPTCHA v3</p>
            </div>
            <button className="rounded-lg bg-brand px-4 py-2 text-sm text-white transition-colors hover:bg-brand/90">
              تنظیم
            </button>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-accent p-4">
            <div>
              <p className="font-medium text-foreground">سیاست رمز عبور</p>
              <p className="text-sm text-muted-foreground">حداقل ۸ کاراکتر، حروف بزرگ و کوچک</p>
            </div>
            <button className="rounded-lg bg-brand px-4 py-2 text-sm text-white transition-colors hover:bg-brand/90">
              ویرایش
            </button>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-accent p-4">
            <div>
              <p className="font-medium text-foreground">لاگ امنیتی</p>
              <p className="text-sm text-muted-foreground">ثبت تمام فعالیت‌های امنیتی</p>
            </div>
            <button className="rounded-lg bg-brand px-4 py-2 text-sm text-white transition-colors hover:bg-brand/90">
              مشاهده
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function NotificationSettingsTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">تنظیمات نوتیفیکیشن</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-accent p-4">
            <div>
              <p className="font-medium text-foreground">نوتیفیکیشن مرورگر</p>
              <p className="text-sm text-muted-foreground">فعال</p>
            </div>
            <button className="rounded-lg bg-brand px-4 py-2 text-sm text-white transition-colors hover:bg-brand/90">
              تنظیم
            </button>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-accent p-4">
            <div>
              <p className="font-medium text-foreground">نوتیفیکیشن ایمیلی</p>
              <p className="text-sm text-muted-foreground">فعال (SMTP)</p>
            </div>
            <button className="rounded-lg bg-brand px-4 py-2 text-sm text-white transition-colors hover:bg-brand/90">
              تنظیم
            </button>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-accent p-4">
            <div>
              <p className="font-medium text-foreground">نوتیفیکیشن پیامکی</p>
              <p className="text-sm text-muted-foreground">فعال (IdehPayam)</p>
            </div>
            <button className="rounded-lg bg-brand px-4 py-2 text-sm text-white transition-colors hover:bg-brand/90">
              تنظیم
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CommunicationSettingsTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">تنظیمات ارتباطات</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-accent p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-brand/10 p-2">
                <Mail className="size-4 text-brand" />
              </div>
              <div>
                <p className="font-medium text-foreground">SMTP Server</p>
                <p className="text-sm text-muted-foreground">smtp.iribtabriz.ir:587</p>
              </div>
            </div>
            <button className="rounded-lg bg-brand px-4 py-2 text-sm text-white transition-colors hover:bg-brand/90">
              ویرایش
            </button>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-accent p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-brand/10 p-2">
                <MessageSquare className="size-4 text-brand" />
              </div>
              <div>
                <p className="font-medium text-foreground">SMS Gateway</p>
                <p className="text-sm text-muted-foreground">IdehPayam REST API</p>
              </div>
            </div>
            <button className="rounded-lg bg-brand px-4 py-2 text-sm text-white transition-colors hover:bg-brand/90">
              ویرایش
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function UserSettingsTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">تنظیمات کاربران</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-accent p-4">
            <div>
              <p className="font-medium text-foreground">ثبت نام کاربر جدید</p>
              <p className="text-sm text-muted-foreground">نیاز به تأیید ادمین</p>
            </div>
            <button className="rounded-lg bg-brand px-4 py-2 text-sm text-white transition-colors hover:bg-brand/90">
              تنظیم
            </button>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-accent p-4">
            <div>
              <p className="font-medium text-foreground">سیستم logout خودکار</p>
              <p className="text-sm text-muted-foreground">۳۰ دقیقه عدم فعالیت</p>
            </div>
            <button className="rounded-lg bg-brand px-4 py-2 text-sm text-white transition-colors hover:bg-brand/90">
              تنظیم
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AppearanceSettingsTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">تنظیمات ظاهری</h3>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">تم</label>
              <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none">
                <option>تیره (پیش‌فرض)</option>
                <option>روشن</option>
                <option>سیستم</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">رنگ اصلی</label>
              <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none">
                <option>آبی (پیش‌فرض)</option>
                <option>سبز</option>
                <option>قرمز</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-accent p-4">
            <div>
              <p className="font-medium text-foreground">لوگوی سیستم</p>
              <p className="text-sm text-muted-foreground">لوگوی فعلی: irib-logo.png</p>
            </div>
            <button className="rounded-lg bg-brand px-4 py-2 text-sm text-white transition-colors hover:bg-brand/90">
              تغییر
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
