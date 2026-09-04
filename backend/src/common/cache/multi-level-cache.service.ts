import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from '../../modules/cache/cache.service';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

@Injectable()
export class MultiLevelCacheService {
  private readonly logger = new Logger(MultiLevelCacheService.name);
  private readonly memoryCache = new Map<string, CacheEntry<unknown>>();
  private readonly memoryTTL = 60 * 1000; // 1 minute default for L1
  private readonly maxMemorySize = 1000;

  constructor(private readonly redisCache: CacheService) {}

  async get<T>(key: string): Promise<T | null> {
    // L1: Memory Cache
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && Date.now() < memoryEntry.timestamp + memoryEntry.ttl) {
      this.logger.debug(`Cache hit (L1): ${key}`);
      return memoryEntry.data as T;
    }

    // L2: Redis Cache
    try {
      const redisData = await this.redisCache.get(key);
      if (redisData) {
        this.logger.debug(`Cache hit (L2): ${key}`);
        // Promote to L1
        this.setMemory(key, redisData, this.memoryTTL);
        return redisData as T;
      }
    } catch (error) {
      this.logger.warn(`Redis cache error for key ${key}:`, error);
    }

    this.logger.debug(`Cache miss: ${key}`);
    return null;
  }

  async set<T>(
    key: string,
    value: T,
    ttl?: number,
    options?: { skipMemory?: boolean; skipRedis?: boolean }
  ): Promise<void> {
    const effectiveTTL = ttl || 3600; // Default 1 hour

    // L1: Memory Cache
    if (!options?.skipMemory) {
      this.setMemory(key, value, Math.min(effectiveTTL * 1000, this.memoryTTL));
    }

    // L2: Redis Cache
    if (!options?.skipRedis) {
      try {
        await this.redisCache.set(key, value, effectiveTTL);
        this.logger.debug(`Cache set (L2): ${key}`);
      } catch (error) {
        this.logger.warn(`Failed to set Redis cache for key ${key}:`, error);
      }
    }
  }

  async invalidate(key: string): Promise<void> {
    // Invalidate L1
    this.memoryCache.delete(key);

    // Invalidate L2
    try {
      await this.redisCache.del(key);
      this.logger.debug(`Cache invalidated: ${key}`);
    } catch (error) {
      this.logger.warn(`Failed to invalidate Redis cache for key ${key}:`, error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    // Invalidate L1
    const regex = new RegExp(pattern.replace('*', '.*'));
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }

    // Invalidate L2
    try {
      await this.redisCache.delPattern(pattern);
      this.logger.debug(`Cache invalidated by pattern: ${pattern}`);
    } catch (error) {
      this.logger.warn(`Failed to invalidate Redis cache by pattern ${pattern}:`, error);
    }
  }

  async invalidateTags(tags: string[]): Promise<void> {
    try {
      for (const tag of tags) {
        await this.redisCache.invalidateByTag(tag);
      }
      // Also invalidate L1 entries with these tags
      this.logger.debug(`Cache invalidated by tags: ${tags.join(', ')}`);
    } catch (error) {
      this.logger.warn(`Failed to invalidate Redis cache by tags:`, error);
    }
  }

  async warmUp<T>(entries: Array<{ key: string; value: T; ttl?: number }>): Promise<void> {
    await Promise.all(
      entries.map(({ key, value, ttl }) => this.set(key, value, ttl))
    );
    this.logger.log(`Warmed up ${entries.length} cache entries`);
  }

  private setMemory<T>(key: string, value: T, ttl: number): void {
    // Evict if size limit reached
    if (this.memoryCache.size >= this.maxMemorySize) {
      this.evictOldest();
    }

    this.memoryCache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl,
    });
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
      this.logger.debug(`Evicted from L1 cache: ${oldestKey}`);
    }
  }

  clearMemory(): void {
    this.memoryCache.clear();
    this.logger.debug('L1 cache cleared');
  }

  getStats() {
    return {
      memoryCache: {
        size: this.memoryCache.size,
        maxSize: this.maxMemorySize,
      },
    };
  }
}
