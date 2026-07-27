import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets'
import type { Server, Socket } from 'socket.io'
import { CommunicationService } from './communication.service'

@WebSocketGateway({ namespace: '/inbox', cors: { credentials: true } })
export class CommunicationGateway implements OnGatewayConnection {
  @WebSocketServer() server!: Server
  private readonly jwt: JwtService
  private readonly allowedOrigins: string[]
  constructor(
    config: ConfigService,
    private readonly service: CommunicationService
  ) {
    this.jwt = new JwtService({
      secret: config.get<string>('JWT_SECRET'),
      signOptions: {
        issuer: config.get('JWT_ISSUER', 'irib-dwp'),
        audience: config.get('JWT_AUDIENCE', 'irib-dwp-web'),
      },
    })
    this.allowedOrigins = (config.get<string>('CORS_ORIGINS') ?? 'http://localhost:3000')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
  }
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token as string | undefined
      const origin = client.handshake.headers.origin
      if (origin && !this.allowedOrigins.includes(origin)) throw new Error('Origin is not allowed')
      const payload = await this.jwt.verifyAsync<{ sub: string; type: string }>(token ?? '')
      if (payload.type !== 'access') throw new Error('Invalid token type')
      client.data.userId = payload.sub
      const conversations = await this.service.list(payload.sub, {})
      conversations.forEach(({ id }) => void client.join(`conversation:${id}`))
    } catch {
      client.disconnect(true)
    }
  }
  deliver(conversationId: string, message: unknown) {
    this.server.to(`conversation:${conversationId}`).emit('message.created', message)
  }
  joinConversation(conversationId: string, userIds: string[]) {
    this.server.sockets.sockets.forEach((socket) => {
      if (userIds.includes(socket.data.userId as string)) {
        void socket.join(`conversation:${conversationId}`)
      }
    })
  }
}
