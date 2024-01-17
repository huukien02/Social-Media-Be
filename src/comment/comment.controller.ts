import { Controller, Post, Body, Param, Req } from '@nestjs/common';
import { CommentService } from './comment.service';
import { ApiBody, ApiHeader } from '@nestjs/swagger';
import { CommentDto } from 'src/DTO';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('create')
  @ApiHeader({
    name: 'Token',
    required: true,
  })
  @ApiBody({ type: CommentDto })
  async createComment(@Body() payload: string, @Req() req: any) {
    const dataCurrentUser = req.user;
    await this.commentService.createComment(payload, dataCurrentUser);
  }
}
