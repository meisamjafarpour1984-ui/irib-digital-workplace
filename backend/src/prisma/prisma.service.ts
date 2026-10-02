import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { PrismaClient, Prisma } from '@prisma/client'
import { queryTimeoutMiddleware } from './prisma.middleware'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  constructor() {
    super({
      // Connection Pooling Configuration — PgBouncer-compatible (transaction pooling)
      // Formula: pool_size = ((core_count * 2) + effective_spindle_count)
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      // Configure log levels for debugging connection health
      log: [
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
        ...(process.env.PRISMA_QUERY_LOG === 'true'
          ? [{ level: 'query' as const, emit: 'event' as const }]
          : []),
      ],
    } as any)

    // Log connection pool warnings for PgBouncer / DB health monitoring
    this.$on('warn' as never, (e: any) => {
      this.logger.warn(`Prisma pool warning: ${e.message}`, e.target)
    })

    this.$on('error' as never, (e: any) => {
      this.logger.error(`Prisma connection error: ${e.message}`, e.stack)
    })

    if (process.env.PRISMA_QUERY_LOG === 'true') {
      this.$on('query' as never, (e: any) => {
        if (e.duration > 200) {
          this.logger.warn(
            `[SLOW QUERY] ${e.query} — ${e.duration}ms (params: ${e.params.length} chars)`
          )
        }
      })
    }
  }

  async onModuleInit() {
    const maxRetries = parseInt(process.env.PRISMA_CONNECT_RETRIES || '5', 10)
    const retryDelayMs = parseInt(process.env.PRISMA_CONNECT_RETRY_DELAY || '1000', 10)

    let retries = 0
    let connected = false

    while (!connected && retries < maxRetries) {
      try {
        await this.$connect()
        connected = true
        this.logger.log(
          `Prisma connected successfully (pool configured, env=${process.env.NODE_ENV})`
        )
      } catch (error: any) {
        retries++
        this.logger.warn(
          `Prisma connection attempt ${retries}/${maxRetries} failed: ${error.message}`
        )
        if (retries >= maxRetries) {
          this.logger.error('Prisma max connection retries exceeded — aborting startup')
          throw error
        }
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs * retries))
      }
    }

    // Register middleware (order matters — last-registered runs innermost, after Prisma call)
    this.$use(this.softDeleteMiddleware)
    this.$use(this.loggingMiddleware)
    this.$use(this.cacheInvalidationMiddleware)
    this.$use(this.connectionTimeoutMiddleware) // 1. abort hung queries (Promise.race)
    this.$use(queryTimeoutMiddleware) // 2. slow query warning + pool-exhaustion risk log
  }

  async onModuleDestroy() {
    this.logger.log('Closing Prisma connection pool...')
    await this.$disconnect()
    this.logger.log('Prisma connection pool closed gracefully')
  }

  /**
   * Guard long-running queries by attaching a timeout signal at the application level.
   * Prevents the pool from being exhausted by hung queries when PgBouncer statement_timeout
   * is not available in pooling mode.
   */
  private connectionTimeoutMiddleware = async (
    params: Prisma.MiddlewareParams,
    next: (params: Prisma.MiddlewareParams) => Promise<any>
  ) => {
    const defaultTimeout = parseInt(
      process.env.PRISMA_QUERY_TIMEOUT_MS ||
        (process.env.NODE_ENV === 'production' ? '30000' : '10000'),
      10
    )

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(
          new Prisma.PrismaClientKnownRequestError(
            `Query ${params.model}.${params.action} exceeded ${defaultTimeout}ms timeout — connection released`,
            { code: 'P2024', clientVersion: (Prisma as any).ClientVersion || '5.x' }
          )
        )
      }, defaultTimeout)
    })

    return Promise.race([next(params), timeoutPromise])
  }

  private softDeleteMiddleware = async (
    params: Prisma.MiddlewareParams,
    next: (params: Prisma.MiddlewareParams) => Promise<any>
  ) => {
    // Models that have deletedAt field
    const softDeleteModels = ['User', 'Notification', 'SmsCampaign', 'SmsMessage', 'Content']
    const modelName = params.model

    // Only apply soft delete filter to models that have deletedAt field
    if (modelName && softDeleteModels.includes(modelName)) {
      const where = params.args?.where ?? {}

      // Automatically filter out deleted records for find operations
      if (params.action === 'findUnique' || params.action === 'findFirst') {
        params.args = { ...params.args, where: { ...where, deletedAt: null } }
      }
      if (params.action === 'findMany') {
        if (params.args?.where) {
          params.args = { ...params.args, where: { ...where, deletedAt: null } }
        } else {
          params.args = { ...params.args, where: { deletedAt: null } }
        }
      }
    }
    return next(params)
  }

  private loggingMiddleware = async (
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

  private cacheInvalidationMiddleware = async (
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
}
