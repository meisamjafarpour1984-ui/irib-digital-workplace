/**
 * IRIB Digital Workplace Platform - Redis Cache Service
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name)
  private redis: Redis
  private readonly defaultTTL = 3600 // 1 hour
  private isConnected = false

  constructor(private configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL', 'redis://localhost:6379')

    this.redis = new Redis(redisUrl, {
      retryStrategy: (times) => {
        if (times > 10) {
          this.logger.error('Redis reconnection failed after 10 retries')
          return null
        }
        return Math.min(times * 100, 3000)
      },
    })

    this.redis.on('connect', () => {
      this.isConnected = true
      this.logger.log('Redis client connected')
    })

    this.redis.on('error', (err) => {
      this.isConnected = false
      this.logger.error('Redis client error:', err)
    })

    this.redis.on('close', () => {
      this.isConnected = false
      this.logger.warn('Redis client connection closed')
    })
  }

  async onModuleInit() {
    // Redis connection is established automatically
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit()
      this.logger.log('Redis client disconnected')
    }
  }

  getConnected(): boolean {
    return this.isConnected
  }

  async ping(): Promise<boolean> {
    try {
      return (await this.redis.ping()) === 'PONG'
    } catch (error) {
      this.logger.error('Redis health check failed:', error)
      return false
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) return null
    try {
      const value = await this.redis.get(key)
      if (!value) return null
      return JSON.parse(value) as T
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}:`, error)
      return null
    }
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    if (!this.isConnected) return
    try {
      const serialized = JSON.stringify(value)
      const expiry = ttl || this.defaultTTL
      await this.redis.setex(key, expiry, serialized)
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}:`, error)
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected) return
    try {
      await this.redis.del(key)
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}:`, error)
    }
  }

  async delPattern(pattern: string): Promise<void> {
    if (!this.isConnected) return
    try {
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        await this.redis.del(...keys)
        this.logger.log(`Invalidated ${keys.length} keys matching pattern: ${pattern}`)
      }
    } catch (error) {
      this.logger.error(`Error deleting cache pattern ${pattern}:`, error)
    }
  }

  async invalidateByPrefix(prefix: string): Promise<void> {
    await this.delPattern(`${prefix}:*`)
  }

  async clear(): Promise<void> {
    if (!this.isConnected) return
    try {
      await this.redis.flushdb()
      this.logger.log('Cache cleared')
    } catch (error) {
      this.logger.error('Error clearing cache:', error)
    }
  }

  // User-specific cache invalidation
  async invalidateUserCache(userId: string): Promise<void> {
    await this.invalidateByPrefix(`user:${userId}`)
    await this.invalidateByPrefix(`auth:${userId}`)
    await this.invalidateByPrefix(`permissions:${userId}`)
  }

  // Content-specific cache invalidation
  async invalidateContentCache(contentId: string): Promise<void> {
    await this.invalidateByPrefix(`content:${contentId}`)
    await this.invalidateByPrefix(`content:feed`)
    await this.invalidateByPrefix(`content:public`)
  }

  // Cache tagging support
  async setWithTags(key: string, value: unknown, tags: string[], ttl?: number): Promise<void> {
    await this.set(key, value, ttl)
    if (!this.isConnected) return
    for (const tag of tags) {
      await this.redis.sadd(`tag:${tag}`, key)
    }
  }

  async invalidateByTag(tag: string): Promise<void> {
    if (!this.isConnected) return
    const keys = await this.redis.smembers(`tag:${tag}`)
    if (keys.length > 0) {
      await this.redis.del(...keys)
      await this.redis.del(`tag:${tag}`)
    }
  }

  // Cache statistics
  async getStats(): Promise<{ totalKeys: number; memoryUsage: string }> {
    if (!this.isConnected) return { totalKeys: 0, memoryUsage: '0' }
    try {
      const info = await this.redis.info('memory')
      const dbsize = await this.redis.dbsize()
      const memoryMatch = info.match(/used_memory_human:([^\s]+)/)
      const usedMemory = memoryMatch ? memoryMatch[1] : '0'

      return {
        totalKeys: dbsize,
        memoryUsage: usedMemory,
      }
    } catch (error) {
      this.logger.error('Error getting cache stats:', error)
      return { totalKeys: 0, memoryUsage: '0' }
    }
  }
}
