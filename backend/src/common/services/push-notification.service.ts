/**
 * IRIB Digital Workplace Platform - Push Notification Service
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import webpush from 'web-push'
import { PrismaService } from '../../prisma/prisma.service'

export interface PushNotificationOptions {
  userId: string
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  data?: Record<string, any>
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
  url?: string
  ttl?: number
}

export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name)
  private vapidPublicKey = ''
  private vapidPrivateKey = ''
  private vapidSubject = ''

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService
  ) {
    this.initializeVapid()
  }

  /**
   * Initialize VAPID keys for Web Push
   */
  private initializeVapid(): void {
    this.vapidPublicKey = this.config.get('VAPID_PUBLIC_KEY') || ''
    this.vapidPrivateKey = this.config.get('VAPID_PRIVATE_KEY') || ''
    this.vapidSubject = this.config.get('VAPID_SUBJECT') || 'mailto:admin@iribtabriz.ir'

    if (!this.vapidPublicKey || !this.vapidPrivateKey) {
      this.logger.warn('VAPID keys not provided. Push notifications will not work.')
      this.logger.warn('Generate VAPID keys using: npx web-push generate-vapid-keys')
      return
    }

    try {
      webpush.setVapidDetails(this.vapidSubject, this.vapidPublicKey, this.vapidPrivateKey)
      this.logger.log('VAPID initialized successfully')
    } catch (error) {
      this.logger.error('Failed to initialize VAPID:', error)
      this.logger.warn('Push notifications will not work without valid VAPID keys')
    }
  }

  /**
   * Send push notification to a user
   */
  async sendPushNotification(
    options: PushNotificationOptions
  ): Promise<{ success: number; failed: number }> {
    if (!this.vapidPublicKey || !this.vapidPrivateKey) {
      this.logger.warn('Cannot send push notification: VAPID keys not configured')
      return { success: 0, failed: 0 }
    }

    try {
      // Get all push subscriptions for the user
      const subscriptions = await this.prisma.pushSubscription.findMany({
        where: { userId: options.userId },
      })

      if (subscriptions.length === 0) {
        this.logger.warn(`No push subscriptions found for user ${options.userId}`)
        return { success: 0, failed: 0 }
      }

      const payload = JSON.stringify({
        notification: {
          title: options.title,
          body: options.body,
          icon: options.icon || '/icon-192x192.png',
          badge: options.badge || '/badge-72x72.png',
          image: options.image,
          data: options.data,
          actions: options.actions,
        },
        data: {
          url: options.url,
          timestamp: new Date().toISOString(),
        },
      })

      const results = { success: 0, failed: 0 }

      for (const subscription of subscriptions) {
        try {
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          }

          await webpush.sendNotification(pushSubscription, payload, {
            TTL: options.ttl || 3600, // 1 hour default
            urgency: 'normal',
          })

          results.success++
          this.logger.log(`Push notification sent to ${subscription.endpoint}`)
        } catch (error) {
          results.failed++
          this.logger.error(`Failed to send push notification to ${subscription.endpoint}:`, error)

          // If the subscription is invalid (410 Gone), remove it
          if (error.statusCode === 410) {
            await this.prisma.pushSubscription.delete({
              where: { id: subscription.id },
            })
            this.logger.log(`Removed invalid subscription ${subscription.id}`)
          }
        }
      }

      return results
    } catch (error) {
      this.logger.error(`Error sending push notification to user ${options.userId}:`, error)
      return { success: 0, failed: 0 }
    }
  }

  /**
   * Send push notification to multiple users
   */
  async sendBulkPushNotification(
    userIds: string[],
    options: Omit<PushNotificationOptions, 'userId'>
  ): Promise<{ success: number; failed: number }> {
    const results = { success: 0, failed: 0 }

    for (const userId of userIds) {
      const result = await this.sendPushNotification({ ...options, userId })
      results.success += result.success
      results.failed += result.failed
    }

    return results
  }

  /**
   * Register a new push subscription
   */
  async registerSubscription(userId: string, subscription: PushSubscription): Promise<void> {
    try {
      // Check if subscription already exists
      const existing = await this.prisma.pushSubscription.findFirst({
        where: {
          userId,
          endpoint: subscription.endpoint,
        },
      })

      if (existing) {
        // Update existing subscription
        await this.prisma.pushSubscription.update({
          where: { id: existing.id },
          data: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
          },
        })
        this.logger.log(`Updated push subscription for user ${userId}`)
      } else {
        // Create new subscription
        await this.prisma.pushSubscription.create({
          data: {
            userId,
            endpoint: subscription.endpoint,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
          },
        })
        this.logger.log(`Registered new push subscription for user ${userId}`)
      }
    } catch (error) {
      this.logger.error(`Error registering push subscription for user ${userId}:`, error)
      throw error
    }
  }

  /**
   * Unregister a push subscription
   */
  async unregisterSubscription(userId: string, endpoint: string): Promise<void> {
    try {
      await this.prisma.pushSubscription.deleteMany({
        where: {
          userId,
          endpoint,
        },
      })
      this.logger.log(`Unregistered push subscription for user ${userId}`)
    } catch (error) {
      this.logger.error(`Error unregistering push subscription for user ${userId}:`, error)
      throw error
    }
  }

  /**
   * Get all subscriptions for a user
   */
  async getUserSubscriptions(userId: string): Promise<PushSubscription[]> {
    try {
      const subscriptions = await this.prisma.pushSubscription.findMany({
        where: { userId },
      })

      return subscriptions.map((sub) => ({
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      }))
    } catch (error) {
      this.logger.error(`Error getting subscriptions for user ${userId}:`, error)
      return []
    }
  }

  /**
   * Clean up invalid subscriptions
   */
  async cleanupInvalidSubscriptions(): Promise<number> {
    try {
      // This would typically be run as a scheduled job
      // For now, it's a placeholder
      this.logger.log('Cleanup of invalid subscriptions not implemented yet')
      return 0
    } catch (error) {
      this.logger.error('Error cleaning up invalid subscriptions:', error)
      return 0
    }
  }

  /**
   * Get VAPID public key (for frontend registration)
   */
  getVapidPublicKey(): string {
    return this.vapidPublicKey
  }
}
