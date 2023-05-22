import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateMessageDto } from './dtos/create-message.dto';
import { MessageDocument } from './schemas/message.schema';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post('')
  async createMessage(
    @Body() body: CreateMessageDto,
    @Req() req,
  ): Promise<MessageDocument> {
    const message = {
      from: req.user.id,
      ...body,
    };
    return this.messagesService.createMessage(message);
  }

  // pagination token implementation
  @Get('conversations/:convoWithUserId')
  async getConversation(
    @Req() req,
    @Param('convoWithUserId') convoWithUserId: string,
    @Query('lastMessageId') lastMessageId: string,
    @Query('limit') limit: number,
  ): Promise<{
    messages: MessageDocument[];
    hasNextPage: boolean;
  }> {
    const isLastMessageId =
      lastMessageId && lastMessageId != 'null' && lastMessageId != 'undefined';
    return this.messagesService.getConversation(
      req.user.id,
      convoWithUserId,
      isLastMessageId ? lastMessageId : null,
      limit,
    );
  }
}
