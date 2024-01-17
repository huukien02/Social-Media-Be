import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { PostsService } from './post.service';
import { ApiBody, ApiHeader, ApiProperty, ApiTags } from '@nestjs/swagger';
class payLoadCreatePostDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;
}
@ApiTags('posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostsService) {}

  @Get()
  @ApiHeader({
    name: 'Token',
    required: true,
  })
  getPost(): any {
    return this.postService.findAll();
  }

  @Post('create')
  @ApiHeader({
    name: 'Token',
    required: true,
  })
  @ApiBody({ type: payLoadCreatePostDto })
  create(
    @Req() req: any,
    @Body() body: { title: string; content: string; userId: any },
  ): any {
    const dataCurrentUser = req.user;
    return this.postService.create(body, dataCurrentUser);
  }

  @Get(':id')
  @ApiHeader({
    name: 'Token',
    required: true,
  })
  getPostById(@Param('id') id: number): any {
    return this.postService.findById(id);
  }

  @Get('reaction/:postId/:type')
  addReactionToPost(
    @Req() req: any,
    @Param('postId') postId: any,
    @Param('type') type: any,
  ) {
    const dataCurrentUser = req.user;
    return this.postService.addReactionToPost(dataCurrentUser, postId, type);
  }
}
