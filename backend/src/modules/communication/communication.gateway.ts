import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Logger } from '@nestjs/common'
import type { Server, Socket } from 'socket.io'
import { CommunicationService } from './communication.service'

@WebSocketGateway({
  namespace: '/inbox',
  cors: { credentials: true },
  pingTimeout: 30000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e6, // 1MB
})
export class CommunicationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server
  private readonly logger = new Logger(CommunicationGateway.name)
  private readonly jwt: JwtService
  private readonly allowedOrigins: string[]
  private readonly connectedUsers = new Map<string, Set<string>>() // userId -> socketIds

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
      client.data.socketId = client.id

      // Track user connection
      if (!this.connectedUsers.has(payload.sub)) {
        this.connectedUsers.set(payload.sub, new Set())
      }
      this.connectedUsers.get(payload.sub)!.add(client.id)

      const conversations = await this.service.list(payload.sub, {})
      conversations.forEach(({ id }) => void client.join(`conversation:${id}`))

      this.logger.log(`User ${payload.sub} connected with socket ${client.id}`)
    } catch (error) {
      this.logger.warn(`Connection failed: ${error.message}`)
      client.disconnect(true)
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId as string
    const socketId = client.id

    if (userId && this.connectedUsers.has(userId)) {
      this.connectedUsers.get(userId)!.delete(socketId)
      if (this.connectedUsers.get(userId)!.size === 0) {
        this.connectedUsers.delete(userId)
      }
    }

    this.logger.log(`User ${userId} disconnected with socket ${socketId}`)
  }

  deliver(conversationId: string, message: unknown) {
    this.server.to(`conversation:${conversationId}`).emit('message.created', message)
  }

  deliverToUser(userId: string, event: string, data: unknown) {
    const socketIds = this.connectedUsers.get(userId)
    if (socketIds && socketIds.size > 0) {
      socketIds.forEach((socketId) => {
        this.server.to(socketId).emit(event, data)
      })
      return true
    }
    return false
  }

  joinConversation(conversationId: string, userIds: string[]) {
    this.server.sockets.sockets.forEach((socket) => {
      if (userIds.includes(socket.data.userId as string)) {
        void socket.join(`conversation:${conversationId}`)
      }
    })
  }

  leaveConversation(conversationId: string, userIds: string[]) {
    this.server.sockets.sockets.forEach((socket) => {
      if (userIds.includes(socket.data.userId as string)) {
        void socket.leave(`conversation:${conversationId}`)
      }
    })
  }

  getConnectedUsersCount(): number {
    return this.connectedUsers.size
  }

  getUserConnections(userId: string): number {
    return this.connectedUsers.get(userId)?.size ?? 0
  }
}
