import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './lib/i18n'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
})

export function proxy(request: NextRequest) {
  const response = intlMiddleware(request)

  // Generate nonce for CSP
  const nonce = crypto.randomUUID()

  // Get API URLs from environment
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Parse URLs for CSP
  const apiUrlObj = new URL(apiUrl)
  const wsUrlObj = new URL(wsUrl.replace('ws://', 'http://').replace('wss://', 'https://'))
  const appUrlObj = new URL(appUrl)

  // Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('X-DNS-Prefetch-Control', 'on')

  // HSTS (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    )
  }

  // Content Security Policy - only in production
  // In development, let Next.js handle CSP to avoid nonce conflicts with dev tools
  if (process.env.NODE_ENV === 'production') {
    const scriptSrc = `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`

    const csp = [
      "default-src 'self'",
      scriptSrc,
      `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob: https:",
      `connect-src 'self' ${apiUrlObj.origin} ${wsUrlObj.origin} ${appUrlObj.origin}`,
      "frame-src 'self'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join('; ')

    response.headers.set('Content-Security-Policy', csp)
    response.headers.set('X-Nonce', nonce)
  }

  response.headers.set('X-RateLimit-Policy', 'default')

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next|_vercel|_next/static|_next/image|favicon.ico|public/|.*\\..*).*)',
  ],
}
