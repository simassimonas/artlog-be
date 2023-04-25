import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { User, UserDocument } from './schemas/users.schema';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { IPublicUser } from 'src/common/interfaces/public-user.interface';
import { SortDirection } from 'src/common/constants/sort-direction.enum';
import { EnumValidationPipe } from 'src/common/validator/enum-validator.pipe';
import { FriendshipsService } from './friendships/friendships.service';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import * as fs from 'fs';
import { Response, Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly friendshipsService: FriendshipsService,
  ) {}

  @Get('search')
  async searchUsers(
    @Query('query') query: string,
    @Query('sortDirection', new EnumValidationPipe(SortDirection, true))
    sortDirection: SortDirection,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<{
    users: UserDocument[];
    hasNextPage: boolean;
    nextPage: number;
  }> {
    return this.usersService.searchUsers(query, sortDirection, page, limit);
  }

  @Get(':id')
  async getUser(@Param('id') id: string): Promise<IPublicUser> {
    const user: User = await this.usersService.getUserById(id);
    const { password, ...publicUser } = user;
    return publicUser;
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.createUser(createUserDto);
  }

  @Post('profile-pic')
  @UseInterceptors(FileInterceptor('profilePic'))
  async uploadProfilePic(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png)$/,
        })
        .addMaxSizeValidator({
          maxSize: 4194304,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    profilePic: Express.Multer.File,
    @Req() req,
  ) {
    return this.usersService.updateProfilePic(req.user.id, profilePic);
  }

  @Get('images/:filename')
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    const filepath = `./images/users/${filename}`;

    if (!fs.existsSync(filepath)) {
      res.status(404).send('Image not found');
    }

    // Read the file as a buffer
    const file = fs.readFileSync(filepath);

    // Set the Content-Type header based on the file type
    const ext = filename.split('.').pop();
    const contentType = `image/${ext}`;
    res.set('Content-Type', contentType);

    res.send(file);
  }

  @Patch()
  async updateUser(
    @Req() req,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.updateUser(req.user.id, updateUserDto);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<{ deletedCount: number }> {
    return this.usersService.deleteUser(id);
  }

  @Get(':userId/friends')
  async getFriends(@Param('userId') userId: string) {
    return this.friendshipsService.getFriends(userId);
  }
}
