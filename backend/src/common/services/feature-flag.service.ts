import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { Prisma, SettingCategory } from '@prisma/client'
import * as crypto from 'crypto'

/**
 * Feature Flag Configuration
 */
interface FeatureFlagConfig {
  enabled: boolean
  rolloutPercentage?: number // 0-100 for gradual rollout
  abTest?: {
    enabled: boolean
    variants: Array<{
      name: string
      percentage: number // 0-100
      config: unknown // variant-specific configuration
    }>
  }
  targetUsers?: string[] // Specific user IDs
  targetRoles?: string[] // Specific roles
  targetDepartments?: string[] // Specific departments
  startDate?: Date
  endDate?: Date
}

/**
 * Feature Flag Evaluation Result
 */
interface FeatureFlagResult {
  enabled: boolean
  variant?: string
  config?: unknown
  reason: string
}

@Injectable()
export class FeatureFlagService {
  private readonly logger = new Logger(FeatureFlagService.name)
  private cache = new Map<string, { data: FeatureFlagResult; expiry: number }>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check if a feature flag is enabled for a given context
   */
  async isFeatureEnabled(
    flagKey: string,
    context: {
      userId?: string
      userRole?: string
      userDepartment?: string
    } = {}
  ): Promise<FeatureFlagResult> {
    // Check cache first
    const cacheKey = this.getCacheKey(flagKey, context)
    const cached = this.cache.get(cacheKey)
    if (cached && cached.expiry > Date.now()) {
      return cached.data
    }

    // Get feature flag configuration
    const config = await this.getFeatureFlagConfig(flagKey)
    if (!config) {
      const result: FeatureFlagResult = {
        enabled: false,
        reason: 'Feature flag not found',
      }
      this.setCache(cacheKey, result)
      return result
    }

    // Check if feature is globally disabled
    if (!config.enabled) {
      const result: FeatureFlagResult = {
        enabled: false,
        reason: 'Feature flag disabled',
      }
      this.setCache(cacheKey, result)
      return result
    }

    // Check date range
    if (config.startDate && new Date() < config.startDate) {
      const result: FeatureFlagResult = {
        enabled: false,
        reason: 'Feature not yet started',
      }
      this.setCache(cacheKey, result)
      return result
    }

    if (config.endDate && new Date() > config.endDate) {
      const result: FeatureFlagResult = {
        enabled: false,
        reason: 'Feature expired',
      }
      this.setCache(cacheKey, result)
      return result
    }

    // Check target users
    if (config.targetUsers && config.targetUsers.length > 0) {
      if (context.userId && config.targetUsers.includes(context.userId)) {
        const result: FeatureFlagResult = {
          enabled: true,
          reason: 'User in target list',
        }
        this.setCache(cacheKey, result)
        return result
      }
    }

    // Check target roles
    if (config.targetRoles && config.targetRoles.length > 0) {
      if (context.userRole && config.targetRoles.includes(context.userRole)) {
        const result: FeatureFlagResult = {
          enabled: true,
          reason: 'Role in target list',
        }
        this.setCache(cacheKey, result)
        return result
      }
    }

    // Check target departments
    if (config.targetDepartments && config.targetDepartments.length > 0) {
      if (context.userDepartment && config.targetDepartments.includes(context.userDepartment)) {
        const result: FeatureFlagResult = {
          enabled: true,
          reason: 'Department in target list',
        }
        this.setCache(cacheKey, result)
        return result
      }
    }

    // Check gradual rollout
    if (config.rolloutPercentage !== undefined && config.rolloutPercentage < 100) {
      const userHash = this.hashUser(flagKey, context.userId || 'anonymous')
      const rolloutEnabled = userHash % 100 < config.rolloutPercentage

      if (rolloutEnabled) {
        const result: FeatureFlagResult = {
          enabled: true,
          reason: 'Gradual rollout',
        }
        this.setCache(cacheKey, result)
        return result
      } else {
        const result: FeatureFlagResult = {
          enabled: false,
          reason: 'Not in gradual rollout',
        }
        this.setCache(cacheKey, result)
        return result
      }
    }

    // Check A/B testing
    if (config.abTest && config.abTest.enabled) {
      const abResult = this.evaluateABTest(config.abTest, context.userId)
      const result: FeatureFlagResult = {
        enabled: true,
        variant: abResult.variant,
        config: abResult.config,
        reason: 'A/B test',
      }
      this.setCache(cacheKey, result)
      return result
    }

    // Default: enabled
    const result: FeatureFlagResult = {
      enabled: true,
      reason: 'Globally enabled',
    }
    this.setCache(cacheKey, result)
    return result
  }

