import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/users.schema';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule), MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [UsersService, UsersRepository,],
  exports: [UsersService],
  controllers: [UsersController]
})
export class UsersModule { }
