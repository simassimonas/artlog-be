import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';
import { Post as PostSchema } from './schemas/post.schema';

@UseGuards(JwtAuthGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async createPost(@Body() post: CreatePostDto, @Req() req, @Res() res) {
    if (!(await this.postsService.canPost(req.user.id, post.timezone, res)))
      return;

    try {
      const createdPost = await this.postsService.createPost(req.user.id, post);
      res.status(201).json(createdPost);
    } catch (error) {
      res.status(500).json(error.message);
    }
  }

  @Get('users/:userId')
  async getPostsByUser(@Param('userId') userId: string): Promise<PostSchema[]> {
    return this.postsService.getPostsByUser(userId);
  }

  @Get()
  async getAllPosts(): Promise<PostSchema[]> {
    return this.postsService.getAllPosts();
  }
}
