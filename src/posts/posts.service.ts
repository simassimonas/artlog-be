import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsRepository } from './posts.repository';
import { Post, PostDocument } from './schemas/post.schema';
import * as moment from 'moment';
import { Response } from 'express';
import { FriendshipsService } from 'src/users/friendships/friendships.service';
import { FilterQuery, Schema } from 'mongoose';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly friendshipsService: FriendshipsService,
    private readonly usersService: UsersService,
  ) {}

  async canPost(userId: string, timezone: string, res: Response) {
    const lastPost = await this.postsRepository.findOne(
      { userId },
      { createdAt: -1 },
    );

    if (!lastPost) {
      // first post, allow
      return true;
    }

    const lastPostDay = moment
      .utc(lastPost.createdAt)
      .utcOffset(Number(lastPost.timezone))
      .startOf('day');
    const currentDayInLastPostTimezone = moment
      .utc()
      .utcOffset(Number(lastPost.timezone))
      .startOf('day');

    if (
      lastPost.timezone === timezone &&
      currentDayInLastPostTimezone.isSame(lastPostDay)
    ) {
      // same timezone, same day, deny post

      const currentTime = moment().utc().utcOffset(Number(timezone));
      const endOfDay = currentTime.clone().endOf('day');
      const hoursLeftTillPost = Math.round(
        moment.duration(endOfDay.diff(currentTime)).asHours(),
      );
      res.status(403).json({
        timezoneChanged: false,
        timeUntilPost: hoursLeftTillPost,
      });
      return false;
    }

    const currentDateInUtc = moment.utc();
    const hoursSinceLastPost = currentDateInUtc.diff(
      lastPost.createdAt,
      'hours',
    );
    if (lastPost.timezone !== timezone && hoursSinceLastPost < 24) {
      // timezone changed and not enough time passed, deny post

      res.status(403).json({
        timezoneChanged: true,
        timeUntilPost: 24 - hoursSinceLastPost,
      });
      return false;
    }

    // allow post
    return true;
  }

  async createPost(userId, createPostDto: CreatePostDto): Promise<Post> {
    const post = { userId, likes: [], ...createPostDto };
    return this.postsRepository.create(post);
  }

  async getPostsByUser(userId: string): Promise<Post[]> {
    return this.postsRepository.find({ userId });
  }

  async getAllPosts(): Promise<Post[]> {
    return this.postsRepository.findAll();
  }

  async getFeed(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{
    posts: PostDocument[];
    hasNextPage: boolean;
    nextPage: number;
  }> {
    const friends = await this.friendshipsService.getFriends(userId);
    const friendsIds = friends.map((friend) => friend._id);
    const userIds = [userId, ...friendsIds];

    const filterQuery: FilterQuery<PostDocument> = { userId: { $in: userIds } };
    const sortQuery = { createdAt: -1 };

    return this.getPaginatedPosts(filterQuery, sortQuery, page, limit);
  }

  async getProfileFeed(
    requesterId: string,
    profileId: string,
    page: number,
    limit: number,
  ): Promise<{
    posts: PostDocument[];
    hasNextPage: boolean;
    nextPage: number;
  }> {
    const profileUser = await this.usersService.getUserById(profileId);

    if (!profileUser) {
      throw new BadRequestException('User not found');
    }

    const isPrivate =
      profileUser?.isPrivate === undefined ? false : profileUser.isPrivate;

    if (isPrivate && requesterId !== profileId) {
      const friendshipStatus =
        await this.friendshipsService.getFriendshipStatus(
          requesterId,
          profileUser._id.toString(),
        );

      if (friendshipStatus && friendshipStatus.status !== 'accepted') {
        throw new ForbiddenException(
          'Profile is private and requester is not a friend',
        );
      }
    }

    const filterQuery: FilterQuery<PostDocument> = { userId: profileId };
    const sortQuery = { createdAt: -1 };

    return this.getPaginatedPosts(filterQuery, sortQuery, page, limit);
  }

  async getPaginatedPosts(
    filterQuery: FilterQuery<PostDocument>,
    sortQuery: any,
    page: number,
    limit: number,
  ): Promise<{
    posts: PostDocument[];
    hasNextPage: boolean;
    nextPage: number;
  }> {
    const skip = page * limit;

    const posts = await this.postsRepository.find(
      filterQuery,
      sortQuery,
      {},
      skip,
      limit,
    );

    const hasNextPage =
      (await this.postsRepository.find(filterQuery, {}, {}, skip + limit, 1))
        .length > 0;

    return {
      posts,
      hasNextPage,
      nextPage: hasNextPage ? page + 1 : null,
    };
  }

  async toggleLike(
    postId: string,
    userId: string,
    like: boolean,
  ): Promise<PostDocument> {
    const action = like ? '$addToSet' : '$pull';

    return this.postsRepository.findOneAndUpdate(
      { _id: postId },
      { [action]: { likes: userId } },
    );
  }

  async deletePost(postId: string, userId: string): Promise<PostDocument> {
    const post = await this.postsRepository.findById(postId);

    if (userId != post.userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this comment',
      );
    }

    return this.postsRepository.deleteOne({ _id: postId });
  }
}
