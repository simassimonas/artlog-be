import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { FilterQuery, Schema } from 'mongoose';
import { Role } from 'src/common/constants/role.enum';
import { SortDirection } from 'src/common/constants/sort-direction.enum';
import { SortUsersBy } from 'src/common/constants/sort-users-by.enum';
import { IPublicUser } from 'src/common/interfaces/public-user.interface';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as fs from 'fs';
import { User, UserDocument } from './schemas/users.schema';
import { UsersRepository } from './users.repository';
import * as path from 'path';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FriendshipsService } from './friendships/friendships.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly UsersRepository: UsersRepository,
    private readonly friendshipsService: FriendshipsService,
  ) {}

  async getUserById(id: string): Promise<UserDocument> {
    return this.UsersRepository.findOne({ _id: id });
  }

  async getUserByUsername(username: string): Promise<UserDocument> {
    return this.UsersRepository.findOne({ username: username });
  }

  async getUserWithPasswordByUsername(username: string): Promise<UserDocument> {
    return this.UsersRepository.findOne(
      { username: username },
      { password: true },
    );
  }

  async checkIfUsernameExists(
    username: string,
  ): Promise<{ _id: Schema.Types.ObjectId } | null> {
    return this.UsersRepository.exists({ username: username });
  }

  async count(UsersFilterQuery?: FilterQuery<User>): Promise<number> {
    return this.UsersRepository.count(UsersFilterQuery);
  }

  async getUsers(): Promise<User[]> {
    return this.UsersRepository.find({});
  }

  async getUsersTable(
    filter: string,
    sortDirection: SortDirection,
    sortBy: SortUsersBy,
    skip: number,
    limit: number,
  ): Promise<{}> {
    let _filter = {};
    if (filter) {
      _filter = {
        $or: [
          { email: new RegExp(filter, 'i') },
          { username: new RegExp(filter, 'i') },
          { name: new RegExp(filter, 'i') },
          { sex: new RegExp(filter, 'i') },
        ],
      };
    }

    const _skip: number = Math.abs(skip) || 0;
    const _limit = Math.abs(limit) || Number(process.env.MAX_DB_RECORDS);
    const total = await this.count(_filter);

    const sortQuery = { [sortBy]: sortDirection };

    const users: User[] = await this.UsersRepository.find(
      _filter,
      sortQuery,
      _skip,
      _limit,
    );
    const publicUsers: IPublicUser[] = users.map((user) => {
      const { password, ...publicUser } = user;
      return publicUser;
    });

    return {
      total,
      skip: _skip,
      limit: _limit,
      users: publicUsers,
    };
  }

  async searchUsers(
    query: string = '',
    sortDirection: SortDirection,
    page: number,
    limit: number,
    userId: string,
    onlyVisible: boolean = false,
  ): Promise<{
    users: UserDocument[];
    hasNextPage: boolean;
    nextPage: number;
  }> {
    const filterQuery: FilterQuery<UserDocument> = {
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
      ],
    };

    if (onlyVisible && userId) {
      const visibleUsersIds = await this.friendshipsService.getVisibleUsersIds(
        userId,
      );
      filterQuery._id = { $in: visibleUsersIds };
    }

    const sortQuery = { createdAt: -1 };

    return this.getPaginatedUsers(filterQuery, sortQuery, page, limit);
  }

  async getPaginatedUsers(
    filterQuery: FilterQuery<UserDocument>,
    sortQuery: any,
    page: number,
    limit: number,
  ): Promise<{
    users: UserDocument[];
    hasNextPage: boolean;
    nextPage: number;
  }> {
    const skip = page * limit;

    const users = await this.UsersRepository.find(
      filterQuery,
      sortQuery,
      skip,
      limit,
    );

    const hasNextPage =
      (await this.UsersRepository.find(filterQuery, {}, skip + limit, 1))
        .length > 0;

    return {
      users,
      hasNextPage,
      nextPage: hasNextPage ? page + 1 : null,
    };
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    if (await this.checkIfUsernameExists(createUserDto.username))
      throw new ConflictException({ message: 'Username already exists' });

    return this.UsersRepository.create({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      username: createUserDto.username,
      email: createUserDto.email,
      password: createUserDto.password,
      credits: Number(process.env.USER_INITIAL_CREDITS),
    });
  }

  async updateUser(id: string, UserUpdates: any): Promise<UserDocument> {
    return this.UsersRepository.findOneAndUpdate({ id }, UserUpdates);
  }

  async deleteUser(id: string): Promise<{ deletedCount: number }> {
    return this.UsersRepository.findOneAndDelete({ id });
  }

  async updateProfilePic(
    userId: string,
    profilePic: Express.Multer.File,
  ): Promise<UserDocument> {
    try {
      const filename = this.saveImageToFileSystem(profilePic);
      return this.UsersRepository.findOneAndUpdate(
        { _id: userId },
        { profilePic: filename },
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update profile picture',
      );
    }
  }

  saveImageToFileSystem(image: Express.Multer.File): string {
    const fileExtension = path.extname(image.originalname);
    const filename = uuidv4() + fileExtension;
    const filepath = `./images/users/${filename}`;
    fs.writeFileSync(filepath, image.buffer);

    return filename;
  }

  async addDailyCreditsForAllUsers(amount: number, maxAmount: number) {
    await this.UsersRepository.updateMany(
      {
        $or: [
          { credits: { $lt: maxAmount } },
          { credits: { $exists: false } },
          { credits: null },
        ],
      },
      [
        {
          $set: {
            credits: {
              $min: [
                { $add: [{ $ifNull: ['$credits', 0] }, amount] },
                maxAmount,
              ],
            },
          },
        },
      ],
    );
  }
}
