/**
 * IRIB Digital Workplace Platform - Root Layout
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Vazirmatn } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import {
  ThemeProvider,
  PermissionProvider,
  ToasterProvider,
  QueryProvider,
  AuthProvider,
} from '@/components/providers'
import './globals.css'

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-vazirmatn',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'درگاه دیجیتال کارکنان | صدا و سیمای آذربایجان شرقی',
  description:
    'درگاه دیجیتال کارکنان صدا و سیمای مرکز آذربایجان شرقی — دسترسی به سامانه‌ها، اخبار، اطلاعیه‌ها و خدمات فناوری اطلاعات.',
  generator: 'v0.app',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'درگاه IRIB',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#00A6B6' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1220' },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const messages = await getMessages()

  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} bg-background`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <QueryProvider>
              <AuthProvider>
                <PermissionProvider>
                  {children}
                  <ToasterProvider />
                </PermissionProvider>
              </AuthProvider>
            </QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
