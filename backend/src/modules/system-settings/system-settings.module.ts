import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from '../../prisma/prisma.module'
import { SystemSettingsService } from './system-settings.service'
import { SystemSettingsController } from './system-settings.controller'

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [SystemSettingsController],
  providers: [SystemSettingsService],
  exports: [SystemSettingsService],
})
export class SystemSettingsModule {}
