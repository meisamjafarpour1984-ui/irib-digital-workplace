import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Vazirmatn } from 'next/font/google'
import {
  ThemeProvider,
  PermissionProvider,
  ToasterProvider,
  QueryProvider,
} from '@/components/providers'
import './globals.css'

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-vazirmatn',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'پرتال دیجیتال کارکنان | صدا و سیمای آذربایجان شرقی',
  description:
    'پرتال دیجیتال کارکنان صدا و سیمای مرکز آذربایجان شرقی — دسترسی به سامانه‌ها، اخبار، اطلاعیه‌ها و خدمات فناوری اطلاعات.',
  generator: 'v0.app',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'پرتال IRIB',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#00A6B6' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1220' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} bg-background`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <ThemeProvider>
          <QueryProvider>
            <PermissionProvider>
              {children}
              <ToasterProvider />
            </PermissionProvider>
          </QueryProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
