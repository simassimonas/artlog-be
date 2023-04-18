import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Comment, CommentDocument } from '../schemas/comment.schema';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private commentModule: Model<CommentDocument>,
  ) {}

  async create(post: Comment): Promise<CommentDocument> {
    const newPost = new this.commentModule(post);
    return newPost.save();
  }

  async findById(id: string): Promise<CommentDocument> {
    return this.commentModule.findById(id).lean();
  }

  async findAll(): Promise<CommentDocument[]> {
    return this.commentModule.find().populate(['artId', 'userId']).lean();
  }

  async find(
    filterQuery: FilterQuery<CommentDocument>,
    sortQuery: any = {},
    projectionQuery: any = {},
    skip?: number,
    limit?: number,
  ): Promise<any[]> {
    const query = this.commentModule
      .find(filterQuery, projectionQuery)
      .sort(sortQuery)
      .populate(['userId'])
      .lean();

    if (skip !== undefined && limit !== undefined) {
      query.skip(skip).limit(limit);
    }

    return query.exec();
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<Comment>,
    update: Partial<Comment>,
  ): Promise<CommentDocument> {
    return this.commentModule
      .findOneAndUpdate(filterQuery, update, {
        new: true,
      })
      .lean();
  }

  async deleteOne(
    filterQuery: FilterQuery<CommentDocument>,
  ): Promise<{ deletedCount: number }> {
    return this.commentModule.findOneAndDelete(filterQuery).lean();
  }

  async findOne(
    filterQuery: FilterQuery<CommentDocument>,
    sortQuery: any = {},
  ): Promise<any> {
    return this.commentModule
      .findOne(filterQuery)
      .sort(sortQuery)
      .populate('artId')
      .lean();
  }
}
