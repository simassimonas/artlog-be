import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import {
  Notification,
  NotificationtDocument,
} from './schemas/notifications.schema';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationtDocument>,
  ) {}

  async create(notification: Notification): Promise<NotificationtDocument> {
    const newNotification = new this.notificationModel(notification);
    return newNotification.save();
  }

  async findAll(): Promise<NotificationtDocument[]> {
    return await this.notificationModel.find().exec();
  }

  async findOneById(id: string): Promise<NotificationtDocument> {
    return await this.notificationModel.findById(id).exec();
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<Notification>,
    update: Partial<Notification>,
  ): Promise<NotificationtDocument> {
    return this.notificationModel
      .findOneAndUpdate(filterQuery, update, {
        new: true,
      })
      .lean();
  }

  async delete(id: string): Promise<NotificationtDocument> {
    return await this.notificationModel.findByIdAndDelete(id).exec();
  }
}
