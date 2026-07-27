import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { MessageType, ParticipantRole, Prisma } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { ConversationFilterDto, CreateConversationDto } from './dto/communication.dto'

const conversationInclude = {
  participants: { include: { user: { select: { id: true, name: true } } } },
  messages: {
    orderBy: { createdAt: 'desc' as const },
    take: 1,
    include: { sender: { select: { id: true, name: true } } },
  },
} satisfies Prisma.ConversationInclude

@Injectable()
export class CommunicationService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string, filter: ConversationFilterDto) {
    return this.prisma.conversation.findMany({
      where: { participants: { some: { userId, role: filter.role } } },
      include: conversationInclude,
      orderBy: { updatedAt: 'desc' },
    })
  }

  async messages(conversationId: string, userId: string) {
    await this.requireMembership(conversationId, userId)
    return this.prisma.message.findMany({
      where: { conversationId },
      include: { sender: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
      take: 500,
    })
  }

  async create(data: CreateConversationDto, userId: string) {
    const participantIds = [...new Set([userId, ...(data.participantIds ?? [])])]
    const existing = await this.prisma.user.count({
      where: { id: { in: participantIds }, status: 'ACTIVE' },
    })
    if (existing !== participantIds.length)
      throw new NotFoundException('One or more participants were not found')
    return this.prisma.conversation.create({
      data: {
        subject: data.subject.trim(),
        entityType: data.entityType,
        entityId: data.entityId,
        priority: data.priority,
        participants: {
          create: participantIds.map((participantId) => ({
            userId: participantId,
            role: participantId === userId ? ParticipantRole.OWNER : ParticipantRole.FOLLOWER,
          })),
        },
      },
      include: conversationInclude,
    })
  }

  async send(conversationId: string, senderId: string, text: string) {
    await this.requireMembership(conversationId, senderId)
    return this.prisma.$transaction(async (transaction) => {
      const message = await transaction.message.create({
        data: { conversationId, senderId, type: MessageType.USER, content: { text: text.trim() } },
        include: { sender: { select: { id: true, name: true } } },
      })
      await transaction.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      })
      return message
    })
  }

  async markRead(conversationId: string, userId: string) {
    const membership = await this.requireMembership(conversationId, userId)
    await this.prisma.conversationParticipant.update({
      where: { id: membership.id },
      data: { lastReadAt: new Date() },
    })
    return { success: true }
  }

  private async requireMembership(conversationId: string, userId: string) {
    const membership = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    })
    if (!membership) throw new ForbiddenException('Conversation membership is required')
    return membership
  }
}
