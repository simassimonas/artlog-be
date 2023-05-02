import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationDocument } from './schemas/notifications.schema';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateNotificationDto } from './dtos/update-notification.dto';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('')
  async getNotifications(
    @Req() req,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<{
    notifications: NotificationDocument[];
    hasNextPage: boolean;
    nextPage: number;
  }> {
    return this.notificationsService.getNotifications(req.user.id, page, limit);
  }

  @Get('unseen-count')
  async getUnseenNotificationsCount(@Req() req): Promise<number> {
    return this.notificationsService.getUnseenNotificationsCount(req.user.id);
  }

  @Patch(':id')
  async updateNotification(
    @Req() req,
    @Param('id') notificationId: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ): Promise<NotificationDocument> {
    return this.notificationsService.updateNotification(
      req.user.id,
      notificationId,
      updateNotificationDto,
    );
  }
}
