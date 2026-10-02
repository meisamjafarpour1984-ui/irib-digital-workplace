/**
 * IRIB Digital Workplace Platform - Notification Module
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from '../../prisma/prisma.module'
import { NotificationService } from './notification.service'
import { NotificationController } from './notification.controller'
import { NotificationRepository } from './notification.repository'
import { SmsModule } from '../sms/sms.module'
import { CommonModule } from '../../common/common.module'

@Module({
  imports: [ConfigModule, PrismaModule, SmsModule, CommonModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationRepository,
    {
      provide: 'NotificationService',
      useExisting: NotificationService,
    },
  ],
  exports: [NotificationService, 'NotificationService'],
})
export class NotificationModule {}
