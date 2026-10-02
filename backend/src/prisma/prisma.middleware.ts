import { Prisma } from '@prisma/client'

export const softDeleteMiddleware = async (
  params: Prisma.MiddlewareParams,
  next: (params: Prisma.MiddlewareParams) => Promise<any>
) => {
  // Automatically filter out deleted records for find operations
  if (params.action === 'findUnique' || params.action === 'findFirst') {
    params.args.where = { ...params.args.where, deletedAt: null }
  }
  if (params.action === 'findMany') {
    if (params.args.where) {
      params.args.where = { ...params.args.where, deletedAt: null }
    } else {
      params.args.where = { deletedAt: null }
    }
  }
  return next(params)
}

export const loggingMiddleware = async (
  params: Prisma.MiddlewareParams,
  next: (params: Prisma.MiddlewareParams) => Promise<any>
) => {
  const before = Date.now()
  const result = await next(params)
  const after = Date.now()
  const duration = after - before

  // Log slow queries (> 100ms)
  if (duration > 100) {
    console.warn(`[SLOW QUERY] ${params.model}.${params.action} took ${duration}ms`, params.args)
  }

  return result
}

export const cacheInvalidationMiddleware = async (
  params: Prisma.MiddlewareParams,
  next: (params: Prisma.MiddlewareParams) => Promise<any>
) => {
  const result = await next(params)

  // Invalidate cache on write operations
  if (params.action === 'create' || params.action === 'update' || params.action === 'delete') {
    // Cache invalidation logic would go here
    // This would typically emit events or call a cache service
    console.log(`[CACHE INVALIDATE] ${params.model}.${params.action}`)
  }

  return result
}

/**
 * Prisma-level Query Timeout Middleware (PoolExhaustion Shield:
 * Detects slow-running read-heavy operations that may exhaust the Prisma connection pool.
 * - For PgBouncer compatibility: relies on request-level abort signal + warning log
 * - Does NOT emit SET statement_timeout (breaks transaction pooling.
 */
export const queryTimeoutMiddleware = async (
  params: Prisma.MiddlewareParams,
  next: (params: Prisma.MiddlewareParams) => Promise<any>
) => {
  const before = Date.now()
  const result = await next(params)
  const after = Date.now()
  const duration = after - before

  const READ_ACTIONS = new Set([
    'findUnique',
    'findFirst',
    'findMany',
    'queryRaw',
    'aggregate',
    'count',
    'groupBy',
  ])
  const WRITE_ACTIONS = new Set([
    'create',
    'createMany',
    'update',
    'updateMany',
    'delete',
    'deleteMany',
    'executeRaw',
    'runCommandRaw',
  ])

  const POOL_DANGER_READ_THRESHOLD_MS = 8_000
  const POOL_WARNING_READ_THRESHOLD_MS = 2_000
  const POOL_WARNING_WRITE_THRESHOLD_MS = 5_000

  const signature = `${params.model || 'UnknownModel'}.${params.action}`
  const argsPreview = params.args ? JSON.stringify(params.args).substring(0, 500) : ''

  if (READ_ACTIONS.has(params.action) && duration > POOL_DANGER_READ_THRESHOLD_MS) {
    console.error(
      `[POOL EXHAUSTION RISK] ${signature} took ${duration}ms (threshold: 8000ms) — may starve Prisma connection pool. args=${argsPreview}`
    )
  } else if (READ_ACTIONS.has(params.action) && duration > POOL_WARNING_READ_THRESHOLD_MS) {
    console.warn(`[SLOW QUERY] ${signature} took ${duration}ms (threshold: 2000ms)`)
  } else if (WRITE_ACTIONS.has(params.action) && duration > POOL_WARNING_WRITE_THRESHOLD_MS) {
    console.warn(`[SLOW WRITE] ${signature} took ${duration}ms (threshold: 5000ms)`)
  }

  return result
}
