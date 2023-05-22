import { Injectable } from '@nestjs/common';
import { NotificationsRepository } from './notifications.repository';
import { NotificationDocument } from './schemas/notifications.schema';
import { ENotificationType } from 'src/common/constants/notification-type.enum';
import { FilterQuery } from 'mongoose';
import { UpdateNotificationDto } from './dtos/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  async createNotification(
    initiatorId: string,
    receiverId: string,
    refId: string,
    type: ENotificationType,
  ): Promise<NotificationDocument> {
    const partialNotification = { initiatorId, receiverId, refId, type };
    const notification = await this.notificationsRepository.create(
      partialNotification,
    );
    return this.notificationsRepository.findOneById(notification._id);
  }

  async getNotifications(
    userId: string,
    getUnseen: boolean,
  ): Promise<NotificationDocument[]> {
    const filterQuery: FilterQuery<NotificationDocument> = {
      receiverId: userId,
    };

    if (getUnseen) {
      filterQuery.isSeen = false;
    }

    const sortQuery = { createdAt: -1 };

    return this.notificationsRepository.find(filterQuery, sortQuery);
  }

  async getPaginatedNotifications(
    filterQuery: FilterQuery<NotificationDocument>,
    sortQuery: any,
    page: number,
    limit: number,
  ): Promise<{
    notifications: NotificationDocument[];
    hasNextPage: boolean;
    nextPage: number;
  }> {
    const skip = page * limit;

    const notifications = await this.notificationsRepository.find(
      filterQuery,
      sortQuery,
      skip,
      limit,
    );

    const hasNextPage =
      (
        await this.notificationsRepository.find(
          filterQuery,
          {},
          skip + limit,
          1,
        )
      ).length > 0;

    return {
      notifications,
      hasNextPage,
      nextPage: hasNextPage ? page + 1 : null,
    };
  }

  async getUnseenNotificationsCount(userId: string): Promise<number> {
    const filterQuery = { receiverId: userId, isSeen: false };
    return await this.notificationsRepository.getCount(filterQuery);
  }

  async updateNotification(
    userId: string,
    notificationId: string,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<NotificationDocument> {
    return this.notificationsRepository.update(
      notificationId,
      updateNotificationDto,
    );
  }
}
