/**
 * IRIB Digital Workplace Platform - Cache Module
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Module, Global } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { RedisCacheService } from './redis-cache.service'
import { MultiLevelCacheService } from './multi-level-cache.service'
import { CacheInterceptor } from './cache.interceptor'

@Global()
@Module({
  imports: [ConfigModule],
  providers: [RedisCacheService, MultiLevelCacheService, CacheInterceptor],
  exports: [RedisCacheService, MultiLevelCacheService, CacheInterceptor],
})
export class CacheModule {}
