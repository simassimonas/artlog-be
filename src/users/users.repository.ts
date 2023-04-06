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

  async findOne(userFilterQuery: FilterQuery<User>): Promise<User> {
    return this.UserModel.findOne(userFilterQuery).lean();
  }

  async exists(
    userFilterQuery: FilterQuery<User>,
  ): Promise<{ _id: Schema.Types.ObjectId } | null> {
    return this.UserModel.exists(userFilterQuery);
  }

  async find(
    usersFilterQuery: FilterQuery<User>,
    sortBy: SortUsersBy = SortUsersBy.username,
    sortDirection: SortDirection = SortDirection.asc,
    skip?: number,
    limit?: number,
  ): Promise<User[]> {
    return this.UserModel.find(usersFilterQuery)
      .sort({ [sortBy]: sortDirection })
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
  ): Promise<User> {
    return this.UserModel.findOneAndUpdate(usersFilterQuery, user, {
      new: true,
    }).lean();
  }

  async findOneAndDelete(
    usersFilterQuery: FilterQuery<User>,
  ): Promise<{ deletedCount: number }> {
    return this.UserModel.deleteOne(usersFilterQuery).lean();
  }
}
