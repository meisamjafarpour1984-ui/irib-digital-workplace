'use client'

import { useState } from 'react'
import { Container } from '@/components/layout/container'
import { Section } from '@/components/layout/section'
import { HardDrive, Cloud, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

type StorageProvider = 'local' | 's3'

export default function StorageConfigPage() {
  const [provider, setProvider] = useState<StorageProvider>('local')
  const [s3Config, setS3Config] = useState({
    endpoint: '',
    region: '',
    bucket: '',
    accessKey: '',
    secretKey: '',
  })
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')

  const testConnection = () => {
    setTestStatus('testing')
    setTimeout(() => {
      setTestStatus(s3Config.endpoint ? 'success' : 'error')
    }, 2000)
  }

  const usageStats = [
    { label: 'فضای کل', value: '۲.۴ TB', color: 'bg-brand' },
    { label: 'تصاویر', value: '۱.۲ TB', color: 'bg-chart-2' },
    { label: 'ویدیوها', value: '۸۰۰ GB', color: 'bg-chart-3' },
    { label: 'اسناد', value: '۴۰۰ GB', color: 'bg-chart-4' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Section>
        <Container>
          <div className="mb-6">
            <h1 className="text-display-lg text-foreground">مدیریت استوریج</h1>
            <p className="mt-1 text-body-md text-muted-foreground">پیکربندی ذخیره‌سازی فایل‌ها</p>
          </div>

          {/* Usage Overview */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {usageStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className={`mb-3 h-2 w-full rounded-full bg-muted`}>
                  <div className={`h-2 rounded-full ${stat.color}`} style={{ width: '65%' }} />
                </div>
                <p className="text-2xl font-extrabold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Provider Selection */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-heading-1 text-foreground">ارائه‌دهنده ذخیره‌سازی</h2>
              <div className="space-y-3">
                <label className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors ${
                  provider === 'local' ? 'border-brand bg-brand/5' : 'border-border hover:border-brand/30'
                }`}>
                  <input
                    type="radio"
                    name="provider"
                    value="local"
                    checked={provider === 'local'}
                    onChange={() => setProvider('local')}
                    className="sr-only"
                  />
                  <div className={`flex size-10 items-center justify-center rounded-lg ${
                    provider === 'local' ? 'bg-brand text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    <HardDrive className="size-5" aria-hidden />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Local / NFS</p>
                    <p className="text-xs text-muted-foreground">ذخیره‌سازی محلی سرور</p>
                  </div>
                </label>

                <label className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors ${
                  provider === 's3' ? 'border-brand bg-brand/5' : 'border-border hover:border-brand/30'
                }`}>
                  <input
                    type="radio"
                    name="provider"
                    value="s3"
                    checked={provider === 's3'}
                    onChange={() => setProvider('s3')}
                    className="sr-only"
                  />
                  <div className={`flex size-10 items-center justify-center rounded-lg ${
                    provider === 's3' ? 'bg-brand text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    <Cloud className="size-5" aria-hidden />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">S3 Compatible</p>
                    <p className="text-xs text-muted-foreground">MinIO, Cloudian, AWS S3</p>
                  </div>
                </label>
              </div>
            </div>

            {/* S3 Config */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-heading-1 text-foreground">پیکربندی S3</h2>
              {provider === 's3' ? (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Endpoint</label>
                    <input
                      type="url"
                      value={s3Config.endpoint}
                      onChange={(e) => setS3Config((p) => ({ ...p, endpoint: e.target.value }))}
                      placeholder="https://minio.example.com"
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Region</label>
                      <input
                        type="text"
                        value={s3Config.region}
                        onChange={(e) => setS3Config((p) => ({ ...p, region: e.target.value }))}
                        placeholder="us-east-1"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">Bucket</label>
                      <input
                        type="text"
                        value={s3Config.bucket}
                        onChange={(e) => setS3Config((p) => ({ ...p, bucket: e.target.value }))}
                        placeholder="irib-media"
                        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Access Key</label>
                    <input
                      type="password"
                      value={s3Config.accessKey}
                      onChange={(e) => setS3Config((p) => ({ ...p, accessKey: e.target.value }))}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Secret Key</label>
                    <input
                      type="password"
                      value={s3Config.secretKey}
                      onChange={(e) => setS3Config((p) => ({ ...p, secretKey: e.target.value }))}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={testConnection}
                      disabled={testStatus === 'testing'}
                      className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                    >
                      {testStatus === 'testing' ? (
                        <RefreshCw className="size-4 animate-spin" aria-hidden />
                      ) : (
                        <CheckCircle className="size-4" aria-hidden />
                      )}
                      تست اتصال
                    </button>
                    {testStatus === 'success' && (
                      <span className="flex items-center gap-1.5 text-sm text-success">
                        <CheckCircle className="size-4" aria-hidden />
                        اتصال موفق
                      </span>
                    )}
                    {testStatus === 'error' && (
                      <span className="flex items-center gap-1.5 text-sm text-error">
                        <AlertCircle className="size-4" aria-hidden />
                        اتصال ناموفق
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <HardDrive className="mb-3 size-12 text-muted-foreground/30" aria-hidden />
                  <p className="text-sm text-muted-foreground">
                    ذخیره‌سازی محلی فعال است
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/60">
                    فایل‌ها در دایرکتوری سرور ذخیره می‌شوند
                  </p>
                </div>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </div>
  )
}
