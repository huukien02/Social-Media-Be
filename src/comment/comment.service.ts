import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { Post } from 'src/post/post.entity';
import { User } from 'src/users/user.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createComment(payload: any, dataCurrentUser: any): Promise<any> {
    const userId = dataCurrentUser?.user.id;
    const { postId, content } = payload;
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    const comment = new Comment();
    comment.content = content;
    comment.user = user;
    comment.post = post;

    await this.commentRepository.save(comment);
    return {
      status: HttpStatus.OK,
      message: 'Create Comment Success',
    };
  }
}