  /**
   * Get feature flag configuration
   */
  async getFeatureFlagConfig(flagKey: string): Promise<FeatureFlagConfig | null> {
    try {
      const setting = await this.prisma.systemSetting.findUnique({
        where: { key: `feature.${flagKey}` },
      })

      if (!setting) {
        return null
      }

      // Decrypt and parse the configuration
      const value = this.decryptValue(setting.value, setting.type)
      return value as FeatureFlagConfig
    } catch (error) {
      this.logger.error(`Failed to get feature flag config for ${flagKey}:`, error)
      return null
    }
  }

  /**
   * Set feature flag configuration
   */
  async setFeatureFlagConfig(
    flagKey: string,
    config: FeatureFlagConfig,
    updatedBy?: string
  ): Promise<void> {
    try {
      const encryptedValue = this.encryptValue(config, 'json')

      await this.prisma.systemSetting.upsert({
        where: { key: `feature.${flagKey}` },
        create: {
          key: `feature.${flagKey}`,
          category: SettingCategory.GENERAL,
          value: encryptedValue,
          type: 'json',
          description: { fa: `ویژگی ${flagKey}`, en: `Feature ${flagKey}` },
          isPublic: false,
          isEditable: true,
          updatedBy,
        },
        update: {
          value: encryptedValue,
          type: 'json',
          updatedAt: new Date(),
          updatedBy,
        },
      })

      // Clear cache for this flag
      this.clearCacheForFlag(flagKey)
    } catch (error) {
      this.logger.error(`Failed to set feature flag config for ${flagKey}:`, error)
      throw error
    }
  }

  /**
   * Delete feature flag
   */
  async deleteFeatureFlag(flagKey: string): Promise<void> {
    try {
      await this.prisma.systemSetting.delete({
        where: { key: `feature.${flagKey}` },
      })

      // Clear cache for this flag
      this.clearCacheForFlag(flagKey)
    } catch (error) {
      this.logger.error(`Failed to delete feature flag ${flagKey}:`, error)
      throw error
    }
  }

  /**
   * Get all feature flags
   */
  async getAllFeatureFlags(): Promise<Array<{ key: string; config: FeatureFlagConfig }>> {
    try {
      const settings = await this.prisma.systemSetting.findMany({
        where: {
          key: { startsWith: 'feature.' },
        },
      })

      return settings.map((setting) => ({
        key: setting.key.replace('feature.', ''),
        config: this.decryptValue(setting.value, setting.type) as FeatureFlagConfig,
      }))
    } catch (error) {
      this.logger.error('Failed to get all feature flags:', error)
      return []
    }
  }

  /**
   * Evaluate A/B test variant
   */
  private evaluateABTest(
    abTest: FeatureFlagConfig['abTest'],
    userId?: string
  ): { variant: string; config: unknown } {
    if (!abTest || !abTest.variants || abTest.variants.length === 0) {
      return { variant: 'default', config: null }
    }

    // Hash user ID to determine variant
    const userHash = this.hashUser('abtest', userId || 'anonymous')
    let cumulativePercentage = 0

    for (const variant of abTest.variants) {
      cumulativePercentage += variant.percentage
      if (userHash % 100 < cumulativePercentage) {
        return { variant: variant.name, config: variant.config }
      }
    }

    // Fallback to first variant
    return {
      variant: abTest.variants[0].name,
      config: abTest.variants[0].config,
    }
  }

  /**
   * Hash user ID for consistent assignment
   */
  private hashUser(flagKey: string, userId: string): number {
    const hash = crypto.createHash('md5').update(`${flagKey}:${userId}`).digest('hex')
    return parseInt(hash.substring(0, 8), 16) % 100
  }

  /**
   * Get cache key
   */
  private getCacheKey(
    flagKey: string,
    context: { userId?: string; userRole?: string; userDepartment?: string }
  ): string {
    return `${flagKey}:${context.userId || 'anonymous'}:${context.userRole || 'none'}:${context.userDepartment || 'none'}`
  }

  /**
   * Set cache
   */
  private setCache(key: string, data: FeatureFlagResult): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.CACHE_TTL,
    })
  }

  /**
   * Clear cache for a specific flag
   */
  private clearCacheForFlag(flagKey: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(flagKey)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Encrypt value (simplified - in production use the same encryption as SystemSettingsService)
   */
  private encryptValue(value: unknown, _type: string): Prisma.InputJsonValue {
    // For now, just return the value as-is
    // In production, integrate with SystemSettingsService encryption
    return value as Prisma.InputJsonValue
  }

  /**
   * Decrypt value (simplified - in production use the same decryption as SystemSettingsService)
   */
  private decryptValue(value: Prisma.JsonValue, _type: string): unknown {
    // For now, just return the value as-is
    // In production, integrate with SystemSettingsService decryption
    return value
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear()
  }
}
