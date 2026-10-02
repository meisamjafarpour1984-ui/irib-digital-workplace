import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from '../../prisma/prisma.module'
import { MobileVerificationController } from './mobile-verification.controller'
import { MobileVerificationService } from './mobile-verification.service'
import { MobileVerificationRepository } from './mobile-verification.repository'
import { SmsModule } from '../sms/sms.module'

@Module({
  imports: [ConfigModule, PrismaModule, SmsModule],
  controllers: [MobileVerificationController],
  providers: [MobileVerificationService, MobileVerificationRepository],
  exports: [MobileVerificationService, MobileVerificationRepository],
})
export class MobileVerificationModule {}
