/**
 * IRIB Digital Workplace Platform - Cache Interceptor
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common'
import { Observable, from, of } from 'rxjs'
import { tap, switchMap } from 'rxjs/operators'
import { RedisCacheService } from './redis-cache.service'
import { CACHE_KEY_PREFIX, CACHE_CONFIG, CACHE_INVALIDATE } from './cache.decorator'

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name)

  constructor(private readonly cacheService: RedisCacheService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const handler = context.getHandler()
    const cacheConfig = Reflect.getMetadata(CACHE_CONFIG, handler)
    const invalidateKey = Reflect.getMetadata(CACHE_INVALIDATE, handler)

    if (invalidateKey) {
      return next.handle().pipe(
        tap(async () => {
          await this.cacheService.invalidateByPrefix(invalidateKey)
          this.logger.debug(`Invalidated cache for prefix: ${invalidateKey}`)
        })
      )
    }

    if (cacheConfig) {
      const { keyPrefix, ttl } = cacheConfig
      const request = context.switchToHttp().getRequest()
      const query = JSON.stringify(request.query)
      const params = JSON.stringify(request.params)
      const cacheKey = `${CACHE_KEY_PREFIX}${keyPrefix}:${params}:${query}`

      return from(this.cacheService.get(cacheKey)).pipe(
        switchMap((cached) => {
          if (cached !== null) {
            this.logger.debug(`Cache hit: ${cacheKey}`)
            return of(cached)
          }
          return next.handle().pipe(
            tap(async (result) => {
              await this.cacheService.set(cacheKey, result, ttl)
              this.logger.debug(`Cache set: ${cacheKey}`)
            })
          )
        })
      )
    }

    return next.handle()
  }
}
