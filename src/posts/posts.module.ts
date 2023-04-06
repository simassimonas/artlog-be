import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsController } from './posts.controller';
import { PostsRepository } from './posts.repository';
import { PostsService } from './posts.service';
import { Post, PostSchema } from './schemas/post.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
  ],
  controllers: [PostsController],
  providers: [PostsService, PostsRepository],
})
export class PostsModule {}
