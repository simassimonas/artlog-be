import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Friendship, FriendshipDocument } from '../schemas/friendships.schema';

@Injectable()
export class FriendshipsRepository {
  constructor(
    @InjectModel(Friendship.name)
    private friendshipsModel: Model<FriendshipDocument>,
  ) {}

  async create(friendship: Friendship): Promise<FriendshipDocument> {
    const newFriendship = new this.friendshipsModel(friendship);
    return newFriendship.save();
  }

  async findOneById(friendshipId: string): Promise<FriendshipDocument> {
    return this.friendshipsModel
      .findById(friendshipId)
      .populate('senderId')
      .populate('receiverId');
  }

  async findFriendshipByUsers(
    senderId: string,
    receiverId: string,
  ): Promise<FriendshipDocument | null> {
    return this.friendshipsModel
      .findOne({
        $or: [
          { senderId: senderId, receiverId: receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      })
      .populate('senderId')
      .populate('receiverId');
  }

  async findFriendshipsByUserId(userId: string): Promise<FriendshipDocument[]> {
    return this.friendshipsModel
      .find({
        $or: [{ senderId: userId }, { receiverId: userId }],
      })
      .populate('senderId')
      .populate('receiverId');
  }

  async findPendingFriendshipsByUserId(
    userId: Types.ObjectId,
  ): Promise<FriendshipDocument[]> {
    return this.friendshipsModel
      .find({
        $or: [
          { senderId: userId, status: 'pending' },
          { receiverId: userId, status: 'pending' },
        ],
      })
      .populate('senderId')
      .populate('receiverId');
  }

  async findAcceptedFriendshipsByUserId(
    userId: string,
  ): Promise<FriendshipDocument[]> {
    return this.friendshipsModel
      .find({
        $or: [
          { senderId: userId, status: 'accepted' },
          { receiverId: userId, status: 'accepted' },
        ],
      })
      .populate('senderId')
      .populate('receiverId');
  }

  async update(
    friendshipId: Types.ObjectId,
    update: Partial<FriendshipDocument>,
  ): Promise<Friendship> {
    return this.friendshipsModel
      .findByIdAndUpdate(friendshipId, update, {
        new: true,
      })
      .populate('senderId')
      .populate('receiverId');
  }

  async delete(friendshipId: string): Promise<{ deletedCount: number }> {
    return this.friendshipsModel.deleteOne({ _id: friendshipId });
    //const result = await this.friendshipsModel.deleteOne({ _id: friendshipId });
    //return { deletedCount: result.deletedCount };
  }
}
