import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Schema } from 'mongoose';
import { User, UserDocument } from './schemas/users.schema';
import * as bcrypt from 'bcrypt';
import { SortUsersBy } from 'src/common/constants/sort-users-by.enum';
import { SortDirection } from 'src/common/constants/sort-direction.enum';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}

  async findOne(
    userFilterQuery: FilterQuery<User>,
    projectioQuery: any = {},
  ): Promise<UserDocument> {
    return this.UserModel.findOne(userFilterQuery, projectioQuery).lean();
  }

  async exists(
    userFilterQuery: FilterQuery<User>,
  ): Promise<{ _id: Schema.Types.ObjectId } | null> {
    return this.UserModel.exists(userFilterQuery);
  }

  async find(
    usersFilterQuery: FilterQuery<User>,
    sortQuery: any = {},
    skip?: number,
    limit?: number,
    selectFields?: string, // example 'firstName lastName username email'
  ): Promise<UserDocument[]> {
    return this.UserModel.find(usersFilterQuery)
      .select(selectFields)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async count(usersFilterQuery?: FilterQuery<User>): Promise<number> {
    return this.UserModel.count(usersFilterQuery);
  }

  async create(user: User): Promise<User> {
    user.password = await bcrypt.hash(user.password, 1);
    const newUser = new this.UserModel(user);
    return (await newUser.save()).toObject();
  }

  async findOneAndUpdate(
    usersFilterQuery: FilterQuery<User>,
    user: Partial<User>,
  ): Promise<UserDocument> {
    return this.UserModel.findOneAndUpdate(usersFilterQuery, user, {
      new: true,
    }).lean();
  }

  async updateMany(
    filterQuery: FilterQuery<User>,
    updateQuery: any,
  ): Promise<{
    acknowledged: boolean;
    modifiedCount: number;
    upsertedId: string;
    upsertedCount: number;
    matchedCount: number;
  }> {
    return this.UserModel.updateMany(filterQuery, updateQuery).lean();
  }

  async findOneAndDelete(
    usersFilterQuery: FilterQuery<User>,
  ): Promise<{ deletedCount: number }> {
    return this.UserModel.deleteOne(usersFilterQuery).lean();
  }
}
