import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { SettingCategory } from '@prisma/client'
import * as crypto from 'crypto'

@Injectable()
export class SystemSettingsService {
  private readonly logger = new Logger(SystemSettingsService.name)
  private readonly encryptionAlgorithm = 'aes-256-gcm'
  private readonly encryptionKey: Buffer

  constructor(private readonly prisma: PrismaService) {
    // Generate or load encryption key from environment
    const keyEnv = process.env.SETTINGS_ENCRYPTION_KEY
    if (keyEnv) {
      this.encryptionKey = Buffer.from(keyEnv, 'hex').slice(0, 32)
    } else {
      // Generate a random key for development (not for production!)
      this.logger.warn(
        'No SETTINGS_ENCRYPTION_KEY provided, using random key (not secure for production)'
      )
      this.encryptionKey = crypto.randomBytes(32)
    }
  }

  async getAll() {
    return this.getSettings()
  }

  async get(key: string) {
    return this.getSetting(key)
  }

  async set(key: string, value: unknown, type = 'json', description?: string) {
    return this.upsertSetting(key, SettingCategory.GENERAL, value, type, description)
  }

  async isFeatureEnabled(key: string) {
    const setting = await this.getSetting(key)
    return setting?.value === true || setting?.value === 'true'
  }

  /**
   * Get a setting by key (with environment override check)
   */
  async getSetting(key: string) {
    // Check environment override first
    const envOverride = this.getEnvironmentOverride(key)
    if (envOverride) {
      return { key, value: envOverride.value, source: 'environment' }
    }

    const setting = await this.prisma.systemSetting.findUnique({
      where: { key },
    })

    if (!setting) {
      return null
    }

    return {
      ...setting,
      value: this.decryptValue(setting.value, setting.type),
      source: 'database',
    }
  }

  /**
   * Get all settings (optionally filtered by category)
   */
  async getSettings(category?: SettingCategory, isPublic?: boolean) {
    const where: any = {}
    if (category) where.category = category
    if (isPublic !== undefined) where.isPublic = isPublic

    const settings = await this.prisma.systemSetting.findMany({
      where,
      orderBy: { category: 'asc' },
    })

    return settings.map((setting) => ({
      ...setting,
      value: this.decryptValue(setting.value, setting.type),
    }))
  }

  /**
   * Get settings by category
   */
  async getSettingsByCategory(category: SettingCategory) {
    return this.getSettings(category)
  }

  /**
   * Create or update a setting
   */
  async upsertSetting(
    key: string,
    category: SettingCategory,
    value: any,
    type: string = 'json',
    description?: any,
    isPublic: boolean = false,
    isEditable: boolean = true,
    updatedBy?: string
  ) {
    // Validate value
    this.validateValue(key, value, type)

    // Get old value for audit log
    const oldSetting = await this.prisma.systemSetting.findUnique({
      where: { key },
    })

    const encryptedValue = this.encryptValue(value, type)

    const setting = await this.prisma.systemSetting.upsert({
      where: { key },
      create: {
        key,
        category,
        value: encryptedValue,
        type,
        description,
        isPublic,
        isEditable,
        updatedBy,
      },
      update: {
        category,
        value: encryptedValue,
        type,
        description,
        isPublic,
        isEditable,
        updatedBy,
        updatedAt: new Date(),
      },
    })

    // Create audit log entry
    if (updatedBy) {
      try {
        await this.prisma.auditLogEntry.create({
          data: {
            actorId: updatedBy,
            actorName: 'System Admin',
            action: oldSetting ? 'UPDATE' : 'CREATE',
            entityType: 'SystemSetting',
            entityId: setting.id,
            entityTitle: key,
            oldData: oldSetting ? { value: oldSetting.value } : undefined,
            newData: { value: encryptedValue },
          },
        })
      } catch (error) {
        this.logger.error('Failed to create audit log:', error)
        // Don't fail the upsert if audit log fails
      }
    }

    return {
      ...setting,
      value: this.decryptValue(setting.value, setting.type),
      source: 'database',
    }
  }

  /**
   * Delete a setting
   */
  async deleteSetting(key: string) {
    return this.prisma.systemSetting.delete({
      where: { key },
    })
  }

  /**
   * Export all settings (for backup)
   */
  async exportSettings() {
    const settings = await this.prisma.systemSetting.findMany({
      orderBy: { category: 'asc' },
    })

    return {
      exportedAt: new Date(),
      version: '1.0',
      settings: settings.map((s) => ({
        key: s.key,
        category: s.category,
        value: this.decryptValue(s.value, s.type),
        type: s.type,
        description: s.description,
        isPublic: s.isPublic,
        isEditable: s.isEditable,
      })),
    }
  }

