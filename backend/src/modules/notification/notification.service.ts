/**
 * IRIB Digital Workplace Platform - Notification Service
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NotificationRepository } from './notification.repository'
import { SmsService } from '../sms/sms.service'
import { EmailService } from '../../common/services/email.service'
import { PushNotificationService } from '../../common/services/push-notification.service'

export type NotificationChannel = 'IN_APP' | 'SMS' | 'EMAIL' | 'PUSH'

export interface NotificationData {
  userId: string
  type: string
  title: string
  message: string
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  channels?: NotificationChannel[]
  metadata?: Record<string, any>
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name)

  constructor(
    private config: ConfigService,
    private repository: NotificationRepository,
    private smsService: SmsService,
    private emailService: EmailService,
    private pushNotificationService: PushNotificationService
  ) {}

  /**
   * Send notification through specified channels
   */
  async send(data: NotificationData): Promise<void> {
    const channels = data.channels || this.getDefaultChannels(data.type)

    // Create notification record
    const notification = await this.repository.create({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      priority: data.priority || 'NORMAL',
      channels,
      metadata: data.metadata || {},
    })

    // Send through each channel
    const promises = channels.map((channel) => this.sendToChannel(channel, notification, data))
    await Promise.allSettled(promises)

    this.logger.log(`Notification sent to user ${data.userId} via ${channels.join(', ')}`)
  }

  /**
   * Send bulk notification to multiple users
   */
  async sendBulk(userIds: string[], data: Omit<NotificationData, 'userId'>): Promise<void> {
    const promises = userIds.map((userId) => this.send({ ...data, userId }))
    await Promise.allSettled(promises)
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: string, limit = 50) {
    return this.repository.findUserNotifications(userId, limit)
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    return this.repository.markAsRead(notificationId, userId)
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId: string) {
    return this.repository.markAllAsRead(userId)
  }

  /**
   * Get notification statistics
   */
  async getStats(userId: string) {
    return this.repository.getStats(userId)
  }

  /**
   * Send notification to specific channel
   */
  private async sendToChannel(
    channel: NotificationChannel,
    notification: any,
    data: NotificationData
  ): Promise<void> {
    try {
      switch (channel) {
        case 'SMS':
          await this.sendSms(notification, data)
          break
        case 'EMAIL':
          await this.sendEmail(notification, data)
          break
        case 'PUSH':
          await this.sendPush(notification, data)
          break
        case 'IN_APP':
          // In-app is just the notification record itself
          break
      }
    } catch (error) {
      this.logger.error(`Failed to send notification via ${channel}:`, error)
    }
  }

  /**
   * Send SMS notification
   */
  private async sendSms(notification: any, data: NotificationData): Promise<void> {
    const user = await this.repository.findUserMobile(data.userId)
    if (!user?.mobile) {
      this.logger.warn(`User ${data.userId} has no mobile number for SMS`)
      return
    }

    await this.smsService.send(user.mobile, data.message)
  }

  /**
   * Send email notification
   */
  private async sendEmail(notification: any, data: NotificationData): Promise<void> {
    const user = await this.repository.findUserEmail(data.userId)
    if (!user?.email) {
      this.logger.warn(`User ${data.userId} has no email address`)
      return
    }

    // Select appropriate email template based on notification type
    let emailSent = false
    switch (data.type) {
      case 'OTP_LOGIN':
      case 'OTP_REGISTRATION': {
        const code = data.metadata?.code || '123456'
        emailSent = await this.emailService.sendOtpEmail(user.email, code)
        break
      }
      case 'PASSWORD_RESET': {
        const resetLink = data.metadata?.resetLink || 'https://portal.iribtabriz.ir/reset-password'
        emailSent = await this.emailService.sendPasswordResetEmail(user.email, resetLink)
        break
      }
      case 'TASK_ASSIGNED':
        emailSent = await this.emailService.sendTaskAssignmentEmail(
          user.email,
          data.metadata?.taskTitle || 'تکلیف جدید',
          data.metadata?.taskDescription || data.message,
          data.metadata?.priority || 'NORMAL',
          data.metadata?.dueDate || 'بدون مهلت',
          data.metadata?.taskLink || 'https://portal.iribtabriz.ir/tasks'
        )
        break
      case 'SYSTEM_ALERT':
        emailSent = await this.emailService.sendSystemAlertEmail(
          user.email,
          data.message,
          new Date().toLocaleString('fa-IR')
        )
        break
      default:
        // Send generic email for other types
        emailSent = await this.emailService.sendEmail({
          to: user.email,
          subject: data.title,
          html: `
            <div dir="rtl" style="font-family: Vazirmatn, sans-serif;">
              <h2>${data.title}</h2>
              <p>${data.message}</p>
              <p>زمان: ${new Date().toLocaleString('fa-IR')}</p>
            </div>
          `,
        })
    }

    if (emailSent) {
      this.logger.log(`Email sent to ${user.email} for notification ${notification.id}`)
    } else {
      this.logger.warn(`Failed to send email to ${user.email}`)
    }
  }

  /**
   * Send push notification
   */
  private async sendPush(notification: any, data: NotificationData): Promise<void> {
    const result = await this.pushNotificationService.sendPushNotification({
      userId: data.userId,
      title: data.title,
      body: data.message,
      data: data.metadata,
      url: data.metadata?.url,
    })

    this.logger.log(
      `Push notification sent to user ${data.userId}: ${result.success} success, ${result.failed} failed`
    )
  }

  /**
   * Get default channels based on notification type
   */
  private getDefaultChannels(type: string): NotificationChannel[] {
    const defaults: Record<string, NotificationChannel[]> = {
      OTP_LOGIN: ['SMS', 'PUSH'],
      OTP_REGISTRATION: ['SMS', 'PUSH'],
      PASSWORD_RESET: ['SMS', 'EMAIL', 'PUSH'],
      TASK_ASSIGNED: ['IN_APP', 'EMAIL', 'PUSH'],
      MEETING_REMINDER: ['IN_APP', 'SMS', 'EMAIL', 'PUSH'],
      SYSTEM_ALERT: ['IN_APP', 'SMS', 'EMAIL', 'PUSH'],
      CAMPAIGN: ['SMS', 'EMAIL'],
    }

    return defaults[type] || ['IN_APP']
  }
}
