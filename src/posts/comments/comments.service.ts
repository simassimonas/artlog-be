import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import * as moment from 'moment';
import { Response } from 'express';
import { FriendshipsService } from 'src/users/friendships/friendships.service';
import { FilterQuery, Schema } from 'mongoose';
import { UsersService } from 'src/users/users.service';
import { CommentsRepository } from './comments.repository';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { CommentDocument } from '../schemas/comment.schema';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly friendshipsService: FriendshipsService,
    private readonly usersService: UsersService,
  ) {}

  async createComment(
    userId,
    postId,
    createCommentDto: CreateCommentDto,
  ): Promise<CommentDocument> {
    const post = { userId, postId, likes: [], ...createCommentDto };
    return this.commentsRepository.create(post);
  }

  async deleteComment(userId, commentId): Promise<{ deletedCount: number }> {
    const comment = await this.commentsRepository.findById(commentId);

    if (userId != comment.userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this comment',
      );
    }

    return this.commentsRepository.deleteOne(commentId);
  }

  async getPostComments(postId): Promise<CommentDocument[]> {
    const filterQuery: FilterQuery<CommentDocument> = { postId: postId };
    const sortQuery = { createdAt: -1 };
    return this.commentsRepository.find(filterQuery, sortQuery);
  }

  async toggleLike(
    commentId: string,
    userId: string,
    like: boolean,
  ): Promise<CommentDocument> {
    const action = like ? '$addToSet' : '$pull';

    return this.commentsRepository.findOneAndUpdate(
      { _id: commentId },
      { [action]: { likes: userId } },
    );
  }
}
