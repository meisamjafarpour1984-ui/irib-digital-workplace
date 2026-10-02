import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId: string
    type: string
    title: string
    message: string
    priority: string
    channels: string[]
    metadata: Record<string, any>
  }) {
    return this.prisma.notification.create({
      data,
    })
  }

  async findUserNotifications(userId: string, limit = 50) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  async findUserMobile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { mobile: true },
    })
  }

  async findUserEmail(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    })
  }

  async markAsRead(_notificationId: string, _userId: string) {
    // readAt field doesn't exist in current schema
    // Return placeholder data
    return { count: 1 }
  }

  async markAllAsRead(_userId: string) {
    // readAt field doesn't exist in current schema
    // Return placeholder data
    return { count: 0 }
  }

  async getStats(userId: string) {
    const total = await this.prisma.notification.count({ where: { userId } })
    // readAt field doesn't exist in current schema
    // Return placeholder stats
    return { total, unread: total }
  }
}
