/**
 * IRIB Digital Workplace Platform - Notification Service Unit Tests (P0-2)
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { NotificationService, NotificationData } from './notification.service'
import { NotificationRepository } from './notification.repository'
import { SmsService } from '../sms/sms.service'
import { EmailService } from '../../common/services/email.service'
import { PushNotificationService } from '../../common/services/push-notification.service'

const sampleNotification: NotificationData = {
  userId: 'user-1',
  type: 'TICKET_REPLY',
  title: 'تیکت شما پاسخ داده شد',
  message: 'تیکت شماره ۴۲ پاسخ داده شد.',
  priority: 'HIGH',
  channels: ['IN_APP', 'EMAIL', 'SMS', 'PUSH'],
  metadata: { ticketId: 'T-42' },
}

const sampleRecord = {
  id: 'notif-1',
  ...sampleNotification,
  channels: ['IN_APP'],
  metadata: sampleNotification.metadata,
  createdAt: new Date(),
}

describe('NotificationService', () => {
  let service: NotificationService
  let repository: NotificationRepository
  let smsService: SmsService
  let emailService: EmailService
  let pushService: PushNotificationService

  const mockRepository = {
    create: jest.fn().mockResolvedValue(sampleRecord),
    findUserNotifications: jest.fn().mockResolvedValue([sampleRecord]),
    markAsRead: jest.fn().mockResolvedValue({ count: 1 }),
    markAllAsRead: jest.fn().mockResolvedValue({ count: 12 }),
    getStats: jest.fn().mockResolvedValue({ total: 20, unread: 3 }),
    findUserMobile: jest.fn().mockResolvedValue({ mobile: '09123456789' }),
    findUserEmail: jest.fn().mockResolvedValue({ email: 'u@example.com' }),
  }

  const mockConfig = {
    get: jest.fn((k: string) => ({ NOTIFICATION_DEFAULT_CHANNELS: 'IN_APP,EMAIL' })[k]),
  }

  const mockSms = { send: jest.fn().mockResolvedValue({ success: true }) }
  const mockEmail = { sendEmail: jest.fn().mockResolvedValue(true) }
  const mockPush = { sendPushNotification: jest.fn().mockResolvedValue({ success: 1, failed: 0 }) }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: NotificationRepository, useValue: mockRepository },
        { provide: ConfigService, useValue: mockConfig },
        { provide: SmsService, useValue: mockSms },
        { provide: EmailService, useValue: mockEmail },
        { provide: PushNotificationService, useValue: mockPush },
      ],
    }).compile()
    service = module.get<NotificationService>(NotificationService)
    repository = module.get<NotificationRepository>(NotificationRepository)
    smsService = module.get<SmsService>(SmsService)
    emailService = module.get<EmailService>(EmailService)
    pushService = module.get<PushNotificationService>(PushNotificationService)
  })

  it('should be defined', () => expect(service).toBeDefined())

  describe('send', () => {
    it('creates record and dispatches each channel via Promise.allSettled', async () => {
      await service.send(sampleNotification)
      expect(repository.create).toHaveBeenCalledTimes(1)
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          type: 'TICKET_REPLY',
          priority: 'HIGH',
          channels: ['IN_APP', 'EMAIL', 'SMS', 'PUSH'],
          metadata: { ticketId: 'T-42' },
        })
      )
      expect(smsService.send).toHaveBeenCalledTimes(1)
      expect(emailService.sendEmail).toHaveBeenCalledTimes(1)
      expect(pushService.sendPushNotification).toHaveBeenCalledTimes(1)
    })

    it('falls back to default channels when none provided', async () => {
      await service.send({ ...sampleNotification, channels: undefined })
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          channels: ['IN_APP'],
        })
      )
    })

    it('defaults priority to NORMAL', async () => {
      await service.send({ ...sampleNotification, priority: undefined })
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ priority: 'NORMAL' })
      )
    })

    it('does not throw even if one of the channels fails', async () => {
      ;(smsService.send as jest.Mock).mockRejectedValueOnce(new Error('sms gateway down'))
      await expect(service.send(sampleNotification)).resolves.not.toThrow()
      expect(emailService.sendEmail).toHaveBeenCalled()
      expect(pushService.sendPushNotification).toHaveBeenCalled()
    })
  })

  describe('sendBulk', () => {
    it('calls send() for each userId via allSettled', async () => {
      const userIds = ['u1', 'u2', 'u3']
      const sendSpy = jest.spyOn(service, 'send').mockResolvedValue()
      await service.sendBulk(userIds, { type: 'T', title: 'x', message: 'y' })
      expect(sendSpy).toHaveBeenCalledTimes(3)
      expect(sendSpy.mock.calls.map(([arg]) => arg.userId)).toEqual(userIds)
    })
  })

  describe('read operations', () => {
    it('getUserNotifications passes userId + limit to repository', async () => {
      const r = await service.getUserNotifications('u1', 10)
      expect(repository.findUserNotifications).toHaveBeenCalledWith('u1', 10)
      expect(r).toEqual([sampleRecord])
    })

    it('getUserNotifications defaults limit to 50', async () => {
      await service.getUserNotifications('u1')
      expect(repository.findUserNotifications).toHaveBeenCalledWith('u1', 50)
    })

    it('markAsRead', async () => {
      const r = await service.markAsRead('n-1', 'u1')
      expect(repository.markAsRead).toHaveBeenCalledWith('n-1', 'u1')
      expect(r).toEqual({ count: 1 })
    })

    it('markAllAsRead', async () => {
      const r = await service.markAllAsRead('u1')
      expect(repository.markAllAsRead).toHaveBeenCalledWith('u1')
      expect(r).toEqual({ count: 12 })
    })

    it('getStats', async () => {
      const r = await service.getStats('u1')
      expect(repository.getStats).toHaveBeenCalledWith('u1')
      expect(r).toEqual({ total: 20, unread: 3 })
    })
  })

  describe('channel-specific behavior', () => {
    it('sends SMS when user has mobile number', async () => {
      await service.send({
        ...sampleNotification,
        channels: ['SMS'],
      })
      expect(smsService.send).toHaveBeenCalledWith('09123456789', sampleNotification.message)
    })

    it('skips SMS when user has no mobile number', async () => {
      mockRepository.findUserMobile.mockResolvedValueOnce(null)
      await service.send({
        ...sampleNotification,
        channels: ['SMS'],
      })
      expect(smsService.send).not.toHaveBeenCalled()
    })

    it('sends email when user has email address', async () => {
      await service.send({
        ...sampleNotification,
        channels: ['EMAIL'],
      })
      expect(emailService.sendEmail).toHaveBeenCalled()
    })

    it('skips email when user has no email address', async () => {
      mockRepository.findUserEmail.mockResolvedValueOnce(null)
      await service.send({
        ...sampleNotification,
        channels: ['EMAIL'],
      })
      expect(emailService.sendEmail).not.toHaveBeenCalled()
    })

    it('sends push notification', async () => {
      await service.send({
        ...sampleNotification,
        channels: ['PUSH'],
      })
      expect(pushService.sendPushNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          title: sampleNotification.title,
          body: sampleNotification.message,
        })
      )
    })
  })

  describe('notification type-specific defaults', () => {
    it('uses SMS + PUSH for OTP_LOGIN', async () => {
      await service.send({
        ...sampleNotification,
        type: 'OTP_LOGIN',
        channels: undefined,
      })
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          channels: expect.arrayContaining(['SMS', 'PUSH']),
        })
      )
    })

    it('uses SMS + EMAIL + PUSH for PASSWORD_RESET', async () => {
      await service.send({
        ...sampleNotification,
        type: 'PASSWORD_RESET',
        channels: undefined,
      })
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          channels: expect.arrayContaining(['SMS', 'EMAIL', 'PUSH']),
        })
      )
    })

    it('uses IN_APP + EMAIL + PUSH for TASK_ASSIGNED', async () => {
      await service.send({
        ...sampleNotification,
        type: 'TASK_ASSIGNED',
        channels: undefined,
      })
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          channels: expect.arrayContaining(['IN_APP', 'EMAIL', 'PUSH']),
        })
      )
    })

    it('defaults to IN_APP for unknown notification type', async () => {
      await service.send({
        ...sampleNotification,
        type: 'UNKNOWN_TYPE',
        channels: undefined,
      })
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          channels: ['IN_APP'],
        })
      )
    })
  })

  describe('error handling', () => {
    it('continues execution when SMS fails', async () => {
      ;(smsService.send as jest.Mock).mockRejectedValueOnce(new Error('SMS failed'))
      await expect(service.send(sampleNotification)).resolves.not.toThrow()
      expect(emailService.sendEmail).toHaveBeenCalled()
    })

    it('continues execution when email fails', async () => {
      ;(emailService.sendEmail as jest.Mock).mockRejectedValueOnce(new Error('Email failed'))
      await expect(service.send(sampleNotification)).resolves.not.toThrow()
      expect(smsService.send).toHaveBeenCalled()
    })

    it('continues execution when push fails', async () => {
      ;(pushService.sendPushNotification as jest.Mock).mockRejectedValueOnce(
        new Error('Push failed')
      )
      await expect(service.send(sampleNotification)).resolves.not.toThrow()
      expect(smsService.send).toHaveBeenCalled()
    })
  })
})
