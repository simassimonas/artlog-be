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
import { ENotificationType } from 'src/common/constants/notification-type.enum';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';
import { PostsService } from '../posts.service';

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly friendshipsService: FriendshipsService,
    private readonly usersService: UsersService,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly postsService: PostsService,
  ) {}

  async createComment(
    userId,
    postId,
    createCommentDto: CreateCommentDto,
  ): Promise<CommentDocument> {
    const newComment = { userId, postId, likes: [], ...createCommentDto };
    const comment = await this.commentsRepository.create(newComment);

    const post: any = await this.postsService.getPost(postId, userId);
    const postAuthorId = post.userId._id.toString();
    if (userId != postAuthorId) {
      this.notificationsGateway.sendNotification(
        userId,
        postAuthorId,
        ENotificationType.COMMENT,
        postId,
      );
    }

    return comment;
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