  /**
   * Import settings (from backup)
   */
  async importSettings(data: { settings: any[] }, updatedBy?: string) {
    const results = []

    for (const setting of data.settings) {
      try {
        const result = await this.upsertSetting(
          setting.key,
          setting.category,
          setting.value,
          setting.type,
          setting.description,
          setting.isPublic,
          setting.isEditable,
          updatedBy
        )
        results.push({ key: setting.key, status: 'success', data: result })
      } catch (error) {
        results.push({
          key: setting.key,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    return {
      importedAt: new Date(),
      total: data.settings.length,
      success: results.filter((r) => r.status === 'success').length,
      failed: results.filter((r) => r.status === 'error').length,
      results,
    }
  }

  /**
   * Get change history for a setting
   */
  async getSettingHistory(key: string) {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key },
    })

    if (!setting) {
      return []
    }

    const auditLogs = await this.prisma.auditLogEntry.findMany({
      where: {
        entityType: 'SystemSetting',
        entityId: setting.id,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return auditLogs.map((log) => ({
      action: log.action,
      actorId: log.actorId,
      actorName: log.actorName,
      createdAt: log.createdAt,
      oldData: log.oldData,
      newData: log.newData,
    }))
  }

  /**
   * Initialize default settings
   */
  async initializeDefaults() {
    const defaults = [
      // Authentication settings
      {
        key: 'auth.type',
        category: SettingCategory.AUTHENTICATION,
        value: { value: 'local', options: ['local', 'keycloak'] },
        type: 'json',
        description: { fa: 'نوع احراز هویت', en: 'Authentication Type' },
        isPublic: false,
        isEditable: true,
      },
      {
        key: 'auth.keycloak.enabled',
        category: SettingCategory.AUTHENTICATION,
        value: false,
        type: 'boolean',
        description: { fa: 'فعال‌سازی Keycloak', en: 'Enable Keycloak' },
        isPublic: false,
        isEditable: true,
      },
      {
        key: 'auth.keycloak.url',
        category: SettingCategory.AUTHENTICATION,
        value: 'http://localhost:8080',
        type: 'string',
        description: { fa: 'آدرس Keycloak', en: 'Keycloak URL' },
        isPublic: false,
        isEditable: true,
      },
      {
        key: 'auth.keycloak.realm',
        category: SettingCategory.AUTHENTICATION,
        value: 'irib-dwp',
        type: 'string',
        description: { fa: 'نام Realm', en: 'Realm Name' },
        isPublic: false,
        isEditable: true,
      },
      {
        key: 'auth.keycloak.clientId',
        category: SettingCategory.AUTHENTICATION,
        value: 'irib-dwp-web',
        type: 'string',
        description: { fa: 'شناسه کلاینت', en: 'Client ID' },
        isPublic: false,
        isEditable: true,
      },
      {
        key: 'auth.keycloak.clientSecret',
        category: SettingCategory.AUTHENTICATION,
        value: '',
        type: 'encrypted',
        description: { fa: 'رمز کلاینت', en: 'Client Secret' },
        isPublic: false,
        isEditable: true,
      },
      {
        key: 'auth.keycloak.adminUsername',
        category: SettingCategory.AUTHENTICATION,
        value: 'admin',
        type: 'string',
        description: { fa: 'نام کاربری ادمین', en: 'Admin Username' },
        isPublic: false,
        isEditable: true,
      },
      {
        key: 'auth.keycloak.adminPassword',
        category: SettingCategory.AUTHENTICATION,
        value: '',
        type: 'encrypted',
        description: { fa: 'رمز عبور ادمین', en: 'Admin Password' },
        isPublic: false,
        isEditable: true,
      },

      // SMS settings
      {
        key: 'sms.enabled',
        category: SettingCategory.SMS,
        value: false,
        type: 'boolean',
        description: { fa: 'فعال‌سازی سرویس SMS', en: 'Enable SMS Service' },
        isPublic: false,
        isEditable: true,
      },
      {
        key: 'sms.adapter',
        category: SettingCategory.SMS,
        value: { value: 'mock', options: ['mock', 'idehpayam', 'kavenegar', 'mellipayamak'] },
        type: 'json',
        description: { fa: 'نوع سرویس‌دهنده SMS', en: 'SMS Provider' },
        isPublic: false,
        isEditable: true,
      },
      {
        key: 'sms.idehpayam.apiUrl',
        category: SettingCategory.SMS,
        value: '',
        type: 'string',
        description: { fa: 'آدرس API', en: 'API URL' },
        isPublic: false,
        isEditable: true,
      },
      {
        key: 'sms.idehpayam.apiToken',
        category: SettingCategory.SMS,
        value: '',
        type: 'encrypted',
        description: { fa: 'توکن API', en: 'API Token' },
        isPublic: false,
        isEditable: true,
      },
      {
        key: 'sms.idehpayam.senderNumber',
        category: SettingCategory.SMS,
        value: '',
        type: 'string',
        description: { fa: 'شماره فرستنده', en: 'Sender Number' },
        isPublic: false,
        isEditable: true,
      },

      // Email settings
      {
        key: 'email.enabled',
        category: SettingCategory.EMAIL,
        value: false,
        type: 'boolean',
        description: { fa: 'فعال‌سازی سرویس Email', en: 'Enable Email Service' },
        isPublic: false,
        isEditable: true,
      },
      {
        key: 'email.smtp.host',
        category: SettingCategory.EMAIL,
        value: '',
        type: 'string',
        description: { fa: 'سرور SMTP', en: 'SMTP Host' },
        isPublic: false,
        isEditable: true,
      },
      {
        key: 'email.smtp.port',
        category: SettingCategory.EMAIL,
        value: 587,
        type: 'number',
        description: { fa: 'پورت SMTP', en: 'SMTP Port' },
        isPublic: false,
        isEditable: true,
      },
      {
        key: 'email.smtp.username',
        category: SettingCategory.EMAIL,
        value: '',
        type: 'string',
        description: { fa: 'نام کاربری', en: 'Username' },
        isPublic: false,
        isEditable: true,
      },
      {
        key: 'email.smtp.password',
        category: SettingCategory.EMAIL,
        value: '',
        type: 'encrypted',
        description: { fa: 'رمز عبور', en: 'Password' },
        isPublic: false,
        isEditable: true,
      },

      // Notification settings
      {
        key: 'notification.push.enabled',
        category: SettingCategory.NOTIFICATION,
        value: false,
        type: 'boolean',
        description: { fa: 'فعال‌سازی Push Notification', en: 'Enable Push Notifications' },
        isPublic: false,
        isEditable: true,
      },
      {
        key: 'notification.push.vapidPublicKey',
        category: SettingCategory.NOTIFICATION,
        value: '',
        type: 'string',
        description: { fa: 'کلید عمومی VAPID', en: 'VAPID Public Key' },
        isPublic: false,
        isEditable: true,
      },
      {
        key: 'notification.push.vapidPrivateKey',
        category: SettingCategory.NOTIFICATION,
        value: '',
        type: 'encrypted',
        description: { fa: 'کلید خصوصی VAPID', en: 'VAPID Private Key' },
        isPublic: false,
        isEditable: true,
      },

      // Storage settings
      {
        key: 'storage.provider',
        category: SettingCategory.STORAGE,
        value: { value: 'local', options: ['local', 's3', 'minio'] },
        type: 'json',
        description: { fa: 'نوع ذخیره‌سازی', en: 'Storage Provider' },
        isPublic: false,
        isEditable: true,
      },
      {
        key: 'storage.s3.endpoint',
        category: SettingCategory.STORAGE,
        value: '',
        type: 'string',
        description: { fa: 'آدرس S3', en: 'S3 Endpoint' },
        isPublic: false,
        isEditable: true,
      },
      {
        key: 'storage.s3.accessKey',
        category: SettingCategory.STORAGE,
        value: '',
        type: 'string',
        description: { fa: 'کلید دسترسی', en: 'Access Key' },
        isPublic: false,
        isEditable: true,
      },
      {
        key: 'storage.s3.secretKey',
        category: SettingCategory.STORAGE,
        value: '',
        type: 'encrypted',
        description: { fa: 'کلید مخفی', en: 'Secret Key' },
        isPublic: false,
        isEditable: true,
      },
      {
        key: 'storage.s3.bucket',
        category: SettingCategory.STORAGE,
        value: '',
        type: 'string',
        description: { fa: 'نام Bucket', en: 'Bucket Name' },
        isPublic: false,
        isEditable: true,
      },

      // Integration settings
      {
        key: 'integration.keycloak.migration.enabled',
        category: SettingCategory.INTEGRATION,
        value: false,
        type: 'boolean',
        description: { fa: 'فعال‌سازی مهاجرت به Keycloak', en: 'Enable Keycloak Migration' },
        isPublic: false,
        isEditable: true,
      },

      // General settings
      {
        key: 'general.siteName',
        category: SettingCategory.GENERAL,
        value: {
          fa: 'محیط کاربری دیجیتال صدا و سیمای آذربایجان شرقی',
          en: 'IRIB East Azerbaijan Digital Workplace',
        },
        type: 'json',
        description: { fa: 'نام سایت', en: 'Site Name' },
        isPublic: true,
        isEditable: true,
      },
      {
        key: 'general.supportEmail',
        category: SettingCategory.GENERAL,
        value: 'support@irib-tabriz.ir',
        type: 'string',
        description: { fa: 'ایمیل پشتیبانی', en: 'Support Email' },
        isPublic: true,
        isEditable: true,
      },
    ]

    const results = []
    for (const def of defaults) {
      try {
        const setting = await this.upsertSetting(
          def.key,
          def.category,
          def.value,
          def.type,
          def.description,
          def.isPublic,
          def.isEditable
        )
        results.push(setting)
      } catch (error) {
        this.logger.error(`Failed to initialize setting ${def.key}:`, error)
      }
    }

    return results
  }

  /**
   * Validate setting value based on type
   */
  private validateValue(key: string, value: any, type: string): void {
    if (type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        throw new Error(`Invalid email format for setting ${key}`)
      }
    }

    if (type === 'url' && value) {
      try {
        new URL(value)
      } catch {
        throw new Error(`Invalid URL format for setting ${key}`)
      }
    }

    if (type === 'number' && value !== undefined && value !== null) {
      if (isNaN(Number(value))) {
        throw new Error(`Invalid number format for setting ${key}`)
      }
    }

    if (type === 'port' && value !== undefined && value !== null) {
      const port = Number(value)
      if (isNaN(port) || port < 1 || port > 65535) {
        throw new Error(`Invalid port number for setting ${key}`)
      }
    }

    if (type === 'json' && value) {
      if (typeof value !== 'object') {
        throw new Error(`Invalid JSON format for setting ${key}`)
      }
    }
  }

  /**
   * Check environment variable override
   */
  private getEnvironmentOverride(key: string): any {
    const envKey = key.toUpperCase().replace(/\./g, '_')
    const envValue = process.env[envKey]

    if (envValue !== undefined) {
      this.logger.log(`Setting ${key} overridden by environment variable ${envKey}`)
      return { value: envValue, source: 'environment' }
    }

    return null
  }
  private encryptValue(value: any, type: string): any {
    if (type === 'encrypted') {
      try {
        const iv = crypto.randomBytes(16)
        const cipher = crypto.createCipheriv(this.encryptionAlgorithm, this.encryptionKey, iv)

        const stringValue = JSON.stringify(value)
        let encrypted = cipher.update(stringValue, 'utf8', 'hex')
        encrypted += cipher.final('hex')

        const authTag = cipher.getAuthTag()

        return {
          iv: iv.toString('hex'),
          encrypted,
          authTag: authTag.toString('hex'),
          algorithm: this.encryptionAlgorithm,
        }
      } catch (error) {
        this.logger.error('Encryption failed:', error)
        throw new Error('Failed to encrypt value')
      }
    }
    return value
  }

  /**
   * Decrypt sensitive values using AES-256-GCM
   */
  private decryptValue(value: any, type: string): any {
    if (type === 'encrypted') {
      try {
        // Handle both old base64 format and new encrypted format
        if (typeof value === 'string') {
          // Old format - base64
          try {
            return JSON.parse(Buffer.from(value, 'base64').toString())
          } catch {
            return value
          }
        }

        // New format - encrypted object
        if (value && value.encrypted && value.iv && value.authTag) {
          const decipher = crypto.createDecipheriv(
            this.encryptionAlgorithm,
            this.encryptionKey,
            Buffer.from(value.iv, 'hex')
          )
          decipher.setAuthTag(Buffer.from(value.authTag, 'hex'))

          let decrypted = decipher.update(value.encrypted, 'hex', 'utf8')
          decrypted += decipher.final('utf8')

          return JSON.parse(decrypted)
        }

        return value
      } catch (error) {
        this.logger.error('Decryption failed:', error)
        return value // Return as-is if decryption fails
      }
    }
    return value
  }
}
