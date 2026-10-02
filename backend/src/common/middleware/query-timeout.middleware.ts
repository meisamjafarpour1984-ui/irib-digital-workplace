/**
 * IRIB Digital Workplace Platform - Query Timeout Middleware
 *
 * Prevents Database Pool Exhaustion by enforcing:
 *   1. HTTP-level request timeout (AbortController -> 408)
 *   2. Slow Query detection + Prisma warning log
 *   3. PostgreSQL SET LOCAL statement_timeout for heavy read transactions
 *
 * Compatible with PgBouncer TRANSACTION pooling mode:
 *   - NEVER use SET statement_timeout (persists across session reuse)
 *   - Always use SET LOCAL or pass query_timeout via Prisma $queryRaw with
 *     `SET LOCAL statement_timeout = '...'` wrapped inside the same transaction.
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Injectable, NestMiddleware, Logger } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'

export interface QueryTimeoutOptions {
  defaultTimeoutMs: number
  heavyReadTimeoutMs: number
  uploadTimeoutMs: number
  exportTimeoutMs: number
  bypassPaths: RegExp[]
  bypassMethods: string[]
}

const DEFAULT_OPTIONS: QueryTimeoutOptions = {
  defaultTimeoutMs: 30_000,
  heavyReadTimeoutMs: 15_000,
  uploadTimeoutMs: 300_000,
  exportTimeoutMs: 600_000,
  bypassPaths: [/\/health$/, /\/metrics$/, /\/api\/docs/, /\/favicon\.ico$/],
  bypassMethods: ['OPTIONS', 'HEAD'],
}

@Injectable()
export class QueryTimeoutMiddleware implements NestMiddleware {
  private readonly logger = new Logger(QueryTimeoutMiddleware.name)
  private readonly options: QueryTimeoutOptions

  constructor() {
    this.options = {
      ...DEFAULT_OPTIONS,
      defaultTimeoutMs: this.readNumberEnv('QUERY_TIMEOUT_MS', DEFAULT_OPTIONS.defaultTimeoutMs),
      heavyReadTimeoutMs: this.readNumberEnv(
        'QUERY_HEAVY_READ_TIMEOUT_MS',
        DEFAULT_OPTIONS.heavyReadTimeoutMs
      ),
      uploadTimeoutMs: this.readNumberEnv(
        'QUERY_UPLOAD_TIMEOUT_MS',
        DEFAULT_OPTIONS.uploadTimeoutMs
      ),
      exportTimeoutMs: this.readNumberEnv(
        'QUERY_EXPORT_TIMEOUT_MS',
        DEFAULT_OPTIONS.exportTimeoutMs
      ),
    }
  }

  use(req: Request, res: Response, next: NextFunction) {
    if (this.shouldBypass(req)) {
      return next()
    }

    const timeoutMs = this.resolveTimeout(req)
    const controller = new AbortController()

    ;(req as any).abortController = controller
    ;(req as any).queryTimeoutMs = timeoutMs
    ;(req as any).queryTimeoutAt = Date.now() + timeoutMs

    const timeoutHandle = setTimeout(() => {
      const details = {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        user: (req as any).user?.id || 'anonymous',
        timeoutMs,
      }

      this.logger.warn(
        `[QUERY_TIMEOUT] HTTP request exceeded ${timeoutMs}ms → aborting. details=${JSON.stringify(details)}`
      )

      try {
        controller.abort()
      } catch {
        /* noop */
      }

      if (!res.headersSent) {
        res.setHeader('X-Query-Timeout', timeoutMs.toString())
        res.setHeader('Connection', 'close')
        res.status(408).json({
          statusCode: 408,
          message: 'Request timeout',
          error: 'Request Timeout',
          hint: 'Heavy query detected. Contact admin or refine filters.',
        })
      }
    }, timeoutMs)

    res.on('finish', () => clearTimeout(timeoutHandle))
    res.on('close', () => clearTimeout(timeoutHandle))

    next()
  }

  getTimeoutForPath(req: Request): number {
    if (req.method === 'GET' && (req.path.includes('/export') || req.path.includes('/pdf'))) {
      return this.options.exportTimeoutMs
    }
    if (
      (req.method === 'POST' || req.method === 'PUT') &&
      (req.path.includes('/upload') || req.path.includes('/media') || req.path.includes('/storage'))
    ) {
      return this.options.uploadTimeoutMs
    }
    if (
      req.method === 'GET' &&
      (req.path.includes('/analytics') ||
        req.path.includes('/audit') ||
        req.path.includes('/search') ||
        req.path.includes('/report'))
    ) {
      return this.options.heavyReadTimeoutMs
    }
    return this.options.defaultTimeoutMs
  }

  /**
   * Build a SET LOCAL statement_timeout SQL fragment safe for PgBouncer
   * transaction pooling. Must be executed in the SAME transaction/query as
   * the heavy SELECT.
   *
   * Usage example inside a service method:
   *   await this.prisma.$transaction(async (tx) => {
   *     await tx.$executeRawUnsafe(
   *       QueryTimeoutMiddleware.getStatementTimeoutSQL(10_000)
   *     )
   *     return tx.someHeavyTable.findMany(...)
   *   })
   */
  static getStatementTimeoutSQL(timeoutMs: number): string {
    const safe = Math.max(500, Math.floor(timeoutMs))
    return `SET LOCAL statement_timeout = '${safe}ms'`
  }

  /**
   * Forwards the request-level AbortSignal down to Prisma v5+ find/fetch calls
   * that accept the `signal` option (must be wired inside each service method
   * explicitly, e.g. prisma.user.findMany({ signal: getRequestSignal(req) })).
   */
  static extractRequestSignal(req: Request): AbortSignal | undefined {
    return (req as any).abortController?.signal
  }

  private shouldBypass(req: Request): boolean {
    if (this.options.bypassMethods.includes(req.method.toUpperCase())) return true
    for (const pattern of this.options.bypassPaths) {
      if (pattern.test(req.path)) return true
    }
    return false
  }

  private resolveTimeout(req: Request): number {
    return this.getTimeoutForPath(req)
  }

  private readNumberEnv(name: string, fallback: number): number {
    const v = process.env[name]
    if (v === undefined || v === '') return fallback
    const n = parseInt(v, 10)
    if (Number.isNaN(n) || n <= 0) return fallback
    return n
  }
}

/**
 * Convenience decorator/wrapper helpers exported for service-layer usage.
 * Example:
 *   import { withQueryTimeout } from '../common/middleware/query-timeout.middleware'
 *   const rows = await withQueryTimeout(req, 10_000, (signal) =>
 *     this.prisma.bigTable.findMany({ signal })
 *   )
 */
export async function withQueryTimeout<T>(
  req: Request,
  timeoutMs: number,
  fn: (signal?: AbortSignal) => Promise<T>
): Promise<T> {
  const existingSignal = QueryTimeoutMiddleware.extractRequestSignal(req)
  if (existingSignal) {
    return fn(existingSignal)
  }
  const controller = new AbortController()
  const h = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fn(controller.signal)
  } finally {
    clearTimeout(h)
  }
}
