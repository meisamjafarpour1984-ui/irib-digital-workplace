/**
 * IRIB Digital Workplace Platform - Mobile Device Management Dashboard
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
  Smartphone,
  QrCode,
  Bell,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Eye,
  Send,
  Plus,
  Zap,
} from 'lucide-react'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardTopbar } from '@/components/dashboard/dashboard-topbar'

export default function MobileDeviceManagementPage() {
  const [activeTab, setActiveTab] = useState('devices')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCampaignModal, setShowCampaignModal] = useState(false)

  const tabs = [
    { id: 'devices', label: 'دستگاه‌ها', count: 45 },
    { id: 'qr-tokens', label: 'توکن‌های QR', count: 12 },
    { id: 'push', label: 'Push Subscriptions', count: 38 },
    { id: 'campaigns', label: 'کمپین‌های Push', count: 7 },
  ]

  const devices = [
    {
      id: 1,
      deviceId: 'iphone-15-pro-001',
      platform: 'iOS',
      userId: 'u1',
      userName: 'محمد احمدی',
      status: 'active',
      lastActive: '۵ دقیقه پیش',
      pushEnabled: true,
    },
    {
      id: 2,
      deviceId: 'samsung-s24-002',
      platform: 'Android',
      userId: 'u2',
      userName: 'علی رضایی',
      status: 'active',
      lastActive: '۱۵ دقیقه پیش',
      pushEnabled: true,
    },
    {
      id: 3,
      deviceId: 'iphone-14-003',
      platform: 'iOS',
      userId: 'u3',
      userName: 'سارا موسوی',
      status: 'blocked',
      lastActive: '۲ روز پیش',
      pushEnabled: false,
    },
    {
      id: 4,
      deviceId: 'pixel-7-004',
      platform: 'Android',
      userId: 'u4',
      userName: 'رضا کریمی',
      status: 'active',
      lastActive: '۳۰ دقیقه پیش',
      pushEnabled: true,
    },
  ]

  const campaigns = [
    {
      id: 1,
      name: 'اطلاعیه تعطیلات',
      title: 'دفتر در روزهای شنبه و یک‌شنبه تعطیل است',
      targetAudience: 'ALL',
      scheduledAt: '۱۴۰۳/۰۲/۲۵ ۱۰:۰۰',
      sentAt: '۱۴۰۳/۰۲/۲۵ ۱۰:۰۰',
      status: 'sent',
      totalRecipients: 38,
      delivered: 35,
      opened: 28,
      clicked: 12,
    },
    {
      id: 2,
      name: 'به‌روزرسانی امنیتی',
      title: 'لطفاً برنامه را به آخرین نسخه به‌روزرسانی کنید',
      targetAudience: 'ANDROID',
      scheduledAt: '۱۴۰۳/۰۲/۲۴ ۱۴:۰۰',
      sentAt: '۱۴۰۳/۰۲/۲۴ ۱۴:۰۰',
      status: 'sent',
      totalRecipients: 18,
      delivered: 17,
      opened: 10,
      clicked: 5,
    },
    {
      id: 3,
      name: 'رویداد سالانه',
      title: 'جشن سالانه روز پنج‌شنبه برگزار می‌شود',
      targetAudience: 'ACTIVE_USERS',
      scheduledAt: '۱۴۰۳/۰۲/۲۸ ۰۹:۰۰',
      sentAt: null,
      status: 'scheduled',
      totalRecipients: 30,
      delivered: 0,
      opened: 0,
      clicked: 0,
    },
    {
      id: 4,
      name: 'اطلاعیه نگهداری',
      title: 'سیستم برای تعمیرات دائمی خارج از دسترس است',
      targetAudience: 'ALL',
      scheduledAt: null,
      sentAt: null,
      status: 'draft',
      totalRecipients: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
    },
  ]

  const platformStyles: Record<string, string> = {
    iOS: 'bg-gray-100 text-gray-700',
    Android: 'bg-green-100 text-green-700',
  }

  const statusStyles: Record<string, string> = {
    active: 'bg-success/10 text-success',
    blocked: 'bg-error/10 text-error',
    expired: 'bg-muted text-muted-foreground',
  }

  const statusLabels: Record<string, string> = {
    active: 'فعال',
    blocked: 'مسدود شده',
    expired: 'منقضی شده',
  }

  const campaignStatusStyles: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground',
    scheduled: 'bg-info/10 text-info',
    sent: 'bg-success/10 text-success',
    failed: 'bg-error/10 text-error',
  }

  const campaignStatusLabels: Record<string, string> = {
    draft: 'پیش‌نویس',
    scheduled: 'زمان‌بندی شده',
    sent: 'ارسال شده',
    failed: 'ناموفق',
  }

  const targetAudienceLabels: Record<string, string> = {
    ALL: 'همه کاربران',
    ANDROID: 'کاربران Android',
    IOS: 'کاربران iOS',
    ACTIVE_USERS: 'کاربران فعال',
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-heading-1 text-foreground">مدیریت دستگاه‌های موبایل</h1>
              <p className="text-sm text-muted-foreground">مدیریت ثبت دستگاه‌ها و اعلان‌های push</p>
            </div>
            {activeTab === 'campaigns' && (
              <button
                onClick={() => setShowCampaignModal(true)}
                className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90"
              >
                <Plus className="size-4" />
                ایجاد کمپین جدید
              </button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-brand/10 p-2">
                  <Smartphone className="size-5 text-brand" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">کل دستگاه‌ها</p>
                  <p className="text-lg font-bold text-foreground">۴۵</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-success/10 p-2">
                  <CheckCircle className="size-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">فعال</p>
                  <p className="text-lg font-bold text-foreground">۴۲</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-error/10 p-2">
                  <XCircle className="size-5 text-error" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">مسدود شده</p>
                  <p className="text-lg font-bold text-foreground">۳</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-info/10 p-2">
                  <Bell className="size-5 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Push فعال</p>
                  <p className="text-lg font-bold text-foreground">۳۸</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="جستجو در دستگاه‌ها..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-background pr-10 pl-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
              />
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted">
              <Filter className="size-4" />
              فیلتر
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-brand text-brand'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs">{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Devices Tab */}
          {activeTab === 'devices' && (
            <div className="rounded-lg border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        دستگاه
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        پلتفرم
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        کاربر
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        وضعیت
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        آخرین فعالیت
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        Push
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        عملیات
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.map((device) => (
                      <tr key={device.id} className="border-b border-border hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-brand">
                              <Smartphone className="size-4" />
                            </div>
                            <span className="font-mono text-sm text-foreground">
                              {device.deviceId}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${platformStyles[device.platform]}`}
                          >
                            {device.platform}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">{device.userName}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[device.status]}`}
                          >
                            {statusLabels[device.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {device.lastActive}
                        </td>
                        <td className="px-4 py-3">
                          {device.pushEnabled ? (
                            <CheckCircle className="size-4 text-success" />
                          ) : (
                            <XCircle className="size-4 text-muted-foreground" />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                              title="مشاهده"
                            >
                              <Eye className="size-4" />
                            </button>
                            <button
                              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                              title="بیشتر"
                            >
                              <MoreVertical className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* QR Tokens Tab */}
          {activeTab === 'qr-tokens' && (
            <div className="rounded-lg border border-border bg-card p-10 text-center">
              <QrCode className="mx-auto size-12 text-muted-foreground/40" />
              <h2 className="mt-4 text-lg font-semibold text-foreground">مدیریت توکن‌های QR</h2>
              <p className="mt-2 text-sm text-muted-foreground">این بخش در حال توسعه است.</p>
            </div>
          )}

          {/* Push Subscriptions Tab */}
          {activeTab === 'push' && (
            <div className="rounded-lg border border-border bg-card p-10 text-center">
              <Bell className="mx-auto size-12 text-muted-foreground/40" />
              <h2 className="mt-4 text-lg font-semibold text-foreground">
                مدیریت Push Subscriptions
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">این بخش در حال توسعه است.</p>
            </div>
          )}

          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <div className="rounded-lg border border-border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        نام کمپین
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        عنوان پیام
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        مخاطب
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        زمان ارسال
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        وضعیت
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        آمار
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        عملیات
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((campaign) => (
                      <tr key={campaign.id} className="border-b border-border hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-accent text-brand">
                              <Zap className="size-4" />
                            </div>
                            <span className="font-medium text-foreground">{campaign.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                          {campaign.title}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-foreground">
                            {targetAudienceLabels[campaign.targetAudience]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {campaign.scheduledAt || campaign.sentAt || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${campaignStatusStyles[campaign.status]}`}
                          >
                            {campaignStatusLabels[campaign.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">گیرندگان:</span>
                              <span className="font-medium text-foreground">
                                {campaign.totalRecipients}
                              </span>
                            </div>
                            {campaign.status === 'sent' && (
                              <>
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">تحویل:</span>
                                  <span className="font-medium text-success">
                                    {campaign.delivered}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">باز شده:</span>
                                  <span className="font-medium text-info">{campaign.opened}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">کلیک:</span>
                                  <span className="font-medium text-brand">{campaign.clicked}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {campaign.status === 'draft' && (
                              <button
                                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                                title="ارسال"
                              >
                                <Send className="size-4" />
                              </button>
                            )}
                            <button
                              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                              title="بیشتر"
                            >
                              <MoreVertical className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Campaign Modal */}
          {showCampaignModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">ایجاد کمپین Push جدید</h2>
                  <button
                    onClick={() => setShowCampaignModal(false)}
                    className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <XCircle className="size-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      نام کمپین
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: اطلاعیه تعطیلات"
                      className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      عنوان پیام
                    </label>
                    <input
                      type="text"
                      placeholder="عنوان کوتاه"
                      className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      متن پیام
                    </label>
                    <textarea
                      placeholder="متن کامل پیام"
                      rows={3}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      مخاطب هدف
                    </label>
                    <select className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none">
                      <option value="ALL">همه کاربران</option>
                      <option value="ANDROID">کاربران Android</option>
                      <option value="IOS">کاربران iOS</option>
                      <option value="ACTIVE_USERS">کاربران فعال</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      زمان ارسال
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:border-brand focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      onClick={() => setShowCampaignModal(false)}
                      className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      انصراف
                    </button>
                    <button className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
                      ذخیره
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
