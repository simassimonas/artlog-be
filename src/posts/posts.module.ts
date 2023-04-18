import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsController } from './posts.controller';
import { PostsRepository } from './posts.repository';
import { PostsService } from './posts.service';
import { Post, PostSchema } from './schemas/post.schema';
import { UsersModule } from 'src/users/users.module';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { CommentsService } from './comments/comments.service';
import { CommentsRepository } from './comments/comments.repository';
import { CommentsController } from './comments/comments.controller';

@Module({
  imports: [
    HttpModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
  ],
  controllers: [PostsController, CommentsController],
  providers: [
    PostsService,
    PostsRepository,
    CommentsService,
    CommentsRepository,
  ],
})
export class PostsModule {}
