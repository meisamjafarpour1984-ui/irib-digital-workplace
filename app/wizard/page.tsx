'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Play,
  RefreshCw,
  Settings,
  Database,
  Shield,
  Server,
  Terminal,
  Globe,
  User,
  LayoutDashboard,
  FileText,
  Zap,
} from 'lucide-react'

interface WizardStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped'
  result?: string | number | boolean | Record<string, unknown> | null
  error?: string
  isOptional?: boolean
  category?: string
}

interface SystemHealth {
  nodeVersion: string
  postgres: boolean
  redis: boolean
  diskSpace: string
  memory: Record<string, unknown>
  dockerRunning: boolean
  isContainerized: boolean
  platform: string
}

const TROUBLESHOOTING_GUIDES: Record<
  string,
  {
    title: string
    description: string
    solutions: Array<{ step: string; command?: string; explanation: string }>
  }
> = {
  'health-check': {
    title: 'مشکلات بررسی سلامت سیستم',
    description: 'این مرحله سلامت سیستم، دیتابیس، Redis و Docker را بررسی می‌کند',
    solutions: [
      {
        step: 'بررسی PostgreSQL',
        command: 'docker ps | grep postgres',
        explanation: 'اگر container اجرا نیست، آن را start کنید: docker-compose up -d postgres',
      },
      {
        step: 'بررسی Redis',
        command: 'docker ps | grep redis',
        explanation: 'اگر container اجرا نیست، آن را start کنید: docker-compose up -d redis',
      },
      {
        step: 'بررسی Docker',
        command: 'docker --version',
        explanation: 'اگر Docker نصب نیست، Docker Desktop را نصب و اجرا کنید',
      },
      {
        step: 'بررسی فضای دیسک',
        command: 'df -h',
        explanation: 'اگر فضای دیسک کم است، فایل‌های غیرضروری را حذف کنید',
      },
    ],
  },
  'security-setup': {
    title: 'مشکلات تنظیمات امنیتی',
    description: 'این مرحله کلیدهای رمزنگاری را تولید می‌کند',
    solutions: [
      {
        step: 'ذخیره کلیدها',
        explanation:
          'کلیدهای تولید شده را فوراً در environment variables ذخیره کنید (ENCRYPTION_KEY, JWT_SECRET, SESSION_SECRET)',
      },
      {
        step: 'امنیت git',
        explanation: 'کلیدها را هرگز در git commit نکنید. فایل .env را به .gitignore اضافه کنید',
      },
      {
        step: 'رمز عبور قوی',
        explanation: 'از رمز عبور حداقل 12 کاراکتر با حروف بزرگ، کوچک، عدد و نماد استفاده کنید',
      },
      {
        step: 'ذخیره امن',
        explanation: 'کلیدها را در یک password manager یا مکان امن نگه دارید',
      },
    ],
  },
  'database-setup': {
    title: 'مشکلات تنظیمات دیتابیس',
    description: 'این مرحله schema، migrations و seed data را تنظیم می‌کند',
    solutions: [
      {
        step: 'Schema sync',
        command: 'npx prisma db push',
        explanation: 'اگر schema sync نشده، این دستور را اجرا کنید',
      },
      {
        step: 'Migrations',
        command: 'npx prisma migrate deploy',
        explanation: 'اگر migrations up-to-date نیست، این دستور را اجرا کنید',
      },
      {
        step: 'Seed data',
        command: 'pnpm dlx ts-node prisma/seed.ts',
        explanation: 'اگر seed data ready نیست، این دستور را اجرا کنید',
      },
      {
        step: 'Connection check',
        command: 'docker logs irib-postgres',
        explanation: 'اگر connection failed است، logs PostgreSQL را بررسی کنید',
      },
    ],
  },
  'docker-check': {
    title: 'مشکلات بررسی Docker',
    description: 'این مرحله نصب و اجرای Docker را بررسی می‌کند',
    solutions: [
      {
        step: 'نصب Docker',
        command: 'docker --version',
        explanation: 'اگر Docker نصب نیست، Docker Desktop را از docker.com دانلود و نصب کنید',
      },
      {
        step: 'نصب Docker Compose',
        command: 'docker-compose --version',
        explanation: 'اگر Docker Compose نصب نیست، آن را نصب کنید',
      },
      {
        step: 'Pull images',
        command: 'docker-compose pull',
        explanation: 'اگر images pull نشده، این دستور را اجرا کنید',
      },
      {
        step: 'Docker socket',
        explanation:
          'اگر درون container هستید، Docker socket را mount کنید: -v /var/run/docker.sock:/var/run/docker.sock',
      },
    ],
  },
  'install-dependencies': {
    title: 'مشکلات نصب Dependencies',
    description: 'این مرحله dependencies پروژه را نصب می‌کند',
    solutions: [
      {
        step: 'نصب pnpm',
        command: 'npm install -g pnpm',
        explanation: 'اگر pnpm نصب نیست، این دستور را اجرا کنید',
      },
      {
        step: 'نصب dependencies',
        command: 'pnpm install',
        explanation: 'اگر workspace نصب نشد، این دستور را دستی اجرا کنید',
      },
      {
        step: 'Network check',
        explanation:
          'اگر خطای network دارید، VPN یا proxy را بررسی کنید. از npm mirror استفاده کنید: npm config set registry https://registry.npmjs.org',
      },
      {
        step: 'Permission check',
        explanation:
          'اگر خطای permission دارید، با دسترسی admin اجرا کنید یا npm cache را پاک کنید: npm cache clean --force',
      },
    ],
  },
  'start-services': {
    title: 'مشکلات راه‌اندازی سرویس‌ها',
    description: 'این مرحله Docker services را راه‌اندازی می‌کند',
    solutions: [
      {
        step: 'بررسی logs',
        command: 'docker-compose logs',
        explanation: 'اگر سرویس‌ها start نشدند، logs را بررسی کنید',
      },
      {
        step: 'پورت‌های اشغال شده',
        command: 'netstat -ano | findstr :3001',
        explanation: 'اگر خطای port دارید، پورت‌های اشغال شده را آزاد کنید',
      },
      {
        step: 'Pull images',
        command: 'docker-compose pull',
        explanation: 'اگر image پیدا نشد، این دستور را اجرا کنید',
      },
      {
        step: 'Frontend',
        command: 'npm run dev',
        explanation: 'frontend را جداگانه با این دستور شروع کنید',
      },
    ],
  },
  'env-config': {
    title: 'مشکلات تنظیم Environment Variables',
    description: 'این مرحله فایل‌های .env را تنظیم می‌کند',
    solutions: [
      {
        step: 'ایجاد فایل .env',
        command: 'cp .env.example .env',
        explanation: 'اگر فایل .env وجود ندارد، از .env.example کپی کنید',
      },
      {
        step: 'تنظیم متغیرها',
        explanation:
          'مقادیر مناسب را در .env تنظیم کنید. از .env.example به عنوان راهنما استفاده کنید',
      },
      {
        step: 'امنیت',
        explanation: 'فایل .env را به .gitignore اضافه کنید تا در git commit نشود',
      },
    ],
  },
  'verify-app': {
    title: 'مشکلات تطبیق برنامه',
    description: 'این مرحله connectivity و basic functionality را تست می‌کند',
    solutions: [
      {
        step: 'Database connection',
        command: 'docker logs irib-postgres',
        explanation: 'اگر database connection failed است، PostgreSQL container را بررسی کنید',
      },
      {
        step: 'Backend reachability',
        command: 'curl http://localhost:3001/api/docs',
        explanation: 'اگر backend reachable نیست، backend container را بررسی کنید',
      },
      {
        step: 'Restart services',
        command: 'docker-compose restart backend',
        explanation: 'اگر مشکلات ادامه داشت، سرویس‌ها را restart کنید',
      },
    ],
  },
  'service-config': {
    title: 'مشکلات تنظیمات سرویس‌ها',
    description: 'این مرحله Keycloak، SMS، Email و Storage را تنظیم می‌کند',
    solutions: [
      {
        step: 'Keycloak',
        explanation: 'Keycloak را نصب و configure کنید. مطمئن شوید realm و client تنظیم شده است',
      },
      {
        step: 'SMS gateway',
        explanation:
          'SMS gateway را تنظیم کنید. credentials را در environment variables ذخیره کنید',
      },
      {
        step: 'SMTP server',
        explanation: 'SMTP server را configure کنید. از test email استفاده کنید',
      },
      {
        step: 'Storage',
        explanation: 'MinIO یا S3 را تنظیم کنید. bucket و access keys را configure کنید',
      },
    ],
  },
  'initialize-settings': {
    title: 'مشکلات مقداردهی اولیه تنظیمات',
    description: 'این مرحله تنظیمات پیش‌فرض سیستم را مقداردهی می‌کند',
    solutions: [
      {
        step: 'Admin user',
        command: 'pnpm dlx ts-node prisma/seed.ts',
        explanation: 'اگر admin user وجود ندارد، seed script را اجرا کنید',
      },
      {
        step: 'Admin role',
        command: 'pnpm dlx ts-node prisma/seed.ts',
        explanation: 'اگر admin role وجود ندارد، seed script را اجرا کنید',
      },
      {
        step: 'Settings check',
        explanation: 'تنظیمات را در database بررسی کنید',
      },
    ],
  },
  'pre-deployment-checklist': {
    title: 'مشکلات چک‌لیست قبل از تحویل',
    description: 'این مرحله اعتبارسنجی امنیتی و تنظیمات را انجام می‌دهد',
    solutions: [
      {
        step: 'Encryption keys',
        explanation: 'کلیدهای رمزنگاری را در environment variables ذخیره کنید',
      },
      {
        step: 'Backup',
        explanation: 'قبل از deployment backup بگیرید',
      },
      {
        step: 'Security scan',
        explanation: 'security scan را اجرا کنید',
      },
      {
        step: 'Load test',
        explanation: 'load test را اجرا کنید تا performance را بررسی کنید',
      },
    ],
  },
  'run-tests': {
    title: 'مشکلات اجرای تست‌ها',
    description: 'این مرحله unit tests و integration tests را اجرا می‌کند',
    solutions: [
      {
        step: 'Unit tests',
        command: 'pnpm test',
        explanation: 'اگر unit tests fail شد، کد را بررسی و اصلاح کنید',
      },
      {
        step: 'Integration tests',
        command: 'pnpm test:e2e',
        explanation: 'اگر integration tests fail شد، environment را بررسی کنید',
      },
      {
        step: 'Test coverage',
        command: 'pnpm test:coverage',
        explanation: 'coverage را بررسی کنید و تست‌های بیشتری بنویسید',
      },
    ],
  },
}

