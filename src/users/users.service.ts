import { ConflictException, Injectable } from '@nestjs/common';
import { FilterQuery, Schema } from 'mongoose';
import { Role } from 'src/common/constants/role.enum';
import { SortDirection } from 'src/common/constants/sort-direction.enum';
import { SortUsersBy } from 'src/common/constants/sort-users-by.enum';
import { IPublicUser } from 'src/common/interfaces/public-user.interface';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { User } from './schemas/users.schema';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly UsersRepository: UsersRepository) {}

  async getUserById(id: string): Promise<User> {
    return this.UsersRepository.findOne({ _id: id });
  }

  async getUserByUsername(username: string): Promise<User> {
    return this.UsersRepository.findOne({ username: username });
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

    const users: User[] = await this.find(
      _filter,
      sortBy,
      sortDirection,
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

  async find(
    UsersFilterQuery?: FilterQuery<User>,
    sortBy?: SortUsersBy,
    sortDirection?: SortDirection,
    skip?: number,
    limit?: number,
  ): Promise<User[]> {
    return this.UsersRepository.find(
      UsersFilterQuery,
      sortBy,
      sortDirection,
      skip,
      limit,
    );
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
    });
  }

  async updateUser(id: string, UserUpdates: UpdateUserDto): Promise<User> {
    return this.UsersRepository.findOneAndUpdate({ id }, UserUpdates);
  }

  async deleteUser(id: string): Promise<{ deletedCount: number }> {
    return this.UsersRepository.findOneAndDelete({ id });
  }
}
