import { Injectable } from '@nestjs/common';
import { MessagesRepository } from './messages.repository';
import { CreateMessageDto } from './dtos/create-message.dto';
import { Message, MessageDocument } from './schemas/message.schema';
import { MessagesGateway } from './messages.gateway';
import { FilterQuery } from 'mongoose';

@Injectable()
export class MessagesService {
  constructor(
    private readonly messagesRepository: MessagesRepository,
    private readonly messagesGateway: MessagesGateway,
  ) {}

  async createMessage(message: Message): Promise<MessageDocument> {
    const createdMessage = await this.messagesRepository.create(message);

    if (message.from !== message.to) {
      this.messagesGateway.sendMessage(createdMessage);
    }

    return createdMessage;
  }

  async getConversation(
    userId: string,
    convoWithUserId: string,
    lastMessageId: string | null,
    limit: number,
  ): Promise<{
    messages: MessageDocument[];
    hasNextPage: boolean;
  }> {
    const filterQuery: FilterQuery<MessageDocument> = {};
    if (userId == convoWithUserId) {
      filterQuery.from = userId;
      filterQuery.to = userId;
    } else {
      filterQuery.$or = [
        { from: userId, to: convoWithUserId },
        { from: convoWithUserId, to: userId },
      ];
    }

    if (lastMessageId) {
      filterQuery._id = { $lt: lastMessageId };
    }

    const sortQuery = { createdAt: -1 };

    return this.getPaginatedMessages(filterQuery, sortQuery, limit);
  }

  async getPaginatedMessages(
    filterQuery: FilterQuery<MessageDocument>,
    sortQuery: any,
    limit: number,
  ): Promise<{
    messages: MessageDocument[];
    hasNextPage: boolean;
  }> {
    const messages = await this.messagesRepository.find(
      filterQuery,
      sortQuery,
      limit + 1,
    );

    let hasNextPage = false;
    if (messages.length > limit) {
      hasNextPage = true;
      messages.pop(); // remove the extra item used to detect if there's a next page
    }

    return { messages, hasNextPage };
  }
}