export default function WizardPage() {
  const isDevelopmentWizardEnabled = process.env.NEXT_PUBLIC_ENABLE_DEV_WIZARD !== 'false'

  const [mode, setMode] = useState<'development' | 'production'>('development')
  const [steps, setSteps] = useState<WizardStep[]>([])
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(false)
  const [executingStep, setExecutingStep] = useState<string | null>(null)
  const [selectedStep, setSelectedStep] = useState<WizardStep | null>(null)
  const [dockerContainers, setDockerContainers] = useState<
    Array<{ id: string; name: string; status: string; state: string; image: string }>
  >([])
  const [showTroubleshooting, setShowTroubleshooting] = useState(false)
  const [projectChanges, setProjectChanges] = useState<{
    changes: Array<{
      type: string
      file: string
      description: string
      severity: string
      command?: string
      action?: string
    }>
    summary?: {
      frontend?: boolean
      backend?: boolean
      database?: boolean
      docker?: boolean
      shared?: boolean
      total?: number
      config?: number
      breaking?: number
    }
  } | null>(null)
  const [loadingChanges, setLoadingChanges] = useState(false)

  const API_BASE = '/api/wizard'

  const headers = {
    'Content-Type': 'application/json',
  }

  // Fetch wizard steps
  const fetchSteps = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/steps?mode=${mode}`, { headers })
      if (response.ok) {
        const data = await response.json()
        setSteps(data)
      } else {
        console.error('Failed to fetch steps:', response.status)
        // Set default steps if backend is not available
        setSteps([
          {
            id: 'backend-not-available',
            title: 'Backend در دسترس نیست',
            description: 'لطفاً مطمئن شوید backend روی پورت 3001 اجرا است',
            status: 'failed',
            error: 'Backend connection failed',
          },
        ])
      }
    } catch (error) {
      console.error('Failed to fetch steps:', error)
      // Set default steps if backend is not available
      setSteps([
        {
          id: 'backend-not-available',
          title: 'Backend در دسترس نیست',
          description: 'لطفاً مطمئن شوید backend روی پورت 3001 اجرا است',
          status: 'failed',
          error: 'Backend connection failed',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  // Fetch system health
  const fetchHealth = async () => {
    try {
      const response = await fetch(`${API_BASE}/health`, { headers })
      if (response.ok) {
        const data = await response.json()
        setHealth(data)
      } else {
        console.error('Failed to fetch health:', response.status)
        setHealth({
          nodeVersion: 'Unknown',
          postgres: false,
          redis: false,
          diskSpace: 'N/A',
          memory: {},
          dockerRunning: false,
          isContainerized: false,
          platform: 'Unknown',
        })
      }
    } catch (error) {
      console.error('Failed to fetch health:', error)
      setHealth({
        nodeVersion: 'Unknown',
        postgres: false,
        redis: false,
        diskSpace: 'N/A',
        memory: {},
        dockerRunning: false,
        isContainerized: false,
        platform: 'Unknown',
      })
    }
  }

  // Execute a step
  const executeStep = async (stepId: string) => {
    setExecutingStep(stepId)
    try {
      const response = await fetch(`${API_BASE}/steps/${stepId}/execute`, {
        method: 'POST',
        headers,
      })
      if (response.ok) {
        const data = await response.json()
        setSteps((prev) => prev.map((step) => (step.id === stepId ? data : step)))
        if (data.status === 'failed') {
          setSelectedStep(data)
          setShowTroubleshooting(true)
        }
      }
    } catch (error) {
      console.error('Failed to execute step:', error)
    } finally {
      setExecutingStep(null)
    }
  }

  // Fetch Docker containers
  const fetchDockerContainers = async () => {
    try {
      const response = await fetch(`${API_BASE}/docker/containers`, { headers })
      if (response.ok) {
        const data = await response.json()
        setDockerContainers(data)
      } else {
        const error = await response.json()
        setDockerContainers([
          {
            id: 'error',
            name: 'Docker management not available',
            status:
              error.message || 'Backend is running inside container without Docker socket mount',
            image: '',
            state: '',
          },
        ])
      }
    } catch {
      setDockerContainers([
        {
          id: 'error',
          name: 'Docker management not available',
          status: 'Failed to connect to backend',
          image: '',
          state: '',
        },
      ])
    }
  }

  // Fetch project changes
  const fetchProjectChanges = async () => {
    setLoadingChanges(true)
    try {
      const response = await fetch(`${API_BASE}/project-changes`, { headers })
      if (response.ok) {
        const data = await response.json()
        setProjectChanges(data)
      } else {
        console.error('Failed to fetch project changes:', response.status)
        setProjectChanges({
          changes: [],
          summary: {
            frontend: false,
            backend: false,
            database: false,
            docker: false,
            shared: false,
          },
        })
      }
    } catch (error) {
      console.error('Failed to fetch project changes:', error)
      setProjectChanges({
        changes: [],
        summary: {
          frontend: false,
          backend: false,
          database: false,
          docker: false,
          shared: false,
        },
      })
    } finally {
      setLoadingChanges(false)
    }
  }

  // Execute restart action
  const executeRestartAction = async (action: string) => {
    try {
      const response = await fetch(`${API_BASE}/restart-action`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action }),
      })
      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        fetchProjectChanges()
      }
    } catch (error) {
      console.error('Failed to execute restart action:', error)
    }
  }

  // Docker container action
  const containerAction = async (containerId: string, action: 'start' | 'stop' | 'restart') => {
    try {
      await fetch(`${API_BASE}/docker/containers/${containerId}/${action}`, {
        method: 'POST',
        headers,
      })
      fetchDockerContainers()
    } catch (error) {
      console.error(`Failed to ${action} container:`, error)
    }
  }

  useEffect(() => {
    if (!isDevelopmentWizardEnabled) return
    fetchSteps()
    fetchHealth()
    fetchProjectChanges()
  }, [isDevelopmentWizardEnabled, mode])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'in_progress':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
      case 'skipped':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
    }
  }

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'environment':
        return <Server className="w-4 h-4" />
      case 'security':
        return <Shield className="w-4 h-4" />
      case 'database':
        return <Database className="w-4 h-4" />
      case 'services':
        return <Settings className="w-4 h-4" />
      case 'verification':
        return <CheckCircle2 className="w-4 h-4" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'environment':
        return 'bg-blue-100 text-blue-800'
      case 'security':
        return 'bg-red-100 text-red-800'
      case 'database':
        return 'bg-green-100 text-green-800'
      case 'services':
        return 'bg-purple-100 text-purple-800'
      case 'verification':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isDevelopmentWizardEnabled) return null

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
      dir="rtl"
    >
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">ویزارد راه‌اندازی سیستم</h1>
              <p className="text-white/80 text-lg">
                IRIB Digital Workplace - راه‌اندازی و پیکربندی حرفه‌ای
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={mode === 'development' ? 'default' : 'outline'}
                onClick={() => setMode('development')}
                className={
                  mode === 'development'
                    ? 'bg-white text-purple-900 hover:bg-white/90'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }
              >
                Development
              </Button>
              <Button
                variant={mode === 'production' ? 'default' : 'outline'}
                onClick={() => setMode('production')}
                className={
                  mode === 'production'
                    ? 'bg-white text-purple-900 hover:bg-white/90'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }
              >
                Production
              </Button>
            </div>
          </div>
          <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-white/70 text-sm">
              <strong className="text-white">راهنما:</strong> مراحل را به ترتیب اجرا کنید. در صورت
              بروز مشکل، دکمه "عیب‌یابی" را بزنید.
            </p>
          </div>
        </div>

        <Tabs defaultValue="steps" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="steps">مراحل Setup</TabsTrigger>
            <TabsTrigger value="health">سلامت سیستم</TabsTrigger>
            <TabsTrigger value="management">مدیریت سیستم</TabsTrigger>
            <TabsTrigger value="docker">مدیریت Docker</TabsTrigger>
            <TabsTrigger value="changes">تغییرات پروژه</TabsTrigger>
            <TabsTrigger value="info">اطلاعات پروژه</TabsTrigger>
          </TabsList>

          <TabsContent value="steps" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  مراحل Setup - {mode === 'development' ? 'Development' : 'Production'}
                </CardTitle>
                <CardDescription>
                  این مراحل را به ترتیب اجرا کنید تا سیستم کامل پیکربندی شود
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {steps.map((step) => (
                      <Card key={step.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="mt-1">{getStatusIcon(step.status)}</div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold">{step.title}</h3>
                                  {step.isOptional && <Badge variant="secondary">اختیاری</Badge>}
                                  {step.category && (
                                    <Badge className={getCategoryColor(step.category)}>
                                      <div className="flex items-center gap-1">
                                        {getCategoryIcon(step.category)}
                                        {step.category}
                                      </div>
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{step.description}</p>
                                {step.result && (
                                  <div className="mt-2 p-2 bg-muted rounded text-xs font-mono overflow-auto">
                                    {JSON.stringify(step.result, null, 2)}
                                  </div>
                                )}
                                {step.error && (
                                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded text-red-800">
                                    <div className="flex items-center gap-2">
                                      <AlertTriangle className="h-4 w-4" />
                                      <span className="font-semibold">خطا</span>
                                    </div>
                                    <p className="text-sm mt-1">{step.error}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                onClick={() => executeStep(step.id)}
                                disabled={
                                  executingStep === step.id || step.status === 'in_progress'
                                }
                              >
                                {executingStep === step.id ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Play className="w-4 h-4" />
                                )}
                                {executingStep === step.id ? 'در حال اجرا...' : 'اجرا'}
                              </Button>
                              {step.status === 'failed' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedStep(step)
                                    setShowTroubleshooting(true)
                                  }}
                                >
                                  <Terminal className="w-4 h-4 mr-2" />
                                  عیب‌یابی
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>سلامت سیستم</CardTitle>
                <CardDescription>وضعیت سلامت سیستم و سرویس‌ها</CardDescription>
              </CardHeader>
              <CardContent>
                {health ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Server className="w-5 h-5" />
                        <span className="font-medium">Node.js:</span>
                        <Badge variant={health.nodeVersion ? 'default' : 'destructive'}>
                          {health.nodeVersion || 'نامشخص'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        <span className="font-medium">PostgreSQL:</span>
                        <Badge variant={health.postgres ? 'default' : 'destructive'}>
                          {health.postgres ? 'متصل' : 'نامتصل'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Server className="w-5 h-5" />
                        <span className="font-medium">Redis:</span>
                        <Badge variant={health.redis ? 'default' : 'destructive'}>
                          {health.redis ? 'متصل' : 'نامتصل'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Terminal className="w-5 h-5" />
                        <span className="font-medium">Docker:</span>
                        <Badge variant={health.dockerRunning ? 'default' : 'destructive'}>
                          {health.dockerRunning ? 'در حال اجرا' : 'متوقف'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Info className="w-5 h-5" />
                        <span className="font-medium">Platform:</span>
                        <Badge>{health.platform}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Info className="w-5 h-5" />
                        <span className="font-medium">Containerized:</span>
                        <Badge variant={health.isContainerized ? 'default' : 'secondary'}>
                          {health.isContainerized ? 'بله' : 'خیر'}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">فضای دیسک:</h4>
                      <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                        {health.diskSpace}
                      </pre>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">حافظه:</h4>
                      <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                        {JSON.stringify(health.memory, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    در حال بارگذاری اطلاعات...
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="management" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>مدیریت سیستم</CardTitle>
                <CardDescription>عملیات مدیریتی روی سیستم</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (confirm('آیا مطمئن هستید؟ این عملیات تمام داده‌ها را حذف می‌کند.')) {
                        fetch(`${API_BASE}/management/reset-database`, { method: 'POST', headers })
                      }
                    }}
                  >
                    <Database className="w-4 h-4 mr-2" />
                    بازنشانی دیتابیس
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      fetch(`${API_BASE}/management/reset-redis`, { method: 'POST', headers })
                    }
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    بازنشانی Redis
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (confirm('آیا مطمئن هستید؟ این عملیات تمام داده‌ها را حذف می‌کند.')) {
                        fetch(`${API_BASE}/management/reset-all`, { method: 'POST', headers })
                      }
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    بازنشانی کل سیستم
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      fetch(`${API_BASE}/management/stop-services`, { method: 'POST', headers })
                    }
                  >
                    <Server className="w-4 h-4 mr-2" />
                    توقف سرویس‌ها
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      fetch(`${API_BASE}/management/restart-services`, { method: 'POST', headers })
                    }
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    راه‌اندازی مجدد سرویس‌ها
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (
                        confirm(
                          'آیا مطمئن هستید؟ این عملیات تمام سرویس‌ها و volumes را حذف می‌کند.'
                        )
                      ) {
                        fetch(`${API_BASE}/management/clean-everything`, {
                          method: 'POST',
                          headers,
                        })
                      }
                    }}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    پاکسازی کامل
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="docker" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>مدیریت Docker</CardTitle>
                <CardDescription>مدیریت Docker containers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button onClick={fetchDockerContainers}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    بروزرسانی لیست
                  </Button>
                  {dockerContainers.length > 0 && dockerContainers[0].id === 'error' ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-yellow-900">
                            مدیریت Docker در دسترس نیست
                          </h4>
                          <p className="text-sm text-yellow-800 mt-1">
                            Backend درون یک Docker container اجرا می‌شود. برای مدیریت Docker،
                            backend باید روی host اجرا شود یا Docker socket باید mount شود.
                          </p>
                          <div className="mt-3 p-3 bg-yellow-100 rounded">
                            <p className="text-xs text-yellow-900 font-medium">راه‌حل:</p>
                            <p className="text-xs text-yellow-800 mt-1">
                              برای مدیریت Docker، از دستورات docker-compose مستقیماً در terminal
                              استفاده کنید:
                            </p>
                            <code className="block mt-2 text-xs bg-white p-2 rounded">
                              docker-compose ps
                              <br />
                              docker-compose start [service]
                              <br />
                              docker-compose stop [service]
                              <br />
                              docker-compose restart [service]
                            </code>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : dockerContainers.length > 0 ? (
                    <div className="space-y-2">
                      {dockerContainers.map((container) => (
                        <Card key={container.id}>
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold">{container.name}</h4>
                                <p className="text-sm text-muted-foreground">{container.status}</p>
                                <p className="text-xs text-muted-foreground">{container.image}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => containerAction(container.id, 'start')}
                                >
                                  Start
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => containerAction(container.id, 'stop')}
                                >
                                  Stop
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => containerAction(container.id, 'restart')}
                                >
                                  Restart
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      هیچ container یافت نشد
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="changes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  تغییرات پروژه
                </CardTitle>
                <CardDescription>
                  تشخیص تغییرات در ساختار پروژه و اقدامات لازم برای اعمال آنها
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button onClick={fetchProjectChanges} disabled={loadingChanges}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loadingChanges ? 'animate-spin' : ''}`} />
                    بروزرسانی لیست تغییرات
                  </Button>

                  {loadingChanges ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="w-8 h-8 animate-spin" />
                    </div>
                  ) : projectChanges ? (
                    <>
                      {/* Summary */}
                      <div className="grid grid-cols-5 gap-4 mb-6">
                        <div
                          className={`p-4 rounded-lg ${projectChanges.summary?.frontend ? 'bg-blue-100 border-blue-300' : 'bg-gray-100 border-gray-300'} border`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <LayoutDashboard className="w-4 h-4" />
                            <span className="font-medium">Frontend</span>
                          </div>
                          <Badge
                            variant={projectChanges.summary?.frontend ? 'default' : 'secondary'}
                          >
                            {projectChanges.summary?.frontend ? 'تغییر دارد' : 'بدون تغییر'}
                          </Badge>
                        </div>
                        <div
                          className={`p-4 rounded-lg ${projectChanges.summary?.backend ? 'bg-purple-100 border-purple-300' : 'bg-gray-100 border-gray-300'} border`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Server className="w-4 h-4" />
                            <span className="font-medium">Backend</span>
                          </div>
                          <Badge
                            variant={projectChanges.summary?.backend ? 'default' : 'secondary'}
                          >
                            {projectChanges.summary?.backend ? 'تغییر دارد' : 'بدون تغییر'}
                          </Badge>
                        </div>
                        <div
                          className={`p-4 rounded-lg ${projectChanges.summary?.database ? 'bg-green-100 border-green-300' : 'bg-gray-100 border-gray-300'} border`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Database className="w-4 h-4" />
                            <span className="font-medium">Database</span>
                          </div>
                          <Badge
                            variant={projectChanges.summary?.database ? 'default' : 'secondary'}
                          >
                            {projectChanges.summary?.database ? 'تغییر دارد' : 'بدون تغییر'}
                          </Badge>
                        </div>
                        <div
                          className={`p-4 rounded-lg ${projectChanges.summary?.docker ? 'bg-orange-100 border-orange-300' : 'bg-gray-100 border-gray-300'} border`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Terminal className="w-4 h-4" />
                            <span className="font-medium">Docker</span>
                          </div>
                          <Badge variant={projectChanges.summary?.docker ? 'default' : 'secondary'}>
                            {projectChanges.summary?.docker ? 'تغییر دارد' : 'بدون تغییر'}
                          </Badge>
                        </div>
                        <div
                          className={`p-4 rounded-lg ${projectChanges.summary?.shared ? 'bg-red-100 border-red-300' : 'bg-gray-100 border-gray-300'} border`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4" />
                            <span className="font-medium">Shared</span>
                          </div>
                          <Badge variant={projectChanges.summary?.shared ? 'default' : 'secondary'}>
                            {projectChanges.summary?.shared ? 'تغییر دارد' : 'بدون تغییر'}
                          </Badge>
                        </div>
                      </div>

                      {/* Changes List */}
                      {projectChanges.changes.length > 0 ? (
                        <div className="space-y-3">
                          <h3 className="font-semibold">تغییرات شناسایی شده:</h3>
                          {projectChanges.changes.map(
                            (
                              change: {
                                type: string
                                file: string
                                description: string
                                severity: string
                                command?: string
                                action?: string
                              },
                              index: number
                            ) => (
                              <Card key={index} className="border-l-4 border-l-yellow-500">
                                <CardContent className="pt-4">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Badge
                                          className={
                                            change.type === 'frontend'
                                              ? 'bg-blue-100 text-blue-800'
                                              : change.type === 'backend'
                                                ? 'bg-purple-100 text-purple-800'
                                                : change.type === 'database'
                                                  ? 'bg-green-100 text-green-800'
                                                  : change.type === 'docker'
                                                    ? 'bg-orange-100 text-orange-800'
                                                    : 'bg-red-100 text-red-800'
                                          }
                                        >
                                          {change.type}
                                        </Badge>
                                        <span className="font-medium">{change.file}</span>
                                      </div>
                                      <p className="text-sm text-muted-foreground mb-2">
                                        {change.description}
                                      </p>
                                      {change.command && (
                                        <code className="text-xs bg-muted p-2 rounded block">
                                          {change.command}
                                        </code>
                                      )}
                                    </div>
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        change.action && executeRestartAction(change.action)
                                      }
                                      className="flex items-center gap-2"
                                    >
                                      <Play className="w-4 h-4" />
                                      اجرا
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
                          <p>هیچ تغییری در یک دقیقه اخیر شناسایی نشده است</p>
                          <p className="text-sm mt-2">پروژه شما به‌روز است</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      در حال بارگذاری اطلاعات...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>اطلاعات پروژه</CardTitle>
                <CardDescription>
                  آدرس‌های مهم و اکانت‌های پیش‌فرض برای دسترسی به سیستم
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Important URLs */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-600" />
                    آدرس‌های مهم
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all"
                      onClick={() => window.open('http://localhost:3002', '_blank')}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Globe className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-semibold text-blue-900">Frontend</span>
                      </div>
                      <span className="text-xs text-blue-700 font-mono">localhost:3002</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-green-50 hover:border-green-300 transition-all"
                      onClick={() => window.open('http://localhost:3001/api/v1', '_blank')}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                          <Server className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="font-semibold text-green-900">Backend API</span>
                      </div>
                      <span className="text-xs text-green-700 font-mono">
                        localhost:3001/api/v1
                      </span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-purple-50 hover:border-purple-300 transition-all"
                      onClick={() => window.open('http://localhost:3001/api/docs', '_blank')}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Terminal className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="font-semibold text-purple-900">Swagger Docs</span>
                      </div>
                      <span className="text-xs text-purple-700 font-mono">
                        localhost:3001/api/docs
                      </span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-orange-50 hover:border-orange-300 transition-all"
                      onClick={() => window.open('http://localhost:3002/dashboard', '_blank')}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                          <LayoutDashboard className="w-4 h-4 text-orange-600" />
                        </div>
                        <span className="font-semibold text-orange-900">Dashboard</span>
                      </div>
                      <span className="text-xs text-orange-700 font-mono">
                        localhost:3002/dashboard
                      </span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-cyan-50 hover:border-cyan-300 transition-all"
                      onClick={() => window.open('http://localhost:9000', '_blank')}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                          <Database className="w-4 h-4 text-cyan-600" />
                        </div>
                        <span className="font-semibold text-cyan-900">MinIO</span>
                      </div>
                      <span className="text-xs text-cyan-700 font-mono">localhost:9000</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-indigo-50 hover:border-indigo-300 transition-all"
                      onClick={() => window.open('http://localhost:9200', '_blank')}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <Database className="w-4 h-4 text-indigo-600" />
                        </div>
                        <span className="font-semibold text-indigo-900">OpenSearch</span>
                      </div>
                      <span className="text-xs text-indigo-700 font-mono">localhost:9200</span>
                    </Button>
                  </div>
                </div>

                {/* Default Accounts */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-600" />
                    اکانت‌های پیش‌فرض
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center flex-shrink-0">
                          <Shield className="w-5 h-5 text-blue-700" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-blue-900">Admin System</p>
                          <div className="mt-2 space-y-1 text-xs text-blue-800">
                            <p>
                              <span className="font-medium">Username:</span> admin
                            </p>
                            <p>
                              <span className="font-medium">Password:</span> admin123
                            </p>
                            <p>
                              <span className="font-medium">Role:</span> Full Access
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center flex-shrink-0">
                          <Database className="w-5 h-5 text-green-700" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-green-900">PostgreSQL</p>
                          <div className="mt-2 space-y-1 text-xs text-green-800">
                            <p>
                              <span className="font-medium">User:</span> irib_user
                            </p>
                            <p>
                              <span className="font-medium">Password:</span> irib_password
                            </p>
                            <p>
                              <span className="font-medium">Database:</span> irib_dwp
                            </p>
                            <p>
                              <span className="font-medium">Port:</span> 5432
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-200 flex items-center justify-center flex-shrink-0">
                          <Database className="w-5 h-5 text-red-700" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-red-900">Redis</p>
                          <div className="mt-2 space-y-1 text-xs text-red-800">
                            <p>
                              <span className="font-medium">Password:</span> irib_redis_password
                            </p>
                            <p>
                              <span className="font-medium">Port:</span> 6379
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-cyan-200 flex items-center justify-center flex-shrink-0">
                          <Database className="w-5 h-5 text-cyan-700" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-cyan-900">MinIO</p>
                          <div className="mt-2 space-y-1 text-xs text-cyan-800">
                            <p>
                              <span className="font-medium">Access Key:</span> irib_minio_access
                            </p>
                            <p>
                              <span className="font-medium">Secret Key:</span> irib_minio_secret
                            </p>
                            <p>
                              <span className="font-medium">Port:</span> 9000
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Access */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-yellow-600" />
                    دسترسی سریع
                  </h3>
                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-yellow-900">داشبورد مدیریت</p>
                        <p className="text-sm text-yellow-800 mt-1">دسترسی کامل به مدیریت پروژه</p>
                      </div>
                      <Button
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        onClick={() => window.open('http://localhost:3002/dashboard', '_blank')}
                      >
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        باز کردن داشبورد
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Troubleshooting Modal */}
        {showTroubleshooting && selectedStep && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="w-5 h-5" />
                  راهنمای عیب‌یابی - {selectedStep.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {TROUBLESHOOTING_GUIDES[selectedStep.id] ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-semibold">خطا در اجرای مرحله</span>
                      </div>
                      <p className="text-sm mt-1">{selectedStep.error}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">
                        {TROUBLESHOOTING_GUIDES[selectedStep.id].title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        {TROUBLESHOOTING_GUIDES[selectedStep.id].description}
                      </p>
                      <ul className="space-y-3">
                        {TROUBLESHOOTING_GUIDES[selectedStep.id].solutions.map(
                          (solution, index) => (
                            <li key={index} className="flex flex-col gap-2 text-sm">
                              <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="font-medium">{solution.step}</span>
                              </div>
                              {solution.command && (
                                <div className="mr-6">
                                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                    {solution.command}
                                  </code>
                                </div>
                              )}
                              <p className="mr-6 text-muted-foreground">{solution.explanation}</p>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-800">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      <span className="font-semibold">راهنمای عیب‌یابی موجود نیست</span>
                    </div>
                    <p className="text-sm mt-1">
                      برای این مرحله راهنمای عیب‌یابی تعریف نشده است. لطفاً logs را بررسی کنید یا با
                      تیم توسعه تماس بگیرید.
                    </p>
                  </div>
                )}
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowTroubleshooting(false)}>
                    بستن
                  </Button>
                  <Button
                    onClick={() => {
                      setShowTroubleshooting(false)
                      executeStep(selectedStep.id)
                    }}
                  >
                    تلاش مجدد
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
