import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsRepository } from './posts.repository';
import { Post, PostDocument } from './schemas/post.schema';
import * as moment from 'moment';
import { Response } from 'express';

@Injectable()
export class PostsService {
  constructor(private readonly postRepository: PostsRepository) {}

  async canPost(userId: string, timezone: string, res: Response) {
    const lastPost = await this.postRepository.findOne(
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
    return this.postRepository.create(post);
  }

  async getPostsByUser(userId: string): Promise<Post[]> {
    return this.postRepository.find({ userId });
  }

  async getAllPosts(): Promise<Post[]> {
    return this.postRepository.findAll();
  }
}
