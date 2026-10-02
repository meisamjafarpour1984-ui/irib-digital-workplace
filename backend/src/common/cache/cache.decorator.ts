/**
 * IRIB Digital Workplace Platform - Cache Decorators
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { SetMetadata } from '@nestjs/common'

export const CACHE_KEY_PREFIX = 'irib_dwp:'
export const CACHE_CONFIG = 'CACHE_CONFIG'
export const CACHE_INVALIDATE = 'CACHE_INVALIDATE'

export function Cacheable(keyPrefix: string, ttl?: number) {
  return SetMetadata(CACHE_CONFIG, { keyPrefix, ttl })
}

export function CacheInvalidate(keyPrefix: string) {
  return SetMetadata(CACHE_INVALIDATE, keyPrefix)
}
