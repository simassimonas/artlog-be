import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class MessagesRepository {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {}

  async create(message: Message): Promise<MessageDocument> {
    const newMessage = new this.messageModel(message);
    await newMessage.save();

    const populatedMessage = await this.findOneById(newMessage._id);
    return populatedMessage;
  }

  async findOneById(id: string): Promise<MessageDocument> {
    return this.messageModel.findById(id).populate(['from', 'to']).lean();
  }

  async find(
    messagesFilterQuery: FilterQuery<MessageDocument>,
    sortQuery: any = {},
    limit?: number,
  ): Promise<MessageDocument[]> {
    return this.messageModel
      .find(messagesFilterQuery)
      .sort(sortQuery)
      .limit(limit)
      .populate(['from', 'to'])
      .lean();
  }
}
