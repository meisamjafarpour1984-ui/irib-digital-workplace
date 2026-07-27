import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import type { Request } from 'express'
import { JwtAuthGuard } from '../iam/jwt-auth.guard'
import { CommunicationGateway } from './communication.gateway'
import { CommunicationService } from './communication.service'
import {
  ConversationFilterDto,
  CreateConversationDto,
  SendMessageDto,
} from './dto/communication.dto'

type AuthenticatedRequest = Request & { user: { sub: string } }

@ApiTags('Communication')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class CommunicationController {
  constructor(
    private readonly service: CommunicationService,
    private readonly gateway: CommunicationGateway
  ) {}
  @Get() list(@Req() req: AuthenticatedRequest, @Query() filter: ConversationFilterDto) {
    return this.service.list(req.user.sub, filter)
  }
  @Post() create(@Req() req: AuthenticatedRequest, @Body() body: CreateConversationDto) {
    return this.service.create(body, req.user.sub).then((conversation) => {
      this.gateway.joinConversation(
        conversation.id,
        conversation.participants.map(({ userId }) => userId)
      )
      return conversation
    })
  }
  @Get(':id/messages') messages(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.service.messages(id, req.user.sub)
  }
  @Post(':id/messages') async send(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: SendMessageDto
  ) {
    const message = await this.service.send(id, req.user.sub, body.text)
    this.gateway.deliver(id, message)
    return message
  }
  @Post(':id/read') read(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.service.markRead(id, req.user.sub)
  }
}
