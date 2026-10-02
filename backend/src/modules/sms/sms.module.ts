/**
 * IRIB Digital Workplace Platform - SMS Module
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
import { SmsService } from './sms.service'
import { SmsController } from './sms.controller'
import { SmsAdminController } from './sms-admin.controller'
import { DeliveryTrackingController } from './delivery-tracking.controller'
import { SmsCampaignController } from './sms-campaign.controller'
import { SmsTemplateController } from './sms-template.controller'
import { SmsRepository } from './sms.repository'
import { SmsTemplateService } from './sms-template.service'
import { SmsCampaignService } from './sms-campaign.service'
import { IdehPayamAdapter } from './adapters/idehpayam.adapter'
import { MockSmsAdapter } from './adapters/mock-sms.adapter'
import { DeliveryTrackingService } from './delivery-tracking.service'
import { RecipientResolverService } from './recipient-resolver.service'
import { QueueModule } from '../../common/queues/queue.module'
import { ScheduleModule } from '@nestjs/schedule'

@Module({
  imports: [ConfigModule, PrismaModule, QueueModule, ScheduleModule.forRoot()],
  controllers: [
    SmsController,
    SmsAdminController,
    DeliveryTrackingController,
    SmsCampaignController,
    SmsTemplateController,
  ],
  providers: [
    SmsService,
    SmsRepository,
    SmsTemplateService,
    SmsCampaignService,
    IdehPayamAdapter,
    MockSmsAdapter,
    DeliveryTrackingService,
    RecipientResolverService,
    {
      provide: 'SmsService',
      useExisting: SmsService,
    },
  ],
  exports: [
    SmsService,
    'SmsService',
    DeliveryTrackingService,
    SmsTemplateService,
    SmsCampaignService,
  ],
})
export class SmsModule {}
