import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';
import { PostDocument, Post as PostSchema } from './schemas/post.schema';

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

  @Patch(':postId/like')
  async likePost(
    @Param('postId') postId: string,
    @Req() req,
  ): Promise<PostDocument> {
    return this.postsService.toggleLike(postId, req.user.id, true);
  }

  @Patch(':postId/unlike')
  async unlikePost(
    @Param('postId') postId: string,
    @Req() req,
  ): Promise<PostDocument> {
    return this.postsService.toggleLike(postId, req.user.id, false);
  }

  @Get('feed')
  async getFeed(
    @Req() req,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<{
    posts: PostDocument[];
    hasNextPage: boolean;
    nextPage: number;
  }> {
    return this.postsService.getFeed(req.user.id, page, limit);
  }

  @Get('profile/:userId')
  async getProfileFeed(
    @Req() req,
    @Param('userId') userId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<{
    posts: PostDocument[];
    hasNextPage: boolean;
    nextPage: number;
  }> {
    return this.postsService.getProfileFeed(req.user.id, userId, page, limit);
  }

  @Get('search')
  async getSearchedPosts(
    @Req() req,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('query') query: string,
  ): Promise<{
    posts: PostDocument[];
    hasNextPage: boolean;
    nextPage: number;
  }> {
    return this.postsService.getSearch(req.user.id, query, page, limit);
  }

  @Delete(':postId')
  async deletePost(
    @Req() req,
    @Param('postId') postId: string,
  ): Promise<PostDocument> {
    return this.postsService.deletePost(postId, req.user.id);
  }

  @Get(':postId')
  async getPost(
    @Req() req,
    @Param('postId') postId: string,
  ): Promise<PostDocument> {
    return this.postsService.getPost(postId, req.user.id);
  }
}
