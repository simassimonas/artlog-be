import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async create(post: Post): Promise<Post> {
    const newPost = new this.postModel(post);
    return newPost.save();
  }

  async findById(id: string): Promise<PostDocument> {
    return this.postModel.findById(id).lean();
  }

  async findAll(): Promise<Post[]> {
    return this.postModel.find().populate(['artId', 'userId']).lean();
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<Post>,
    update: Partial<Post>,
  ): Promise<PostDocument> {
    return this.postModel
      .findOneAndUpdate(filterQuery, update, {
        new: true,
      })
      .lean();
  }

  async deleteOne(filterQuery: FilterQuery<Post>): Promise<PostDocument> {
    return this.postModel.findOneAndDelete(filterQuery).lean();
  }

  async findOne(
    filterQuery: FilterQuery<Post>,
    sortQuery: any = {},
  ): Promise<any> {
    return this.postModel
      .findOne(filterQuery)
      .sort(sortQuery)
      .populate('artId')
      .lean();
  }

  // async find(
  //   filterQuery: FilterQuery<Post>,
  //   sortQuery: any = {},
  //   projectionQuery: any = {},
  // ): Promise<any[]> {
  //   return this.postModel
  //     .find(filterQuery, projectionQuery)
  //     .sort(sortQuery)
  //     .populate(['artId', 'userId'])
  //     .lean();
  // }

  async find(
    filterQuery: FilterQuery<Post>,
    sortQuery: any = {},
    projectionQuery: any = {},
    skip?: number,
    limit?: number,
  ): Promise<any[]> {
    const query = this.postModel
      .find(filterQuery, projectionQuery)
      .sort(sortQuery)
      .populate(['artId', 'userId'])
      .lean();

    if (skip !== undefined && limit !== undefined) {
      query.skip(skip).limit(limit);
    }

    return query.exec();
  }
}
