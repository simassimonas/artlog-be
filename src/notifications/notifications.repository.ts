import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
  PartialNotification,
} from './schemas/notifications.schema';
import { UpdateNotificationDto } from './dtos/update-notification.dto';

@Injectable()
export class NotificationsRepository {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  async create(
    notification: PartialNotification,
  ): Promise<NotificationDocument> {
    const newNotification = new this.notificationModel(notification);
    return newNotification.save();
  }

  async findAll(): Promise<NotificationDocument[]> {
    return await this.notificationModel.find();
  }

  async findOneById(id: string): Promise<NotificationDocument> {
    return await this.notificationModel
      .findById(id)
      .populate(['initiatorId', 'receiverId'])
      .lean();
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<Notification>,
    update: Partial<Notification>,
  ): Promise<NotificationDocument> {
    return this.notificationModel
      .findOneAndUpdate(filterQuery, update, {
        new: true,
      })
      .lean();
  }

  async delete(id: string): Promise<NotificationDocument> {
    return await this.notificationModel.findByIdAndDelete(id).exec();
  }

  async find(
    filterQuery: FilterQuery<NotificationDocument>,
    sortQuery: any = {},
    skip?: number,
    limit?: number,
  ): Promise<any[]> {
    const query = this.notificationModel
      .find(filterQuery)
      .sort(sortQuery)
      .populate(['initiatorId', 'receiverId'])
      .lean();

    if (skip !== undefined && limit !== undefined) {
      query.skip(skip).limit(limit);
    }

    return query.exec();
  }

  async getCount(
    filterQuery: FilterQuery<NotificationDocument>,
  ): Promise<number> {
    return this.notificationModel.countDocuments(filterQuery);
  }

  async update(
    notificationId: string,
    update: UpdateNotificationDto,
  ): Promise<NotificationDocument> {
    return this.notificationModel
      .findByIdAndUpdate(notificationId, update, {
        new: true,
      })
      .populate(['initiatorId', 'receiverId']);
  }
}
