import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { Any, Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { Reaction } from './post.reaction.entity';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Reaction)
    private readonly reactionRepository: Repository<Reaction>,
  ) {}

  async findAll(): Promise<any> {
    try {
      const postsWithCommentsAndReactions = await this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.user', 'user')
        .leftJoinAndSelect('post.comments', 'comment')
        .leftJoinAndSelect('comment.user', 'commentUser')
        .leftJoinAndSelect('post.reactions', 'reaction')
        .getMany();

      const formattedPosts = postsWithCommentsAndReactions.map((post) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        image: post.image,
        created_at: post.created_at,
        user: {
          id: post.user.id,
          username: post.user.username,
          avatar: post.user.avatar,
        },
        comments: post.comments.map((comment) => ({
          id: comment.id,
          content: comment.content,
          created_at: comment.created_at,
          user: {
            id: comment.user.id,
            username: comment.user.username,
            avatar: comment.user.avatar,
          },
        })),
        reactions: post.reactions.map((reaction) => ({
          id: reaction.id,
          type: reaction.type,
        })),
        reactionsCount: calculateReactionsCount(post.reactions),
      }));

      return { list_post: formattedPosts };
    } catch (error) {
      throw new Error('Find Post Failed');
    }
  }

  async create(payload: any, dataCurrentUser: any): Promise<any> {
    try {
      let imageNew = null;
      const userId = dataCurrentUser?.user?.id;
      const { title, content, image } = payload;

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'User not found',
        };
      }

      if (image) {
        const uploadDir = path.join(__dirname, '../../', 'posts_images');
        const baseUrl = 'http://localhost:3000/posts_images/';
        const fileName = `${user.username}_${Date.now()}${path.extname(
          image?.originalname,
        )}`;

        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, image.buffer);
        imageNew = `${baseUrl}${fileName}`;
      }

      const newPost = new Post();
      newPost.title = title;
      newPost.content = content;
      newPost.image = imageNew;
      newPost.user = user;

      await this.postRepository.save(newPost);

      return {
        status: HttpStatus.OK,
        message: 'Create Post Success',
      };
    } catch (error) {
      console.error('Error during post creation:', error);
      throw new Error('Create Failed');
    }
  }

  async findById(id: any) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    return { post };
  }

  async addReactionToPost(
    dataCurrentUser: any,
    postId: any,
    type: any,
  ): Promise<any> {
    const userId = dataCurrentUser?.user?.id;
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    let existingReaction = await this.reactionRepository.findOne({
      where: {
        userId,
        post: { id: postId },
      },
    });

    if (!existingReaction) {
      existingReaction = new Reaction();
      existingReaction.type = type;
      existingReaction.post = post;
      existingReaction.user = user;
    } else {
      existingReaction.type = type;
    }

    await this.reactionRepository.save(existingReaction);
    await this.postRepository.save(post);
  }
}

function calculateReactionsCount(reactions: any) {
  const reactionsCount = {};

  reactions.forEach((reaction) => {
    reactionsCount[reaction.type] = (reactionsCount[reaction.type] || 0) + 1;
  });

  return reactionsCount;
}
