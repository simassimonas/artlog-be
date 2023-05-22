import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { CommentDocument } from '../schemas/comment.schema';

@UseGuards(JwtAuthGuard)
@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async createComment(
    @Body() comment: CreateCommentDto,
    @Param('postId') postId: string,
    @Req() req,
  ) {
    return this.commentsService.createComment(req.user.id, postId, comment);
  }

  @Delete(':commentId')
  async deleteComment(
    @Param('commentId') commentId: string,
    @Req() req,
  ): Promise<{ deletedCount: number }> {
    return this.commentsService.deleteComment(req.user.id, commentId);
  }

  @Patch(':commentId/like')
  async likePost(
    @Param('commentId') commentId: string,
    @Req() req,
  ): Promise<CommentDocument> {
    return this.commentsService.toggleLike(commentId, req.user.id, true);
  }

  @Patch(':commentId/unlike')
  async unlikePost(
    @Param('commentId') commentId: string,
    @Req() req,
  ): Promise<CommentDocument> {
    return this.commentsService.toggleLike(commentId, req.user.id, false);
  }

  @Get()
  async getPostComments(
    @Param('postId') postId: string,
    @Req() req,
  ): Promise<CommentDocument[]> {
    return this.commentsService.getPostComments(postId);
  }
}
