/**
 * IRIB Digital Workplace Platform - Rate Limiting Middleware
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Injectable, NestMiddleware, Logger } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { RedisCacheService } from '../cache/redis-cache.service'

interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (req: Request) => string // Custom key generator
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean // Don't count failed requests
  perUser?: boolean // Enable per-user rate limiting
  perEndpoint?: boolean // Enable per-endpoint rate limiting
  endpointLimits?: Map<string, { windowMs: number; maxRequests: number }> // Custom limits per endpoint
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RateLimitMiddleware.name)
  private readonly options: RateLimitOptions
  private readonly requests = new Map<string, { count: number; resetTime: number }>()

  constructor(
    private cacheService: RedisCacheService,
    options: RateLimitOptions = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100,
    }
  ) {
    this.options = options
  }

  async use(req: Request, res: Response, next: NextFunction) {
    // Check for endpoint-specific limits first
    const endpointLimits = this.getEndpointLimits(req)
    const windowMs = endpointLimits?.windowMs || this.options.windowMs
    const maxRequests = endpointLimits?.maxRequests || this.options.maxRequests

    const key = this.options.keyGenerator ? this.options.keyGenerator(req) : this.getDefaultKey(req)

    try {
      // Try Redis first
      if (this.cacheService.getConnected()) {
        const result = await this.checkRedisRateLimit(key, windowMs, maxRequests)
        if (!result.allowed) {
          return this.sendRateLimitResponse(res, result.remaining, result.resetTime, maxRequests)
        }
        res.setHeader('X-RateLimit-Limit', maxRequests.toString())
        res.setHeader('X-RateLimit-Remaining', result.remaining.toString())
        res.setHeader('X-RateLimit-Reset', result.resetTime.toString())
        return next()
      }

      // Fallback to in-memory
      const result = this.checkInMemoryRateLimit(key, windowMs, maxRequests)
      if (!result.allowed) {
        return this.sendRateLimitResponse(res, result.remaining, result.resetTime, maxRequests)
      }
      res.setHeader('X-RateLimit-Limit', maxRequests.toString())
      res.setHeader('X-RateLimit-Remaining', result.remaining.toString())
      res.setHeader('X-RateLimit-Reset', result.resetTime.toString())
      next()
    } catch (error) {
      this.logger.error('Rate limiting error:', error)
      // On error, allow the request
      next()
    }
  }

  private getDefaultKey(req: Request): string {
    const ip = req.ip || req.connection.remoteAddress || 'unknown'
    let key = `ratelimit:${ip}`

    // Add user ID if per-user rate limiting is enabled
    if (this.options.perUser && req.user) {
      const userId = (req.user as any).id || (req.user as any).userId || (req.user as any).sub
      if (userId) {
        key += `:user:${userId}`
      }
    }

    // Add endpoint path if per-endpoint rate limiting is enabled
    if (this.options.perEndpoint) {
      key += `:path:${req.path}`
    }

    return key
  }

  private getEndpointLimits(req: Request): { windowMs: number; maxRequests: number } | null {
    if (!this.options.endpointLimits) {
      return null
    }

    // Check for exact path match
    if (this.options.endpointLimits.has(req.path)) {
      return this.options.endpointLimits.get(req.path)!
    }

    // Check for pattern match (e.g., /api/v1/*)
    for (const [pattern, limits] of this.options.endpointLimits) {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'))
        if (regex.test(req.path)) {
          return limits
        }
      }
    }

    return null
  }

  private async checkRedisRateLimit(
    key: string,
    windowMs: number,
    maxRequests: number
  ): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
  }> {
    const cacheKey = `ratelimit:${key}`
    const now = Date.now()
    // Get current request data
    const data = await this.cacheService.get<{ count: number; resetTime: number }>(cacheKey)

    if (!data || data.resetTime < now) {
      // New window
      const resetTime = now + windowMs
      await this.cacheService.set(cacheKey, { count: 1, resetTime }, windowMs / 1000)
      return { allowed: true, remaining: maxRequests - 1, resetTime }
    }

    if (data.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetTime: data.resetTime }
    }

    // Increment count
    const newCount = data.count + 1
    await this.cacheService.set(
      cacheKey,
      { count: newCount, resetTime: data.resetTime },
      windowMs / 1000
    )
    return { allowed: true, remaining: maxRequests - newCount, resetTime: data.resetTime }
  }

  private checkInMemoryRateLimit(
    key: string,
    windowMs: number,
    maxRequests: number
  ): {
    allowed: boolean
    remaining: number
    resetTime: number
  } {
    const now = Date.now()
    const data = this.requests.get(key)

    if (!data || data.resetTime < now) {
      // New window
      const resetTime = now + windowMs
      this.requests.set(key, { count: 1, resetTime })
      return { allowed: true, remaining: maxRequests - 1, resetTime }
    }

    if (data.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetTime: data.resetTime }
    }

    // Increment count
    data.count++
    return { allowed: true, remaining: maxRequests - data.count, resetTime: data.resetTime }
  }

  private sendRateLimitResponse(
    res: Response,
    remaining: number,
    resetTime: number,
    maxRequests: number
  ) {
    res.setHeader('Retry-After', Math.ceil((resetTime - Date.now()) / 1000).toString())
    res.setHeader('X-RateLimit-Limit', maxRequests.toString())
    res.setHeader('X-RateLimit-Remaining', remaining.toString())
    res.setHeader('X-RateLimit-Reset', resetTime.toString())
    res.status(429).json({
      statusCode: 429,
      message: 'Too many requests',
      error: 'Rate limit exceeded',
    })
  }
}

// Factory function for creating rate limit middleware with custom options
export function createRateLimitMiddleware(options: RateLimitOptions) {
  return {
    provide: 'RATE_LIMIT_OPTIONS',
    useValue: options,
  }
}
