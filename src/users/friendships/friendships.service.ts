import { BadRequestException, Injectable } from '@nestjs/common';
import { Friendship, FriendshipDocument } from '../schemas/friendships.schema';
import { FriendshipsRepository } from './friendships.repository';
import { UsersRepository } from '../users.repository';
import { User, UserDocument } from '../schemas/users.schema';
import { EFriendshipResponse } from 'src/common/constants/friendship-response.enum';

@Injectable()
export class FriendshipsService {
  constructor(
    private readonly friendshipsRepository: FriendshipsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async sendFriendRequest(
    senderId: string,
    receiverId: string,
  ): Promise<Friendship> {
    if (senderId == receiverId) {
      throw new BadRequestException(
        'senderId and receiverId must be different',
      );
    }

    const existingFriendship =
      await this.friendshipsRepository.findFriendshipByUsers(
        senderId,
        receiverId,
      );

    if (existingFriendship) {
      throw new BadRequestException('Friendship already exists');
    }

    return this.friendshipsRepository.create({
      senderId,
      receiverId,
      status: 'pending',
    });
  }

  async responseFriendRequest(
    response: EFriendshipResponse,
    userId: string,
    friendshipId: string,
  ) {
    const friendship: any = await this.friendshipsRepository.findOneById(
      friendshipId,
    );

    if (!friendship) {
      throw new BadRequestException('Friendship request not found');
    }

    if (friendship.status != 'pending') {
      throw new BadRequestException('Friendship is already accepted');
    }

    switch (response) {
      case EFriendshipResponse.ACCEPT:
        return this.acceptFriendRequest(friendship, userId);
      case EFriendshipResponse.DECLINE:
        return this.declineFriendRequest(friendship, userId);
      case EFriendshipResponse.CANCEL:
        return this.cancelFriendRequest(friendship, userId);
      default:
        throw new BadRequestException('Invalid friendship status');
    }
  }

  async acceptFriendRequest(
    friendship: any,
    receiverId: string,
  ): Promise<Friendship> {
    if (friendship.receiverId._id != receiverId) {
      throw new BadRequestException(
        'You need to be a receiver to accept friendship',
      );
    }

    return this.friendshipsRepository.update(friendship._id, {
      status: 'accepted',
    });
  }

  async declineFriendRequest(friendship: any, receiverId: string) {
    if (friendship.receiverId._id != receiverId) {
      throw new BadRequestException(
        'You need to be a receiver to decline friendship',
      );
    }

    return this.friendshipsRepository.delete(friendship._id);
  }

  async cancelFriendRequest(friendship: any, senderId: string) {
    if (friendship.senderId._id != senderId) {
      throw new BadRequestException(
        'You need to be a sender to decline friendship',
      );
    }

    return this.friendshipsRepository.delete(friendship._id);
  }

  async deleteFriendship(friendshipId: string, userId: string) {
    const friendship: any = await this.friendshipsRepository.findOneById(
      friendshipId,
    );

    if (!friendship) {
      throw new BadRequestException('Friendship request not found');
    }

    if (
      friendship.senderId._id != userId &&
      friendship.receiverId._id != userId
    ) {
      throw new BadRequestException('Cant delete other peoples friendships');
    }

    return this.friendshipsRepository.delete(friendship._id);
  }

  async getFriendships(userId: string): Promise<Friendship[]> {
    return this.friendshipsRepository.findFriendshipsByUserId(userId);
  }

  async getFriends(userId: string): Promise<UserDocument[]> {
    const friendships: any =
      await this.friendshipsRepository.findAcceptedFriendshipsByUserId(userId);

    const friends: UserDocument[] = [];

    for (const friendship of friendships) {
      if (friendship.receiverId._id == userId) {
        friends.push(friendship.senderId);
      } else {
        friends.push(friendship.receiverId);
      }
    }

    return friends;
  }

  async getFriendshipStatus(
    senderId: string,
    receiverId: string,
  ): Promise<FriendshipDocument | null> {
    return this.friendshipsRepository.findFriendshipByUsers(
      senderId,
      receiverId,
    );
  }
}
