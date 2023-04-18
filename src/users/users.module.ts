import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/users.schema';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from 'src/auth/auth.module';
import { FriendshipsRepository } from './friendships/friendships.repository';
import { Friendship, FriendshipSchema } from './schemas/friendships.schema';
import { FriendshipsController } from './friendships/friendships.controller';
import { FriendshipsService } from './friendships/friendships.service';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Friendship.name, schema: FriendshipSchema },
    ]),
  ],
  providers: [
    UsersService,
    UsersRepository,
    FriendshipsService,
    FriendshipsRepository,
  ],
  exports: [UsersService, FriendshipsService],
  controllers: [UsersController, FriendshipsController],
})
export class UsersModule {}
