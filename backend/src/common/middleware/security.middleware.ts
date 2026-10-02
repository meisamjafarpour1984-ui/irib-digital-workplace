/**
 * IRIB Digital Workplace Platform - Security Middleware
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Injectable, NestMiddleware } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://localhost:3001 https://*.irib.ir https://*.irib-dwp.ir; media-src 'self' https:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;"
    )

    // X-Frame-Options
    res.setHeader('X-Frame-Options', 'DENY')

    // X-Content-Type-Options
    res.setHeader('X-Content-Type-Options', 'nosniff')

    // Referrer-Policy
    res.setHeader('Referrer-Policy', 'origin-when-cross-origin')

    // X-XSS-Protection
    res.setHeader('X-XSS-Protection', '1; mode=block')

    // Strict-Transport-Security (only in production)
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
    }

    // Permissions-Policy
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

    // X-Permitted-Cross-Domain-Policies
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none')

    // Cache-Control for sensitive endpoints
    if (req.path.includes('/auth/') || req.path.includes('/users/me')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    }

    next()
  }
}

export function securityMiddleware(req: Request, res: Response, next: NextFunction) {
  const middleware = new SecurityMiddleware()
  middleware.use(req, res, next)
}
