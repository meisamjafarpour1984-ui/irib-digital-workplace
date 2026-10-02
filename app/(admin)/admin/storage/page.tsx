'use client'

import { useState } from 'react'
import { Container } from '@/components/layout/container'
import { Section } from '@/components/layout/section'
import {
  HardDrive,
  Cloud,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
  Upload,
} from 'lucide-react'
import { useStorage } from '@/hooks/use-storage'

// Force dynamic rendering to avoid SSR hydration issues
export const dynamic = 'force-dynamic'

type StorageProvider = 'local' | 's3'

export default function StorageConfigPage() {
  const { stats, error, testConnection } = useStorage()
  const [provider, setProvider] = useState<StorageProvider>('local')
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')

  const handleTestConnection = async () => {
    setTestStatus('testing')
    try {
      const result = await testConnection()
      setTestStatus(result.success ? 'success' : 'error')
    } catch {
      setTestStatus('error')
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const usageStats = stats
    ? [
        { label: 'فضای کل', value: formatBytes(stats.totalSize), color: 'bg-brand' },
        { label: 'تعداد فایل', value: stats.totalAssets.toString(), color: 'bg-chart-2' },
        ...stats.assetsByType.slice(0, 2).map((item, index) => ({
          label: item.mimeType.split('/')[0] || 'سایر',
          value: formatBytes(item.size),
          color: index === 0 ? 'bg-chart-3' : 'bg-chart-4',
        })),
      ]
    : [
        { label: 'فضای کل', value: '۰', color: 'bg-brand' },
        { label: 'تعداد فایل', value: '۰', color: 'bg-chart-2' },
        { label: 'تصاویر', value: '۰', color: 'bg-chart-3' },
        { label: 'ویدیوها', value: '۰', color: 'bg-chart-4' },
      ]

  return (
    <div className="min-h-screen bg-background">
      <Section>
        <Container>
          <div className="mb-6">
            <h1 className="text-display-lg text-foreground">مدیریت استوریج</h1>
            <p className="mt-1 text-body-md text-muted-foreground">پیکربندی ذخیره‌سازی فایل‌ها</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-error/10 border border-error/20 p-3 text-sm text-error">
              {error}
            </div>
          )}

          {/* Usage Overview */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {usageStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <div className={`size-2 rounded-full ${stat.color}`} />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <p className="mt-2 text-xl font-bold text-foreground">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Provider Selection */}
          <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              انتخاب ارائه‌دهنده استوریج
            </h2>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setProvider('local')}
                className={`flex flex-1 items-center justify-center gap-3 rounded-xl border-2 p-4 transition-colors ${
                  provider === 'local'
                    ? 'border-brand bg-brand/5'
                    : 'border-border hover:border-brand/30'
                }`}
              >
                <HardDrive className="size-6" />
                <div className="text-right">
                  <p className="font-semibold text-foreground">لوکال</p>
                  <p className="text-xs text-muted-foreground">ذخیره روی سرور</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setProvider('s3')}
                className={`flex flex-1 items-center justify-center gap-3 rounded-xl border-2 p-4 transition-colors ${
                  provider === 's3'
                    ? 'border-brand bg-brand/5'
                    : 'border-border hover:border-brand/30'
                }`}
              >
                <Cloud className="size-6" />
                <div className="text-right">
                  <p className="font-semibold text-foreground">S3 / MinIO</p>
                  <p className="text-xs text-muted-foreground">ذخیره ابری</p>
                </div>
              </button>
            </div>
          </div>

          {/* Connection Test */}
          <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">تست اتصال</h2>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testStatus === 'testing'}
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                {testStatus === 'testing' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
                تست اتصال
              </button>
            </div>
            {testStatus !== 'idle' && (
              <div
                className={`flex items-center gap-2 rounded-lg p-3 ${
                  testStatus === 'success'
                    ? 'bg-success/10 text-success'
                    : testStatus === 'error'
                      ? 'bg-error/10 text-error'
                      : 'bg-muted'
                }`}
              >
                {testStatus === 'success' && <CheckCircle className="size-5" />}
                {testStatus === 'error' && <AlertCircle className="size-5" />}
                {testStatus === 'testing' && <Loader2 className="size-5 animate-spin" />}
                <span className="text-sm">
                  {testStatus === 'success'
                    ? 'اتصال موفق'
                    : testStatus === 'error'
                      ? 'اتصال ناموفق'
                      : 'در حال تست...'}
                </span>
              </div>
            )}
          </div>

          {/* Recent Uploads */}
          {stats?.recentUploads && stats.recentUploads.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-foreground">آپلودهای اخیر</h2>
              <div className="space-y-2">
                {stats.recentUploads.slice(0, 5).map((upload) => (
                  <div
                    key={upload.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Upload className="size-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{upload.originalName}</p>
                        <p className="text-xs text-muted-foreground">
                          {upload.uploadedBy?.name || 'ناشناس'} •{' '}
                          {new Date(upload.createdAt).toLocaleString('fa-IR')}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatBytes(Number(upload.size))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Container>
      </Section>
    </div>
  )
}
