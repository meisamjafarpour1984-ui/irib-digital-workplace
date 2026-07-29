import { Module } from '@nestjs/common'
import { MobileIdentityController } from './mobile-identity.controller'
import { MobileIdentityService } from './mobile-identity.service'

@Module({
  controllers: [MobileIdentityController],
  providers: [MobileIdentityService],
  exports: [MobileIdentityService],
})
export class MobileIdentityModule {}
