import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ArtModule } from './art/art.module';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [
    MongooseModule.forRoot(`${process.env.MONGO_DB}`),
    UsersModule,
    AuthModule,
    ArtModule,
    PostsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
