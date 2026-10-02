/**
 * IRIB Digital Workplace Platform - WebSocket Gateway
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets'
import { Logger } from '@nestjs/common'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(WebsocketGateway.name)

  @WebSocketServer()
  server!: Server

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`)
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`)
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string; userId?: string }
  ) {
    client.join(data.room)
    this.logger.log(`Client ${client.id} joined room: ${data.room}`)

    // Notify others in the room
    client.to(data.room).emit('user-joined', {
      userId: data.userId,
      socketId: client.id,
    })

    return { success: true, room: data.room }
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { room: string }) {
    client.leave(data.room)
    this.logger.log(`Client ${client.id} left room: ${data.room}`)

    client.to(data.room).emit('user-left', {
      socketId: client.id,
    })

    return { success: true, room: data.room }
  }

  @SubscribeMessage('broadcast')
  handleBroadcast(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string; event: string; payload: any }
  ) {
    this.server.to(data.room).emit(data.event, data.payload)
    this.logger.log(`Broadcasting ${data.event} to room: ${data.room}`)
    return { success: true }
  }

  // Server-side method to send notifications
  notifyRoom(room: string, event: string, payload: any) {
    this.server.to(room).emit(event, payload)
    this.logger.log(`Notified room ${room} with event ${event}`)
  }

  notifyUser(userId: string, event: string, payload: any) {
    this.server.to(`user:${userId}`).emit(event, payload)
    this.logger.log(`Notified user ${userId} with event ${event}`)
  }

  notifyAll(event: string, payload: any) {
    this.server.emit(event, payload)
    this.logger.log(`Broadcasted ${event} to all clients`)
  }
}
