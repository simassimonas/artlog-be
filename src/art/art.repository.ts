import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Art, ArtDocument } from './schemas/art.schema';

@Injectable()
export class ArtRepository {
  constructor(
    @InjectModel(Art.name) private readonly artModel: Model<ArtDocument>,
  ) {}

  async create(
    name: string,
    userId: string,
    prompt: string,
  ): Promise<ArtDocument> {
    const art = new this.artModel({ name, userId, prompt });
    return await art.save();
  }

  async findAll(): Promise<ArtDocument[]> {
    return await this.artModel.find().exec();
  }

  async findOneById(id: string): Promise<ArtDocument> {
    return await this.artModel.findById(id).exec();
  }

  async update(
    id: string,
    name: string,
    userId: string,
    prompt: string,
  ): Promise<ArtDocument> {
    const art = await this.artModel.findById(id).exec();
    art.name = name;
    art.userId = userId;
    art.prompt = prompt;
    return await art.save();
  }

  async delete(id: string): Promise<ArtDocument> {
    return await this.artModel.findByIdAndDelete(id).exec();
  }

  async find(
    filterQuery: FilterQuery<ArtDocument>,
    sortQuery: any = {},
    skip?: number,
    limit?: number,
  ): Promise<any[]> {
    const query = this.artModel
      .find(filterQuery)
      .sort(sortQuery)
      .populate(['userId'])
      .lean();

    if (skip !== undefined && limit !== undefined) {
      query.skip(skip).limit(limit);
    }

    return query.exec();
  }
}
