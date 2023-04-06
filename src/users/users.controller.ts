import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { User } from './schemas/users.schema';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { IPublicUser } from 'src/common/interfaces/public-user.interface';
import { SortDirection } from 'src/common/constants/sort-direction.enum';
import { EnumValidationPipe } from 'src/common/validator/enum-validator.pipe';
import { SortUsersBy } from 'src/common/constants/sort-users-by.enum';
import { Role } from 'src/common/constants/role.enum';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async getUser(@Param('id') id: string): Promise<IPublicUser> {
    const user: User = await this.usersService.getUserById(id);
    const { password, ...publicUser } = user;
    return publicUser;
  }

  @Get()
  async getUsers(
    @Query('filter') filter: string,
    @Query('sortDirection', new EnumValidationPipe(SortDirection, true))
    sortDirection: SortDirection,
    @Query('sortBy', new EnumValidationPipe(SortUsersBy, true))
    sortBy: SortUsersBy,
    @Query('skip') skip: number,
    @Query('limit') limit: number,
  ): Promise<{}> {
    return this.usersService.getUsersTable(
      filter,
      sortDirection,
      sortBy,
      skip,
      limit,
    );
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.createUser(createUserDto);
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<{ deletedCount: number }> {
    return this.usersService.deleteUser(id);
  }
}
