import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from '../../prisma/prisma.module'
import { WizardService } from './wizard.service'
import { WizardController } from './wizard.controller'

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [WizardController],
  providers: [WizardService],
  exports: [WizardService],
})
export class WizardModule {}
