import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { CommunicationController } from './communication.controller'
import { CommunicationGateway } from './communication.gateway'
import { CommunicationService } from './communication.service'

@Module({
  imports: [JwtModule.register({})],
  controllers: [CommunicationController],
  providers: [CommunicationService, CommunicationGateway],
})
export class CommunicationModule {}
