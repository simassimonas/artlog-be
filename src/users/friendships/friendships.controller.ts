import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  Patch,
  Delete,
} from '@nestjs/common';
import { FriendshipsService } from './friendships.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FriendshipResponseDto } from '../dto/response-friendship.dto';

@UseGuards(JwtAuthGuard)
@Controller('friendships')
export class FriendshipsController {
  constructor(private readonly friendshipsService: FriendshipsService) {}

  @Post('/request/:receiverId')
  async sendFriendRequest(@Param('receiverId') receiverId: string, @Req() req) {
    return this.friendshipsService.sendFriendRequest(req.user.id, receiverId);
  }

  @Patch('/response/:friendshipId')
  async responseFriendRequest(
    @Param('friendshipId') friendshipId: string,
    @Body() friendshipResponseDto: FriendshipResponseDto,
    @Req() req,
  ) {
    return this.friendshipsService.responseFriendRequest(
      friendshipResponseDto.response,
      req.user.id,
      friendshipId,
    );
  }

  @Delete(':friendshipId')
  async deleteFriendship(
    @Param('friendshipId') friendshipId: string,
    @Req() req,
  ): Promise<{ deletedCount: number }> {
    return this.friendshipsService.deleteFriendship(friendshipId, req.user.id);
  }

  @Get('/status/:userId')
  async getFriendshipStatus(@Param('userId') userId: string, @Req() req) {
    return this.friendshipsService.getFriendshipStatus(req.user.id, userId);
  }

  @Get(':userId')
  async getFriendships(@Param('userId') userId: string) {
    return this.friendshipsService.getFriendships(userId);
  }

  @Get('/friends/:userId')
  async getFriends(@Param('userId') userId: string) {
    return this.friendshipsService.getFriends(userId);
  }
}
