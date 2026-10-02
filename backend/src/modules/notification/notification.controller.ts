import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common'
import { JwtAuthGuard } from '../iam/jwt-auth.guard'
import { NotificationService } from './notification.service'
import type { NotificationData } from './notification.service'

@Controller('notifications')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  /**
   * Get user notifications
   * GET /notifications
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getNotifications(@Request() req: any) {
    return this.service.getUserNotifications(req.user.id)
  }

  /**
   * Get notification statistics
   * GET /notifications/stats
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats(@Request() req: any) {
    return this.service.getStats(req.user.id)
  }

  /**
   * Mark notification as read
   * POST /notifications/:id/read
   */
  @Post(':id/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    return this.service.markAsRead(id, req.user.id)
  }

  /**
   * Mark all notifications as read
   * POST /notifications/read-all
   */
  @Post('read-all')
  @UseGuards(JwtAuthGuard)
  async markAllAsRead(@Request() req: any) {
    return this.service.markAllAsRead(req.user.id)
  }

  /**
   * Send notification (admin only - should add admin guard)
   * POST /notifications/send
   */
  @Post('send')
  @UseGuards(JwtAuthGuard)
  async sendNotification(@Body() data: NotificationData) {
    return this.service.send(data)
  }

  /**
   * Send bulk notification (admin only)
   * POST /notifications/send-bulk
   */
  @Post('send-bulk')
  @UseGuards(JwtAuthGuard)
  async sendBulkNotification(
    @Body() data: Omit<NotificationData, 'userId'> & { userIds: string[] }
  ) {
    const { userIds, ...notificationData } = data
    return this.service.sendBulk(userIds, notificationData)
  }
}
